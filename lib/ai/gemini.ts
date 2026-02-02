import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '../prisma'
import { getSystemConfig } from '../config'
import type { AnalysisInput, AnalysisResult } from '../rules/engine'

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.error('[GEMINI] !!!! ERRO CRÍTICO: GEMINI_API_KEY não configurada no .env !!!!')
} else {
  console.log('[GEMINI] API Key configurada (primeiros 10 chars):', apiKey.substring(0, 10) + '...')
}
const genAI = new GoogleGenerativeAI(apiKey || '')

// Tipos para análise personalizada
export type ThemeQuestion = {
  key: string
  label: string
  type: string
  weight: number
  isFixed: boolean
  options?: Array<{ value: string; label: string }>
}

export type PersonalizedAnalysisInput = {
  formData: Record<string, any>
  userName: string | null
  matchName: string
  matchGender: 'ELE' | 'ELA'
  userObjective: string
  themeName: string
  themeDisplayName: string
  themeDescription: string | null
  questions: ThemeQuestion[]
  fixedQuestions: ThemeQuestion[]
  ruleBasedResult: AnalysisResult
}

// Função para registrar uso do Gemini no banco de dados
async function logGeminiUsage(params: {
  userId?: string
  endpoint: string
  tokensInput?: number
  tokensOutput?: number
  success: boolean
  errorMessage?: string
}) {
  try {
    // Estimar custo: Gemini 1.5 Flash = $0.075/1M input tokens, $0.30/1M output tokens
    // Convertendo para centavos de dólar
    const inputCost = ((params.tokensInput || 0) / 1000000) * 7.5 // centavos
    const outputCost = ((params.tokensOutput || 0) / 1000000) * 30 // centavos
    const estimatedCost = Math.round(inputCost + outputCost)

    await prisma.geminiUsageLog.create({
      data: {
        userId: params.userId || null,
        endpoint: params.endpoint,
        tokensInput: params.tokensInput || 0,
        tokensOutput: params.tokensOutput || 0,
        estimatedCost,
        success: params.success,
        errorMessage: params.errorMessage || null,
      }
    })
    console.log(`[GEMINI] Log registrado: ${params.endpoint}, tokens: ${params.tokensInput}/${params.tokensOutput}, sucesso: ${params.success}`)
  } catch (error: any) {
    console.error('[GEMINI] Erro ao registrar log de uso:', error.message)
    // Não falhar a operação principal por causa do log
  }
}

export async function analyzeWithGemini(
  input: AnalysisInput,
  ruleBasedResult: AnalysisResult,
  userId?: string
): Promise<AnalysisResult> {
  const promptTokenEstimate = 0
  let outputTokenEstimate = 0
  
  try {
    // Buscar modelo configurado no admin
    const config = await getSystemConfig()
    // Usar gemini-2.0-flash como padrão (gemini-1.5-flash foi descontinuado)
    let modelName = config.geminiModelAnalysis || 'gemini-2.0-flash'
    // Corrigir modelos antigos que não existem mais
    if (modelName === 'gemini-1.5-flash' || modelName === 'gemini-1.5-pro') {
      console.log(`[GEMINI] Modelo ${modelName} descontinuado, usando gemini-2.0-flash`)
      modelName = 'gemini-2.0-flash'
    }
    console.log(`[GEMINI] Usando modelo para análise: ${modelName}`)
    
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: 4096, // Limitar resposta para evitar excesso
        temperature: 0.7,
      },
    })

    const prompt = buildAnalysisPrompt(input, ruleBasedResult)
    
    // Log para debug de tamanho do prompt
    const inputTokens = Math.ceil(prompt.length / 4)
    console.log(`[GEMINI] Prompt de análise: ~${inputTokens} tokens estimados (${prompt.length} chars)`)
    console.log('[GEMINI] Gerando análise completa (FREE + PREMIUM) com IA...')
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    outputTokenEstimate = Math.ceil(text.length / 4)
    console.log(`[GEMINI] Resposta recebida: ${text.length} chars (~${outputTokenEstimate} tokens)`)

    // Registrar uso com sucesso
    await logGeminiUsage({
      userId,
      endpoint: 'analyze',
      tokensInput: inputTokens,
      tokensOutput: outputTokenEstimate,
      success: true,
    })

    // Parse JSON response from Gemini
    const aiAnalysis = parseGeminiResponse(text, ruleBasedResult)

    // Merge AI insights with rule-based results
    return mergeAnalysisResults(ruleBasedResult, aiAnalysis)
  } catch (error: any) {
    console.error('[GEMINI] Erro ao analisar com Gemini:', error.message)
    console.error('[GEMINI] Stack:', error.stack)
    
    // Registrar erro
    await logGeminiUsage({
      userId,
      endpoint: 'analyze',
      tokensInput: promptTokenEstimate,
      tokensOutput: 0,
      success: false,
      errorMessage: error.message,
    })
    
    // Log mais detalhado para erros de quota/limite
    if (error.message?.includes('quota') || error.message?.includes('limit') || error.message?.includes('token')) {
      console.error('[GEMINI] Possível erro de limite de tokens ou quota da API')
    }
    
    // Fallback para análise baseada em regras
    return ruleBasedResult
  }
}

function buildAnalysisPrompt(input: AnalysisInput, ruleBasedResult: AnalysisResult): string {
  const stageLabels = {
    FIRST_CHAT: 'Primeira conversa',
    TALKING: 'Conversando regularmente',
    POST_DATE: 'Após primeiro encontro',
  }

  const alertLabels: Record<string, string> = {
    LOVE_BOMBING: 'Love bombing (excesso de elogios/carinho no início)',
    CIUME_CEDO: 'Ciúme prematuro',
    VITIMISMO: 'Vitimismo constante',
    HOSTILIDADE: 'Hostilidade ou agressividade',
    CONTRADICOES: 'Contradições frequentes',
    SUMICO_POS_INTIMIDADE: 'Sumiço após intimidade',
    TRIANGULACAO: 'Triangulação (mencionar ex ou outras pessoas)',
  }

  const alerts = input.sinais_alerta.map((a) => alertLabels[a] || a).join(', ') || 'Nenhum'

  const matchName = input.nome_match?.trim() || 'match'
  const generoLabel = input.genero_match === 'ELE' ? 'ele' : 'ela'
  
  return `Você é um especialista em relacionamentos que analisa padrões comportamentais em relacionamentos modernos.

CONTEXTO DA ANÁLISE:
${input.nome_match ? `- Nome do match: "${input.nome_match}"` : ''}
- Gênero do match: ${generoLabel}
- Estágio: ${input.estagio ? stageLabels[input.estagio] : 'Não informado'}
- Objetivo do usuário: ${input.objetivo_usuario}
- Ritmo desejado: ${input.ritmo_usuario}
- Iniciativa: ${input.iniciativa === 'VOCE' ? 'Você sempre inicia' : input.iniciativa === 'MATCH' ? 'Match sempre inicia' : 'Equilibrado'}
- Frequência de contato: ${input.frequencia_contato}
- Tempo de resposta: ${input.tempo_resposta}
- Encontro marcado: ${input.encontro_marcado}
- Cancelou encontro: ${input.cancelou_encontro || 'Não informado'}
- Remarcou com data: ${input.remarcou_com_data}
- Curiosidade por você: ${input.curiosidade_por_voce}
- Respeito a limites: ${input.respeito_limites}
- Disponível só madrugada: ${input.disponivel_so_madrugada}
- Fala sobre futuro: ${input.fala_futuro}
- Sinais de alerta: ${alerts}
${input.texto_bio_match ? `- Bio do match: "${input.texto_bio_match}"` : ''}
${input.trecho_chat ? `- Trecho de conversa: "${input.trecho_chat}"` : ''}

SCORES BASE (calculados por regras):
- Reciprocidade: ${ruleBasedResult.scores.reciprocidade}/100
- Constância: ${ruleBasedResult.scores.constancia}/100
- Ação no mundo real: ${ruleBasedResult.scores.acao_mundo_real}/100
- Respeito: ${ruleBasedResult.scores.respeito}/100
- Coerência: ${ruleBasedResult.scores.coerencia}/100
- Disponibilidade: ${ruleBasedResult.scores.disponibilidade}/100
- Risco de ghosting: ${ruleBasedResult.scores.risco_ghosting}/100
- Risco de enrolação: ${ruleBasedResult.scores.risco_enrolacao}/100
- Compatibilidade com objetivo: ${ruleBasedResult.scores.compat_objetivo}/100

TAREFA:
Crie uma análise completa e envolvente que:
1. Seja genuinamente útil e acionável
2. Use linguagem natural e empática
3. Use o nome "${matchName}" ao se referir ao match para personalizar a análise
4. Identifique padrões sutis que regras não capturam
5. Para FREE: Crie curiosidade sobre insights mais profundos (para incentivar upgrade)
6. Para PREMIUM: Seja ainda mais detalhada e profunda
7. Seja específica e baseada em evidências

IMPORTANTE:
- O free_teaser deve ser envolvente mas limitado, criando curiosidade
- O premium deve ser completo, detalhado e acionável
- Use os scores base como referência, mas enriqueça com insights contextuais
- ATENÇÃO COM INFORMAÇÕES CONFLITANTES: Seus textos DEVEM ser coerentes com os scores. Por exemplo:
  * Se risco de enrolação é ALTO, NÃO diga que ${matchName} "não está enrolando" ou "demonstra comprometimento"
  * Se risco de ghosting é ALTO, NÃO diga que ${matchName} "está presente" ou "é constante"
  * Se reciprocidade é BAIXA, NÃO diga que ${matchName} "demonstra interesse equilibrado"
  * Sempre alinhe o tom e conteúdo dos textos com os valores numéricos dos scores

FORMATO DE RESPOSTA (JSON):
Você deve retornar APENAS melhorias de texto (title, description) para os elementos existentes. NÃO altere a estrutura.

{
  "hypotheses_enhancements": [
    {
      "key": "EXPLORANDO",
      "title": "Título envolvente e específico (2-5 palavras)",
      "description": "Descrição detalhada e empática (2-3 parágrafos)"
    }
  ],
  "flags_enhancements": [
    {
      "title": "Título impactante (2-5 palavras)",
      "description": "Descrição detalhada e acionável (1-2 parágrafos)"
    }
  ],
  "premium_enhancements": {
    "executive_summary_bullets": [
      "Bullet point 1",
      "Bullet point 2"
    ],
    "hypotheses": [
      {
        "key": "EXPLORANDO",
        "title": "Título envolvente",
        "description": "Descrição detalhada"
      }
    ],
    "flags": [
      {
        "title": "Título",
        "description": "Descrição"
      }
    ]
  }
}

Responda APENAS com o JSON válido, sem markdown ou texto adicional.`
}

function parseGeminiResponse(text: string, fallback: AnalysisResult): Partial<AnalysisResult> {
  try {
    // Remove markdown code blocks if present
    let jsonText = text.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '')
    }

    const parsed = JSON.parse(jsonText)

    // Apenas melhorias de texto, não alterar estrutura
    return {
      hypotheses_enhancements: parsed.hypotheses_enhancements || [],
      flags_enhancements: parsed.flags_enhancements || [],
      premium_enhancements: parsed.premium_enhancements || {}
    } as any
  } catch (error: any) {
    console.error('[GEMINI] Erro ao fazer parse da resposta:', error.message)
    console.error('[GEMINI] Texto recebido:', text.substring(0, 500))
    return {}
  }
}

function mergeAnalysisResults(
  ruleBased: AnalysisResult,
  aiAnalysis: any
): AnalysisResult {
  // Aplicar melhorias de texto apenas
  const enhancedHypotheses = [...ruleBased.hypotheses_top3]
  if (aiAnalysis.hypotheses_enhancements) {
    for (const enhancement of aiAnalysis.hypotheses_enhancements) {
      const hypothesis = enhancedHypotheses.find(h => h.key === enhancement.key)
      if (hypothesis) {
        if (enhancement.title) hypothesis.title = enhancement.title
        if (enhancement.description) hypothesis.description = enhancement.description
      }
    }
  }

  const enhancedRedFlags = [...ruleBased.red_flags]
  const enhancedGreenFlags = [...ruleBased.green_flags]
  if (aiAnalysis.flags_enhancements) {
    for (let i = 0; i < Math.min(aiAnalysis.flags_enhancements.length, enhancedRedFlags.length + enhancedGreenFlags.length); i++) {
      const enhancement = aiAnalysis.flags_enhancements[i]
      if (i < enhancedRedFlags.length) {
        if (enhancement.title) enhancedRedFlags[i].title = enhancement.title
        if (enhancement.description) enhancedRedFlags[i].description = enhancement.description
      } else {
        const greenIndex = i - enhancedRedFlags.length
        if (greenIndex < enhancedGreenFlags.length) {
          if (enhancement.title) enhancedGreenFlags[greenIndex].title = enhancement.title
          if (enhancement.description) enhancedGreenFlags[greenIndex].description = enhancement.description
        }
      }
    }
  }

  // Aplicar melhorias no premium report
  const enhancedPremium = { ...ruleBased.premium_report }
  if (aiAnalysis.premium_enhancements) {
    if (aiAnalysis.premium_enhancements.executive_summary_bullets) {
      enhancedPremium.executive_summary = aiAnalysis.premium_enhancements.executive_summary_bullets
    }
    if (aiAnalysis.premium_enhancements.hypotheses) {
      for (const enhancement of aiAnalysis.premium_enhancements.hypotheses) {
        const hypothesis = enhancedHypotheses.find(h => h.key === enhancement.key)
        if (hypothesis) {
          if (enhancement.title) hypothesis.title = enhancement.title
          if (enhancement.description) hypothesis.description = enhancement.description
        }
      }
    }
  }

  // Atualizar free teaser com hipótese melhorada
  const enhancedFreeTeaser = {
    ...ruleBased.free_teaser,
    hypothesis_1: enhancedHypotheses[0] || null,
    red_flag: enhancedRedFlags[0],
    green_flag: enhancedGreenFlags[0]
  }

  return {
    ...ruleBased,
    hypotheses_top3: enhancedHypotheses,
    red_flags: enhancedRedFlags,
    green_flags: enhancedGreenFlags,
    free_teaser: enhancedFreeTeaser,
    premium_report: enhancedPremium
  }
}

// ============================================
// ANÁLISE PERSONALIZADA COM IA
// ============================================

export async function generatePersonalizedAnalysis(
  input: PersonalizedAnalysisInput,
  userId?: string
): Promise<AnalysisResult> {
  let inputTokens = 0
  let outputTokens = 0
  
  console.log('========================================')
  console.log('[GEMINI] ===== INICIANDO generatePersonalizedAnalysis =====')
  console.log('[GEMINI] matchName:', input.matchName)
  console.log('[GEMINI] userName:', input.userName)
  console.log('[GEMINI] themeName:', input.themeName)
  console.log('[GEMINI] userId:', userId)
  console.log('========================================')
  
  try {
    // Buscar modelo configurado no admin
    console.log('[GEMINI] Buscando configuração do modelo...')
    const config = await getSystemConfig()
    // Usar gemini-2.0-flash como padrão (gemini-1.5-flash foi descontinuado)
    let modelName = config.geminiModelAnalysis || 'gemini-2.0-flash'
    // Corrigir modelos antigos que não existem mais
    if (modelName === 'gemini-1.5-flash' || modelName === 'gemini-1.5-pro') {
      console.log(`[GEMINI] Modelo ${modelName} descontinuado, usando gemini-2.0-flash`)
      modelName = 'gemini-2.0-flash'
    }
    console.log(`[GEMINI] Modelo a ser usado: ${modelName}`)
    
    console.log('[GEMINI] Criando instância do modelo...')
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.8,
      },
    })

    console.log('[GEMINI] Construindo prompt...')
    const prompt = buildPersonalizedAnalysisPrompt(input)
    
    inputTokens = Math.ceil(prompt.length / 4)
    console.log(`[GEMINI] Prompt construído: ~${inputTokens} tokens (${prompt.length} chars)`)
    console.log('[GEMINI] Primeiros 500 chars do prompt:', prompt.substring(0, 500))
    
    console.log('[GEMINI] ===== CHAMANDO API GEMINI =====')
    const result = await model.generateContent(prompt)
    console.log('[GEMINI] API Gemini respondeu!')
    
    const response = await result.response
    const text = response.text()
    
    outputTokens = Math.ceil(text.length / 4)
    console.log(`[GEMINI] Resposta recebida: ${text.length} chars (~${outputTokens} tokens)`)
    console.log('[GEMINI] Primeiros 500 chars da resposta:', text.substring(0, 500))

    // Registrar uso com sucesso
    await logGeminiUsage({
      userId,
      endpoint: 'personalized-analysis',
      tokensInput: inputTokens,
      tokensOutput: outputTokens,
      success: true,
    })

    // Parse e merge da resposta
    console.log('[GEMINI] Fazendo parse da resposta...')
    const aiEnhancements = parsePersonalizedResponse(text)
    console.log('[GEMINI] aiEnhancements:', aiEnhancements ? 'OK' : 'NULL')
    if (aiEnhancements) {
      console.log('[GEMINI] Headline da IA:', aiEnhancements.personalized_headline)
      console.log('[GEMINI] Executive summary itens:', aiEnhancements.executive_summary?.length)
    }
    
    console.log('[GEMINI] Mesclando resultado...')
    const finalResult = mergePersonalizedAnalysis(input.ruleBasedResult, aiEnhancements, input)
    console.log('[GEMINI] ===== ANÁLISE PERSONALIZADA COMPLETA =====')
    console.log('========================================')
    
    return finalResult
  } catch (error: any) {
    console.error('========================================')
    console.error('[GEMINI] ===== ERRO NA ANÁLISE =====')
    console.error('[GEMINI] Mensagem:', error.message)
    console.error('[GEMINI] Nome:', error.name)
    console.error('[GEMINI] Stack:', error.stack?.substring(0, 500))
    console.error('========================================')
    
    // Registrar erro
    await logGeminiUsage({
      userId,
      endpoint: 'personalized-analysis',
      tokensInput: inputTokens,
      tokensOutput: 0,
      success: false,
      errorMessage: error.message,
    })
    
    // Fallback: retornar análise baseada em regras com personalização básica
    console.log('[GEMINI] Usando fallback (motor de regras)...')
    return addBasicPersonalization(input.ruleBasedResult, input)
  }
}

function buildPersonalizedAnalysisPrompt(input: PersonalizedAnalysisInput): string {
  const { formData, userName, matchName, matchGender, userObjective, themeName, themeDisplayName, themeDescription, questions, fixedQuestions, ruleBasedResult } = input
  
  const genderLabel = matchGender === 'ELE' ? 'ele' : 'ela'
  // Usar apenas o primeiro nome do usuário para personalização
  const userFirstName = userName ? userName.split(' ')[0] : null
  const userLabel = userFirstName || 'o usuário'
  
  // Construir resumo das respostas do formulário
  const allQuestions = [...fixedQuestions, ...questions]
  const answersContext = allQuestions.map(q => {
    const answer = formData[q.key]
    if (!answer) return null
    
    // Encontrar label da resposta se for uma opção
    let answerLabel = answer
    if (q.options && q.options.length > 0) {
      const option = q.options.find(o => o.value === answer)
      if (option) answerLabel = option.label
    }
    
    return `- ${q.label}: ${answerLabel}`
  }).filter(Boolean).join('\n')
  
  // Scores do motor de regras
  const scores = ruleBasedResult.scores

  return `Você é uma COACH de relacionamentos especializada em análise de comportamento em apps de namoro.
Você está criando uma análise PROFUNDA, PERSONALIZADA e ÚNICA para ${userLabel} sobre ${matchName}.

CONTEXTO DO TEMA: "${themeDisplayName}"
${themeDescription ? `Descrição: ${themeDescription}` : ''}

DADOS DO MATCH:
- Nome: ${matchName}
- Gênero: ${genderLabel}
- O que ${userLabel} busca: ${userObjective === 'NAMORO' ? 'namoro sério' : userObjective === 'CASUAL' ? 'algo casual' : 'conhecer melhor'}

RESPOSTAS DETALHADAS DO FORMULÁRIO:
${answersContext}

MÉTRICAS DE COMPORTAMENTO (calculadas com escala 10-90, nunca 0% ou 100%):
- Reciprocidade (${scores.reciprocidade}/90): ${scores.reciprocidade >= 70 ? `${matchName} demonstra investimento equilibrado` : scores.reciprocidade >= 50 ? `${matchName} investe de forma moderada` : `${matchName} parece investir menos que ${userLabel}`}
- Constância (${scores.constancia}/90): ${scores.constancia >= 70 ? `${matchName} mantém padrão consistente` : scores.constancia >= 50 ? `${matchName} tem altos e baixos` : `${matchName} é imprevisível`}
- Ação no mundo real (${scores.acao_mundo_real}/90): ${scores.acao_mundo_real >= 70 ? `${matchName} demonstra interesse em encontros reais` : scores.acao_mundo_real >= 50 ? `${matchName} hesita em encontros` : `${matchName} evita sair do virtual`}
- Respeito (${scores.respeito}/90): ${scores.respeito >= 70 ? `${matchName} respeita limites` : scores.respeito >= 50 ? `${matchName} às vezes ultrapassa limites` : `${matchName} não respeita limites adequadamente`}
- Risco de ghosting: ${scores.risco_ghosting}% ${scores.risco_ghosting >= 60 ? '(ALTO - atenção!)' : scores.risco_ghosting >= 40 ? '(moderado)' : '(baixo)'} (mín 10%, máx 90%)
- Risco de enrolação: ${scores.risco_enrolacao}% ${scores.risco_enrolacao >= 60 ? '(ALTO - atenção!)' : scores.risco_enrolacao >= 40 ? '(moderado)' : '(baixo)'} (mín 10%, máx 90%)
- Compatibilidade com objetivo: ${scores.compat_objetivo}% ${scores.compat_objetivo >= 65 ? '(BOM)' : scores.compat_objetivo >= 45 ? '(parcial)' : '(BAIXO - incompatível)'} (mín 10%, máx 90%)

IMPORTANTE: Os scores seguem escala de 10-90 porque nunca temos 100% de certeza (nem positiva nem negativa) sobre relacionamentos. Use esses valores proporcionalmente nas suas análises.

HIPÓTESE IDENTIFICADA: ${ruleBasedResult.hypotheses_top3[0]?.key || 'A DEFINIR'}
${ruleBasedResult.red_flags.length > 0 ? `RED FLAGS: ${ruleBasedResult.red_flags.map(f => f.title).join(', ')}` : ''}
${ruleBasedResult.green_flags.length > 0 ? `GREEN FLAGS: ${ruleBasedResult.green_flags.map(f => f.title).join(', ')}` : ''}

TAREFA:
Crie uma análise RICA e DETALHADA que:
1. Use o nome "${matchName}" em TODAS as frases (nunca use "o match", "essa pessoa", "ele/ela")
2. Seja baseada ESPECIFICAMENTE nas respostas do formulário acima
3. Forneça INSIGHTS ÚNICOS que só fazem sentido para esse caso específico
4. Explique O PORQUÊ de cada conclusão (conecte aos dados)
5. Seja empática mas HONESTA - não minimize red flags se existirem
6. Inclua AÇÕES PRÁTICAS e específicas para ${userLabel}

FORMATO DE RESPOSTA (JSON):
{
  "personalized_headline": "Headline impactante de no máximo 10 palavras que resume a situação com ${matchName}. Use emojis apropriados (💚 para positivo, ⚠️ para alerta, 🚨 para crítico). Exemplos: '💚 ${matchName} demonstra interesse genuíno', '⚠️ ${matchName} apresenta sinais mistos', '🚨 Cuidado: ${matchName} pode estar enrolando'",
  
  "executive_summary": [
    "Análise principal sobre ${matchName} baseada nos dados (2-3 frases conectando as evidências)",
    "Ponto de atenção ou destaque positivo específico sobre ${matchName}",
    "O que os padrões de ${matchName} indicam sobre as intenções",
    "Recomendação principal para ${userLabel} (seja específico)",
    "Perspectiva sobre o potencial do relacionamento com ${matchName}"
  ],
  
  "hypothesis_title": "Título curto e impactante da hipótese principal sobre ${matchName}",
  
  "hypothesis_description": "Descrição DETALHADA de 3-4 parágrafos explicando: (1) O que os comportamentos de ${matchName} indicam, (2) Por que isso é relevante dado o objetivo de ${userLabel}, (3) Quais evidências do formulário suportam essa hipótese, (4) O que isso significa na prática para o relacionamento",
  
  "risk_explanation": "Explicação detalhada dos riscos identificados em ${matchName}. Se risco de ghosting ou enrolação for alto, explique especificamente QUAIS comportamentos indicam isso. Se for baixo, explique o que ${matchName} faz de diferente. Seja específico e cite as respostas do formulário.",
  
  "compatibility_explanation": "Análise detalhada de compatibilidade entre o que ${userLabel} busca (${userObjective === 'NAMORO' ? 'namoro sério' : userObjective === 'CASUAL' ? 'algo casual' : 'conhecer melhor'}) e o que ${matchName} parece oferecer. Mencione pontos de alinhamento e desalinhamento específicos.",
  
  "validation_checklist": [
    "Nas próximas 48h, observe se ${matchName} [comportamento específico baseado nas respostas]",
    "Teste: [ação específica que ${userLabel} pode fazer para validar as intenções de ${matchName}]",
    "Preste atenção quando ${matchName} [situação específica relacionada aos riscos identificados]",
    "Avalie se ${matchName} [comportamento que confirma ou refuta a hipótese]",
    "Observe como ${matchName} reage quando você [ação específica]"
  ],
  
  "next_actions": [
    "Ação imediata: [o que ${userLabel} deve fazer agora em relação a ${matchName}]",
    "Ação de teste: [como testar as intenções de ${matchName} de forma prática]",
    "Ação de proteção: [como ${userLabel} pode se proteger emocionalmente enquanto avalia ${matchName}]"
  ],
  
  "encouragement_message": "Mensagem de 2-3 frases encorajando ${userLabel}. Se a análise for positiva, celebre. Se for negativa, seja acolhedor mas honesto. Sempre termine com uma nota de empoderamento sobre ${userLabel} merecer alguém alinhado com seus objetivos."
}

REGRAS CRÍTICAS:
- NUNCA use "o match", "essa pessoa", "ele/ela" - SEMPRE use "${matchName}"
- Cada campo deve ter conteúdo ÚNICO baseado nas respostas específicas
- Seja ESPECÍFICO - cite os dados do formulário para justificar suas análises
- Tom: profissional, empático, mas DIRETO quando houver red flags
- Se os scores são baixos ou há red flags, NÃO minimize - seja honesto
- ATENÇÃO COM INFORMAÇÕES CONFLITANTES: Seus textos DEVEM ser coerentes com os scores calculados. Por exemplo:
  * Se o risco de enrolação é ALTO, NÃO diga que ${matchName} "não está enrolando" ou "demonstra comprometimento"
  * Se o risco de ghosting é ALTO, NÃO diga que ${matchName} "está presente" ou "é constante"
  * Se a reciprocidade é BAIXA, NÃO diga que ${matchName} "demonstra interesse equilibrado"
  * Sempre alinhe o tom e conteúdo dos textos com os valores numéricos dos scores

Responda APENAS com o JSON válido:`
}

function parsePersonalizedResponse(text: string): any {
  console.log('[GEMINI PARSE] Iniciando parse da resposta...')
  console.log('[GEMINI PARSE] Tamanho do texto:', text.length)
  
  try {
    let jsonText = text.trim()
    console.log('[GEMINI PARSE] Texto começa com:', jsonText.substring(0, 50))
    
    if (jsonText.startsWith('```json')) {
      console.log('[GEMINI PARSE] Removendo markdown ```json')
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (jsonText.startsWith('```')) {
      console.log('[GEMINI PARSE] Removendo markdown ```')
      jsonText = jsonText.replace(/```\n?/g, '')
    }
    
    console.log('[GEMINI PARSE] JSON limpo começa com:', jsonText.substring(0, 100))
    const parsed = JSON.parse(jsonText)
    console.log('[GEMINI PARSE] Parse OK! Keys:', Object.keys(parsed))
    return parsed
  } catch (error: any) {
    console.error('[GEMINI PARSE] ERRO no parse:', error.message)
    console.error('[GEMINI PARSE] Texto que falhou:', text.substring(0, 1000))
    return null
  }
}

function mergePersonalizedAnalysis(
  ruleBased: AnalysisResult,
  aiEnhancements: any,
  input: PersonalizedAnalysisInput
): AnalysisResult {
  console.log('[GEMINI MERGE] Iniciando merge...')
  console.log('[GEMINI MERGE] aiEnhancements:', aiEnhancements ? 'presente' : 'null')
  
  if (!aiEnhancements) {
    console.log('[GEMINI MERGE] Sem enhancements, usando basicPersonalization')
    return addBasicPersonalization(ruleBased, input)
  }
  
  const { matchName, userName } = input
  
  // Atualizar free teaser com headline personalizada
  const enhancedFreeTeaser = {
    ...ruleBased.free_teaser,
    headline: aiEnhancements.personalized_headline || ruleBased.free_teaser.headline,
    nome_match: matchName,
  }
  
  // Atualizar hipóteses com textos personalizados
  const enhancedHypotheses = ruleBased.hypotheses_top3.map((h, idx) => {
    if (idx === 0 && aiEnhancements.hypothesis_title) {
      return {
        ...h,
        title: aiEnhancements.hypothesis_title,
        description: aiEnhancements.hypothesis_description || h.description
      }
    }
    return h
  })
  
  // Atualizar premium report
  const enhancedPremium = {
    ...ruleBased.premium_report,
    executive_summary: aiEnhancements.executive_summary || ruleBased.premium_report.executive_summary,
    hypothesis_1: enhancedHypotheses[0] || ruleBased.premium_report.hypothesis_1,
    hypothesis_2: enhancedHypotheses[1] || ruleBased.premium_report.hypothesis_2,
    hypothesis_3: enhancedHypotheses[2] || ruleBased.premium_report.hypothesis_3,
    full_risk_map: {
      ...ruleBased.premium_report.full_risk_map,
      explanations: aiEnhancements.risk_explanation 
        ? [aiEnhancements.risk_explanation, ...ruleBased.premium_report.full_risk_map.explanations.slice(1)]
        : ruleBased.premium_report.full_risk_map.explanations
    },
    compatibility_explained: {
      ...ruleBased.premium_report.compatibility_explained,
      explanation: aiEnhancements.compatibility_explanation || ruleBased.premium_report.compatibility_explained.explanation
    },
    validation_checklist: aiEnhancements.validation_checklist || ruleBased.premium_report.validation_checklist,
    nome_match: matchName,
  }
  
  // Atualizar next_actions
  const enhancedNextActions = aiEnhancements.next_actions || ruleBased.next_actions
  
  return {
    ...ruleBased,
    meta: {
      ...ruleBased.meta,
      nome_match: matchName,
      user_name: userName,
      personalized: true,
    },
    hypotheses_top3: enhancedHypotheses,
    next_actions: enhancedNextActions,
    free_teaser: enhancedFreeTeaser,
    premium_report: enhancedPremium,
    nome_match: matchName,
    encouragement_message: aiEnhancements.encouragement_message,
  } as AnalysisResult & { nome_match: string; encouragement_message?: string }
}

function addBasicPersonalization(
  ruleBased: AnalysisResult,
  input: PersonalizedAnalysisInput
): AnalysisResult {
  const { matchName, userName } = input
  
  // Personalização básica quando IA falha
  const personalizedHeadline = ruleBased.free_teaser.headline.replace(
    /o match|match|essa pessoa|ele\/ela/gi, 
    matchName
  )
  
  return {
    ...ruleBased,
    meta: {
      ...ruleBased.meta,
      nome_match: matchName,
      user_name: userName,
      personalized: false,
    },
    free_teaser: {
      ...ruleBased.free_teaser,
      headline: personalizedHeadline,
      nome_match: matchName,
    },
    premium_report: {
      ...ruleBased.premium_report,
      nome_match: matchName,
    },
    nome_match: matchName,
  } as AnalysisResult & { nome_match: string }
}

// ============================================
// CORREÇÃO DE ROTA - Análise de Padrões e Evolução
// ============================================

export type AnalysisDataPoint = {
  inputJson: {
    objetivo_usuario?: string
    estagio?: string
    iniciativa?: string
    frequencia_contato?: string
    tempo_resposta?: string
    encontro_marcado?: string
    cancelou_encontro?: string
    remarcou_com_data?: string
    curiosidade_por_voce?: string
    respeito_limites?: string
    disponivel_so_madrugada?: string
    fala_futuro?: string
    sinais_alerta?: string[]
  }
  scores: {
    reciprocidade?: number
    constancia?: number
    acao_mundo_real?: number
    risco_ghosting?: number
    risco_enrolacao?: number
    compat_objetivo?: number
    respeito?: number
  }
  createdAt: string
  weight?: number // Peso calculado baseado na recência
}

export type RouteCorrectionInput = {
  analyses: AnalysisDataPoint[]
  userObjective: string
  // Dados agregados para economizar tokens quando há muitas análises
  aggregatedData?: {
    totalAnalyses: number
    recentPeriod: {
      count: number
      avgScores: Record<string, number>
      commonPatterns: string[]
    }
    olderPeriod: {
      count: number
      avgScores: Record<string, number>
      commonPatterns: string[]
    }
    trends: {
      reciprocidade: 'UP' | 'STABLE' | 'DOWN'
      constancia: 'UP' | 'STABLE' | 'DOWN'
      risco_ghosting: 'UP' | 'STABLE' | 'DOWN'
      risco_enrolacao: 'UP' | 'STABLE' | 'DOWN'
      compat_objetivo: 'UP' | 'STABLE' | 'DOWN'
    }
  }
}

export type EvolutionTrend = 'IMPROVING' | 'STABLE' | 'DECLINING'

export type EvolutionAnalysis = {
  overall_trend: EvolutionTrend
  trend_description: string
  score_changes: {
    dimension: string
    label: string
    before: number
    after: number
    change: number
    trend: 'UP' | 'STABLE' | 'DOWN'
  }[]
  key_improvements: string[]
  areas_of_concern: string[]
  milestone_achieved?: string
}

export type RouteCorrectionResult = {
  alignment_status: 'ALINHADO' | 'PARCIALMENTE_ALINHADO' | 'DESALINHADO'
  pattern_summary: {
    main_pattern: string
    description: string
    evidence_count: number
    total_analyses: number
  }
  // NOVO: Análise de evolução
  evolution?: EvolutionAnalysis
  behavior_analysis: {
    strengths: string[]
    weaknesses: string[]
    blind_spots: string[]
  }
  recommendations: {
    corrective_actions: Array<{
      action: string
      priority: 'HIGH' | 'MEDIUM' | 'LOW'
      reason: string
    }>
    keep_doing: string[]
    weekly_focus: {
      focus: string
      metric: string
      goal: string
    }
  }
  encouragement?: {
    message: string
    highlights: string[]
  }
}

// Calcula peso exponencial baseado na recência da análise
// Análises mais recentes têm peso maior
function calculateTemporalWeight(createdAt: string, newestDate: Date, oldestDate: Date): number {
  const date = new Date(createdAt)
  const totalRange = newestDate.getTime() - oldestDate.getTime()
  
  if (totalRange === 0) return 1 // Se todas são do mesmo dia
  
  const position = (date.getTime() - oldestDate.getTime()) / totalRange // 0 a 1
  // Peso exponencial: análises recentes têm 3x mais peso que antigas
  return 0.5 + (position * 2.5) // Resultado: 0.5 (mais antiga) a 3.0 (mais recente)
}

// Calcula tendência baseado em valores antes/depois
function calculateTrend(before: number, after: number, threshold: number = 8): 'UP' | 'STABLE' | 'DOWN' {
  const diff = after - before
  if (diff > threshold) return 'UP'
  if (diff < -threshold) return 'DOWN'
  return 'STABLE'
}

// Prepara dados otimizados para o Gemini, agregando quando necessário
export function prepareAnalysisDataForAI(
  allAnalyses: AnalysisDataPoint[],
  maxDetailedAnalyses: number = 8
): RouteCorrectionInput {
  if (allAnalyses.length === 0) {
    throw new Error('Nenhuma análise disponível')
  }

  // Ordenar por data (mais recente primeiro)
  const sorted = [...allAnalyses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const newestDate = new Date(sorted[0].createdAt)
  const oldestDate = new Date(sorted[sorted.length - 1].createdAt)

  // Adicionar pesos às análises
  const withWeights = sorted.map(a => ({
    ...a,
    weight: calculateTemporalWeight(a.createdAt, newestDate, oldestDate)
  }))

  const userObjective = (sorted[0].inputJson.objetivo_usuario || 'CONHECER')

  // Se temos poucas análises, enviar todas com detalhes
  if (allAnalyses.length <= maxDetailedAnalyses) {
    return {
      analyses: withWeights,
      userObjective
    }
  }

  // Se temos muitas análises, agregar dados para economizar tokens
  console.log(`[GEMINI] Muitas análises (${allAnalyses.length}), agregando dados para otimizar tokens`)
  
  // Dividir em período recente (últimas 40%) e período antigo (primeiras 60%)
  const recentCutoff = Math.ceil(sorted.length * 0.4)
  const recentAnalyses = withWeights.slice(0, recentCutoff)
  const olderAnalyses = withWeights.slice(recentCutoff)

  // Calcular médias ponderadas
  const calculateWeightedAvg = (analyses: AnalysisDataPoint[], key: string): number => {
    let sum = 0
    let weightSum = 0
    for (const a of analyses) {
      const value = (a.scores as any)[key]
      const weight = a.weight || 1
      if (value !== undefined && value !== null) {
        sum += value * weight
        weightSum += weight
      }
    }
    return weightSum > 0 ? Math.round(sum / weightSum) : 50
  }

  // Extrair padrões comuns
  const extractCommonPatterns = (analyses: AnalysisDataPoint[]): string[] => {
    const patterns: Record<string, number> = {}
    for (const a of analyses) {
      const inp = a.inputJson
      if (inp.iniciativa) patterns[`inic=${inp.iniciativa}`] = (patterns[`inic=${inp.iniciativa}`] || 0) + 1
      if (inp.frequencia_contato) patterns[`freq=${inp.frequencia_contato}`] = (patterns[`freq=${inp.frequencia_contato}`] || 0) + 1
      if (inp.encontro_marcado === 'NAO') patterns['sem_encontro'] = (patterns['sem_encontro'] || 0) + 1
      if (inp.sinais_alerta) {
        for (const alerta of inp.sinais_alerta) {
          patterns[`alerta=${alerta}`] = (patterns[`alerta=${alerta}`] || 0) + 1
        }
      }
    }
    // Retornar top 5 padrões
    return Object.entries(patterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pattern]) => pattern)
  }

  const scoreKeys = ['reciprocidade', 'constancia', 'acao_mundo_real', 'risco_ghosting', 'risco_enrolacao', 'compat_objetivo']
  
  const recentAvgScores: Record<string, number> = {}
  const olderAvgScores: Record<string, number> = {}
  const trends: Record<string, 'UP' | 'STABLE' | 'DOWN'> = {}

  for (const key of scoreKeys) {
    recentAvgScores[key] = calculateWeightedAvg(recentAnalyses, key)
    olderAvgScores[key] = calculateWeightedAvg(olderAnalyses, key)
    
    // Para riscos, invertemos a lógica (menor é melhor)
    if (key.includes('risco')) {
      trends[key] = calculateTrend(olderAvgScores[key], recentAvgScores[key], 8)
      // Inverter: se risco subiu, é DOWN (ruim); se desceu, é UP (bom)
      if (trends[key] === 'UP') trends[key] = 'DOWN'
      else if (trends[key] === 'DOWN') trends[key] = 'UP'
    } else {
      trends[key] = calculateTrend(olderAvgScores[key], recentAvgScores[key], 8)
    }
  }

  // Enviar apenas as análises mais recentes detalhadas + dados agregados
  return {
    analyses: recentAnalyses.slice(0, Math.min(5, recentAnalyses.length)), // Máximo 5 detalhadas
    userObjective,
    aggregatedData: {
      totalAnalyses: allAnalyses.length,
      recentPeriod: {
        count: recentAnalyses.length,
        avgScores: recentAvgScores,
        commonPatterns: extractCommonPatterns(recentAnalyses)
      },
      olderPeriod: {
        count: olderAnalyses.length,
        avgScores: olderAvgScores,
        commonPatterns: extractCommonPatterns(olderAnalyses)
      },
      trends: trends as any
    }
  }
}

export async function analyzeRouteCorrection(
  input: RouteCorrectionInput,
  userId?: string
): Promise<RouteCorrectionResult> {
  let inputTokens = 0
  let outputTokens = 0
  
  try {
    // Buscar modelo configurado no admin
    const config = await getSystemConfig()
    const modelName = config.geminiModelRouteCorrection || 'gemini-2.0-flash'
    console.log(`[GEMINI] Usando modelo configurado para correção de rota: ${modelName}`)
    
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: 4096, // Limitar resposta para evitar excesso
        temperature: 0.7,
      },
    })
    
    const prompt = buildRouteCorrectionPrompt(input)
    
    // Log para debug de tamanho do prompt
    inputTokens = Math.ceil(prompt.length / 4) // ~4 chars per token (estimativa)
    console.log(`[GEMINI] Prompt de análise de comportamento: ~${inputTokens} tokens estimados (${prompt.length} chars)`)
    console.log(`[GEMINI] Analisando ${input.aggregatedData?.totalAnalyses || input.analyses.length} análises para análise de comportamento...`)
    if (input.aggregatedData) {
      console.log(`[GEMINI] Modo agregado: ${input.analyses.length} detalhadas + dados resumidos de ${input.aggregatedData.totalAnalyses} total`)
    }
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    outputTokens = Math.ceil(text.length / 4)
    console.log(`[GEMINI] Resposta recebida: ${text.length} chars (~${outputTokens} tokens)`)
    
    // Registrar uso com sucesso
    await logGeminiUsage({
      userId,
      endpoint: 'route-correction',
      tokensInput: inputTokens,
      tokensOutput: outputTokens,
      success: true,
    })
    
    return parseRouteCorrectionResponse(text, input)
  } catch (error: any) {
    console.error('[GEMINI] ========== ERRO DETALHADO ==========')
    console.error('[GEMINI] Mensagem:', error.message)
    console.error('[GEMINI] Nome:', error.name)
    console.error('[GEMINI] Status:', error.status)
    console.error('[GEMINI] StatusText:', error.statusText)
    
    // Registrar erro
    await logGeminiUsage({
      userId,
      endpoint: 'route-correction',
      tokensInput: inputTokens,
      tokensOutput: 0,
      success: false,
      errorMessage: error.message,
    })
    
    // Log detalhado do errorDetails (array)
    if (error.errorDetails) {
      console.error('[GEMINI] errorDetails (JSON):', JSON.stringify(error.errorDetails, null, 2))
      error.errorDetails.forEach((detail: any, idx: number) => {
        console.error(`[GEMINI] errorDetails[${idx}]:`, detail)
        if (detail['@type']) console.error(`  - @type: ${detail['@type']}`)
        if (detail.reason) console.error(`  - reason: ${detail.reason}`)
        if (detail.domain) console.error(`  - domain: ${detail.domain}`)
        if (detail.metadata) console.error(`  - metadata:`, detail.metadata)
      })
    }
    
    // Log do objeto de erro completo
    console.error('[GEMINI] Erro completo (keys):', Object.keys(error))
    console.error('[GEMINI] Erro JSON:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    console.error('[GEMINI] =====================================')
    
    throw error
  }
}

function buildRouteCorrectionPrompt(input: RouteCorrectionInput): string {
  const objectiveLabels: Record<string, string> = {
    CASUAL: 'casual',
    CONHECER: 'conhecer pessoas',
    NAMORO: 'namoro sério',
    NAMORO_SERIO: 'namoro sério'
  }
  
  const objectiveLabel = objectiveLabels[input.userObjective] || input.userObjective
  const totalAnalyses = input.aggregatedData?.totalAnalyses || input.analyses.length
  
  // Resumir análises de forma COMPACTA (reduzir tokens)
  const analysesSummary = input.analyses.map((analysis, idx) => {
    const inp = analysis.inputJson as any
    const sc = analysis.scores || {}
    const date = new Date(analysis.createdAt).toLocaleDateString('pt-BR')
    const peso = analysis.weight ? `(peso=${analysis.weight.toFixed(1)})` : ''
    
    // Formato compacto: uma linha por análise
    const alertas = inp.sinais_alerta?.length > 0 ? inp.sinais_alerta.join(',') : '-'
    
    return `#${idx + 1} ${date}${peso}: est=${inp.estagio || '-'}, inic=${inp.iniciativa || '-'}, freq=${inp.frequencia_contato || '-'}, resp=${inp.tempo_resposta || '-'}, enc=${inp.encontro_marcado || 'N'}, canc=${inp.cancelou_encontro || 'N'}, alertas=[${alertas}] | rec=${sc.reciprocidade || 50}, const=${sc.constancia || 50}, real=${sc.acao_mundo_real || 50}, ghost=${sc.risco_ghosting || 30}, enrol=${sc.risco_enrolacao || 30}, compat=${sc.compat_objetivo || 50}`
  }).join('\n')
  
  // Adicionar dados agregados se disponíveis (para muitas análises)
  let aggregatedSection = ''
  if (input.aggregatedData) {
    const agg = input.aggregatedData
    const trendEmoji = (t: string) => t === 'UP' ? '↑' : t === 'DOWN' ? '↓' : '→'
    
    aggregatedSection = `
DADOS AGREGADOS (${agg.totalAnalyses} análises total):
Período Recente (${agg.recentPeriod.count} análises):
  Médias: rec=${agg.recentPeriod.avgScores.reciprocidade}, const=${agg.recentPeriod.avgScores.constancia}, real=${agg.recentPeriod.avgScores.acao_mundo_real}, ghost=${agg.recentPeriod.avgScores.risco_ghosting}, enrol=${agg.recentPeriod.avgScores.risco_enrolacao}, compat=${agg.recentPeriod.avgScores.compat_objetivo}
  Padrões: ${agg.recentPeriod.commonPatterns.join(', ')}

Período Anterior (${agg.olderPeriod.count} análises):
  Médias: rec=${agg.olderPeriod.avgScores.reciprocidade}, const=${agg.olderPeriod.avgScores.constancia}, real=${agg.olderPeriod.avgScores.acao_mundo_real}, ghost=${agg.olderPeriod.avgScores.risco_ghosting}, enrol=${agg.olderPeriod.avgScores.risco_enrolacao}, compat=${agg.olderPeriod.avgScores.compat_objetivo}
  Padrões: ${agg.olderPeriod.commonPatterns.join(', ')}

TENDÊNCIAS:
  Reciprocidade: ${trendEmoji(agg.trends.reciprocidade)} | Constância: ${trendEmoji(agg.trends.constancia)} | Ação Real: ${trendEmoji(agg.trends.compat_objetivo)}
  Risco Ghost: ${trendEmoji(agg.trends.risco_ghosting)} | Risco Enrol: ${trendEmoji(agg.trends.risco_enrolacao)} | Compatibilidade: ${trendEmoji(agg.trends.compat_objetivo)}
`
  }
  
  return `Coach de relacionamentos analisando EVOLUÇÃO de padrões em apps de namoro.

OBJETIVO DO USUÁRIO: ${objectiveLabel}
TOTAL DE ANÁLISES: ${totalAnalyses}

ANÁLISES DETALHADAS (${input.analyses.length} mais recentes, peso=importância temporal):
${analysesSummary}
${aggregatedSection}
LEGENDA: est=estágio, inic=iniciativa, freq=frequência, resp=tempo_resposta, enc=encontro_marcado, canc=cancelou, rec=reciprocidade, const=constância, real=ação_mundo_real, ghost=risco_ghosting, enrol=risco_enrolação, compat=compatibilidade

FOCO PRINCIPAL: Avaliar se o usuário está EVOLUINDO ou REGREDINDO na atração de pessoas com as mesmas intenções que ele busca.

TAREFA: Analise padrões e EVOLUÇÃO, retorne JSON:
{
  "alignment_status": "ALINHADO|PARCIALMENTE_ALINHADO|DESALINHADO",
  "pattern_summary": {
    "main_pattern": "frase curta do padrão principal",
    "description": "2 frases explicando",
    "evidence_count": número,
    "total_analyses": ${totalAnalyses}
  },
  "evolution": {
    "overall_trend": "IMPROVING|STABLE|DECLINING",
    "trend_description": "1-2 frases sobre a evolução geral",
    "key_improvements": ["melhoria 1", "melhoria 2"],
    "areas_of_concern": ["preocupação 1", "preocupação 2"],
    "milestone_achieved": "conquista recente ou null"
  },
  "behavior_analysis": {
    "strengths": ["força 1", "força 2"],
    "weaknesses": ["fraqueza 1", "fraqueza 2"],
    "blind_spots": ["ponto cego 1"]
  },
  "recommendations": {
    "corrective_actions": [{"action": "...", "priority": "HIGH|MEDIUM|LOW", "reason": "..."}],
    "keep_doing": ["continuar fazendo 1"],
    "weekly_focus": {"focus": "...", "metric": "...", "goal": "..."}
  },
  "encouragement": {
    "message": "mensagem motivacional personalizada",
    "highlights": ["destaque positivo 1"]
  }
}

IMPORTANTE:
- Se está MELHORANDO: Celebre, destaque progressos, mantenha motivação
- Se está PIORANDO: Seja honesto mas encorajador, foque em ações corretivas
- Se está ESTÁVEL: Identifique o que pode acelerar a evolução
- Análises com PESO MAIOR (mais recentes) devem ter mais influência na avaliação

Responda APENAS JSON válido:`
}

function parseRouteCorrectionResponse(text: string, input: RouteCorrectionInput): RouteCorrectionResult {
  try {
    let jsonText = text.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '')
    }
    
    const parsed = JSON.parse(jsonText)
    
    // Validar estrutura básica
    if (!parsed.alignment_status || !parsed.pattern_summary || !parsed.recommendations) {
      throw new Error('Resposta do Gemini não contém estrutura esperada')
    }
    
    // Se a IA não retornou evolução mas temos dados agregados, calcular localmente
    if (!parsed.evolution && input.aggregatedData) {
      parsed.evolution = calculateLocalEvolution(input.aggregatedData)
    }
    
    return parsed as RouteCorrectionResult
  } catch (error: any) {
    console.error('[GEMINI] Erro ao fazer parse da análise de comportamento:', error.message)
    console.error('[GEMINI] Texto recebido:', text.substring(0, 500))
    throw error
  }
}

// Calcula evolução localmente caso a IA não retorne
function calculateLocalEvolution(aggregatedData: NonNullable<RouteCorrectionInput['aggregatedData']>): EvolutionAnalysis {
  const { recentPeriod, olderPeriod, trends } = aggregatedData
  
  const dimensionLabels: Record<string, string> = {
    reciprocidade: 'Reciprocidade',
    constancia: 'Constância',
    acao_mundo_real: 'Ação no Mundo Real',
    risco_ghosting: 'Risco de Ghosting',
    risco_enrolacao: 'Risco de Enrolação',
    compat_objetivo: 'Compatibilidade'
  }
  
  // Calcular mudanças de score
  const scoreChanges: EvolutionAnalysis['score_changes'] = []
  const improvements: string[] = []
  const concerns: string[] = []
  
  for (const [key, label] of Object.entries(dimensionLabels)) {
    const before = olderPeriod.avgScores[key] || 50
    const after = recentPeriod.avgScores[key] || 50
    const change = after - before
    const trend = trends[key as keyof typeof trends] || 'STABLE'
    
    scoreChanges.push({
      dimension: key,
      label,
      before: Math.round(before),
      after: Math.round(after),
      change: Math.round(change),
      trend
    })
    
    // Para riscos, lógica invertida
    if (key.includes('risco')) {
      if (change < -10) improvements.push(`Redução do ${label.toLowerCase()}`)
      else if (change > 10) concerns.push(`Aumento do ${label.toLowerCase()}`)
    } else {
      if (change > 10) improvements.push(`Melhora na ${label.toLowerCase()}`)
      else if (change < -10) concerns.push(`Queda na ${label.toLowerCase()}`)
    }
  }
  
  // Determinar tendência geral
  const positiveChanges = Object.values(trends).filter(t => t === 'UP').length
  const negativeChanges = Object.values(trends).filter(t => t === 'DOWN').length
  
  let overallTrend: EvolutionTrend = 'STABLE'
  let trendDescription = 'Seu padrão de comportamento está estável.'
  
  if (positiveChanges > negativeChanges + 1) {
    overallTrend = 'IMPROVING'
    trendDescription = 'Você está evoluindo! Seus padrões de seleção estão melhorando.'
  } else if (negativeChanges > positiveChanges + 1) {
    overallTrend = 'DECLINING'
    trendDescription = 'Atenção: seus padrões recentes mostram alguns retrocessos.'
  }
  
  return {
    overall_trend: overallTrend,
    trend_description: trendDescription,
    score_changes: scoreChanges,
    key_improvements: improvements.slice(0, 3),
    areas_of_concern: concerns.slice(0, 3),
    milestone_achieved: improvements.length >= 3 ? 'Múltiplas áreas em melhoria!' : undefined
  }
}
