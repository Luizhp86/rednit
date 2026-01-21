import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AnalysisInput, AnalysisResult } from '../rules/engine'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyAjVH2XBm0MAsKosCi8fTMtsd2fC_O9xvM')

export async function analyzeWithGemini(
  input: AnalysisInput,
  ruleBasedResult: AnalysisResult
): Promise<AnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = buildAnalysisPrompt(input, ruleBasedResult)

    console.log('[GEMINI] Gerando análise completa (FREE + PREMIUM) com IA...')
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse JSON response from Gemini
    const aiAnalysis = parseGeminiResponse(text, ruleBasedResult)

    // Merge AI insights with rule-based results
    return mergeAnalysisResults(ruleBasedResult, aiAnalysis)
  } catch (error: any) {
    console.error('[GEMINI] Erro ao analisar com Gemini:', error.message)
    console.error('[GEMINI] Stack:', error.stack)
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

  const matchName = input.nome_match || 'o match'
  const generoLabel = input.genero_match === 'ELE' ? 'ele' : 'ela'
  
  return `Você é um especialista em relacionamentos que analisa padrões comportamentais em relacionamentos modernos.

CONTEXTO DA ANÁLISE:
${input.nome_match ? `- Nome do match: "${input.nome_match}"` : ''}
- Gênero do match: ${generoLabel}
- Estágio: ${stageLabels[input.estagio]}
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
    }
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
// CORREÇÃO DE ROTA - Análise de Padrões
// ============================================

export type RouteCorrectionInput = {
  analyses: Array<{
    inputJson: any
    resultJson: any
    scores: any
    createdAt: string
  }>
  userObjective: string
}

export type RouteCorrectionResult = {
  alignment_status: 'ALINHADO' | 'PARCIALMENTE_ALINHADO' | 'DESALINHADO'
  pattern_summary: {
    main_pattern: string
    description: string
    evidence_count: number
    total_analyses: number
  }
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

export async function analyzeRouteCorrection(
  input: RouteCorrectionInput
): Promise<RouteCorrectionResult> {
  try {
    // Usar modelo compatível com API gratuita
    // gemini-2.0-flash é o modelo disponível na API gratuita v1beta
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const prompt = buildRouteCorrectionPrompt(input)
    
    console.log('[GEMINI] Analisando padrões de comportamento para correção de rota...')
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    return parseRouteCorrectionResponse(text)
  } catch (error: any) {
    console.error('[GEMINI] Erro ao analisar correção de rota:', error.message)
    throw error
  }
}

function buildRouteCorrectionPrompt(input: RouteCorrectionInput): string {
  const objectiveLabels: Record<string, string> = {
    CASUAL: 'relacionamento casual',
    CONHECER: 'conhecer pessoas novas',
    NAMORO_SERIO: 'namoro sério/relacionamento duradouro'
  }
  
  const objectiveLabel = objectiveLabels[input.userObjective] || input.userObjective
  
  // Resumir análises
  const analysesSummary = input.analyses.map((analysis, idx) => {
    const inputData = analysis.inputJson
    const scores = analysis.scores || analysis.resultJson?.scores || {}
    
    return `
Análise ${idx + 1} (${new Date(analysis.createdAt).toLocaleDateString('pt-BR')}):
- Objetivo do match: ${inputData.objetivo_usuario || 'Não informado'}
- Estágio: ${inputData.estagio || 'Não informado'}
- Iniciativa: ${inputData.iniciativa || 'Não informado'}
- Frequência: ${inputData.frequencia_contato || 'Não informado'}
- Tempo de resposta: ${inputData.tempo_resposta || 'Não informado'}
- Encontro marcado: ${inputData.encontro_marcado || 'Não'}
- Cancelou encontro: ${inputData.cancelou_encontro || 'Não'}
- Scores:
  * Reciprocidade: ${scores.reciprocidade || 50}/100
  * Constância: ${scores.constancia || 50}/100
  * Ação no mundo real: ${scores.acao_mundo_real || 50}/100
  * Risco de ghosting: ${scores.risco_ghosting || 30}/100
  * Risco de enrolação: ${scores.risco_enrolacao || 30}/100
  * Compatibilidade: ${scores.compat_objetivo || 50}/100`
  }).join('\n')
  
  return `Você é um coach especializado em relacionamentos modernos e uso de apps de relacionamento como Tinder.

CONTEXTO:
O usuário tem como objetivo: ${objectiveLabel}
Total de análises realizadas: ${input.analyses.length}

HISTÓRICO DE ANÁLISES:
${analysesSummary}

SUA TAREFA:
Analise os padrões de comportamento do usuário e identifique:
1. Se o comportamento está ALINHADO, PARCIALMENTE ALINHADO ou DESALINHADO com o objetivo dele
2. Padrões recorrentes (positivos e negativos)
3. Pontos cegos (comportamentos que ele não percebe)
4. Ações corretivas específicas e acionáveis
5. O que ele deve continuar fazendo (se estiver alinhado)

REGRAS IMPORTANTES:
- Seja específico e baseado em evidências dos dados
- Foque em comportamentos, não em traços psicológicos
- Dê sugestões práticas e acionáveis
- Se estiver alinhado, incentive e destaque os pontos fortes
- Se estiver desalinhado, seja empático mas direto
- O objetivo é ajudar o usuário a encontrar pessoas com os mesmos objetivos
- Evite julgamentos, foque em coaching prático

FORMATO DE RESPOSTA (JSON):
{
  "alignment_status": "ALINHADO" | "PARCIALMENTE_ALINHADO" | "DESALINHADO",
  "pattern_summary": {
    "main_pattern": "Descrição do padrão principal identificado (1 frase)",
    "description": "Explicação detalhada do padrão (2-3 frases)",
    "evidence_count": número de análises que mostram esse padrão,
    "total_analyses": ${input.analyses.length}
  },
  "behavior_analysis": {
    "strengths": ["Força 1", "Força 2", "Força 3"],
    "weaknesses": ["Fraqueza 1", "Fraqueza 2"],
    "blind_spots": ["Ponto cego 1", "Ponto cego 2"]
  },
  "recommendations": {
    "corrective_actions": [
      {
        "action": "Ação específica e acionável",
        "priority": "HIGH" | "MEDIUM" | "LOW",
        "reason": "Por que essa ação é importante"
      }
    ],
    "keep_doing": ["Comportamento positivo 1", "Comportamento positivo 2"],
    "weekly_focus": {
      "focus": "Foco principal da semana (1 frase)",
      "metric": "Métrica para acompanhar (ex: 'taxa de reciprocidade')",
      "goal": "Meta específica (ex: 'buscar matches que respondem em até 2h')"
    }
  },
  "encouragement": {
    "message": "Mensagem de incentivo se estiver alinhado, ou motivação se estiver desalinhado",
    "highlights": ["Destaque 1", "Destaque 2"]
  }
}

Responda APENAS com o JSON válido, sem markdown ou texto adicional.`
}

function parseRouteCorrectionResponse(text: string): RouteCorrectionResult {
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
    
    return parsed as RouteCorrectionResult
  } catch (error: any) {
    console.error('[GEMINI] Erro ao fazer parse da correção de rota:', error.message)
    console.error('[GEMINI] Texto recebido:', text.substring(0, 500))
    throw error
  }
}
