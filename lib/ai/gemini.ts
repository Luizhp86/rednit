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
  
  return `Você é um especialista em relacionamentos que analisa padrões comportamentais em relacionamentos modernos.

CONTEXTO DA ANÁLISE:
${input.nome_match ? `- Nome do match: "${input.nome_match}"` : ''}
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
- Consistência: ${ruleBasedResult.scores.consistencia}/100
- Reciprocidade: ${ruleBasedResult.scores.reciprocidade}/100
- Disponibilidade: ${ruleBasedResult.scores.disponibilidade}/100
- Respeito: ${ruleBasedResult.scores.respeito}/100
- Intenção: ${ruleBasedResult.scores.intencao}/100
- Risco de ghosting: ${ruleBasedResult.scores.risco_ghosting}/100
- Risco de enrolação: ${ruleBasedResult.scores.risco_enrolacao}/100

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
{
  "free_teaser": {
    "hypothesis": {
      "key": "string (ex: EXPLORANDO, BUSCA_FIXO, etc)",
      "confidence": "LOW|MEDIUM|HIGH",
      "title": "Título envolvente e específico",
      "description": "Descrição detalhada e empática (2-3 parágrafos)",
      "signals": [
        {
          "code": "string",
          "label": "string",
          "why": "Explicação clara e específica"
        }
      ],
      "observe_to_confirm": [
        "O que observar para confirmar esta hipótese"
      ],
      "upgrade_hook": "Frase curta que cria curiosidade sobre o relatório completo (ex: 'No relatório completo, você verá 3 padrões adicionais que confirmam esta hipótese')"
    },
    "flags": [
      {
        "severity": "LOW|MEDIUM|HIGH",
        "title": "Título impactante",
        "description": "Descrição detalhada e acionável",
        "evidence_signals": [
          {
            "code": "string",
            "label": "string",
            "why": "Por que este sinal é relevante"
          }
        ],
        "impact": "Impacto específico no relacionamento",
        "upgrade_hook": "Mencione que há mais flags similares no relatório completo"
      }
    ],
    "scores": {
      "risco_ghosting": ${ruleBasedResult.scores.risco_ghosting},
      "intencao": ${ruleBasedResult.scores.intencao}
    },
    "insight_preview": "Uma frase ou parágrafo curto que resume o insight principal e cria curiosidade"
  },
  "premium": {
    "all_scores": ${JSON.stringify(ruleBasedResult.scores)},
    "all_hypotheses": [
      {
        "key": "string (ex: EXPLORANDO, BUSCA_FIXO, etc)",
        "confidence": "LOW|MEDIUM|HIGH",
        "title": "Título envolvente e específico",
        "description": "Descrição detalhada e empática (2-3 parágrafos)",
        "signals": [{"code": "string", "label": "string", "why": "string"}],
        "observe_to_confirm": ["string"]
      }
    ],
    "all_red_flags": [
      {
        "severity": "LOW|MEDIUM|HIGH",
        "title": "Título impactante",
        "description": "Descrição detalhada e acionável",
        "evidence_signals": [{"code": "string", "label": "string", "why": "string"}],
        "impact": "Impacto específico no relacionamento"
      }
    ],
    "all_green_flags": [
      {
        "severity": "LOW|MEDIUM|HIGH",
        "title": "Título positivo",
        "description": "Descrição detalhada",
        "evidence_signals": [{"code": "string", "label": "string", "why": "string"}],
        "impact": "Impacto positivo no relacionamento"
      }
    ],
    "next_actions": [
      {
        "stage": "FIRST_CHAT|TALKING|POST_DATE",
        "action": "Ação específica e acionável",
        "reason": "Razão baseada em evidências"
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

    // Convert to AnalysisResult format
    const result: Partial<AnalysisResult> = {
      free_teaser: {
        hypothesis: parsed.free_teaser?.hypothesis
          ? {
              key: parsed.free_teaser.hypothesis.key || 'UNKNOWN',
              confidence: (parsed.free_teaser.hypothesis.confidence || 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH',
              signals: parsed.free_teaser.hypothesis.signals || [],
              observe_to_confirm: parsed.free_teaser.hypothesis.observe_to_confirm || [],
              title: parsed.free_teaser.hypothesis.title,
              description: parsed.free_teaser.hypothesis.description,
              upgrade_hook: parsed.free_teaser.hypothesis.upgrade_hook,
            }
          : null,
        flags: parsed.free_teaser?.flags?.map((f: any) => ({
          severity: (f.severity || 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH',
          title: f.title || '',
          evidence_signals: f.evidence_signals || [],
          impact: f.impact || '',
          description: f.description,
          upgrade_hook: f.upgrade_hook,
        })) || [],
        scores: parsed.free_teaser?.scores || fallback.free_teaser.scores,
        insight_preview: parsed.free_teaser?.insight_preview,
      },
      premium: parsed.premium
        ? {
            all_scores: parsed.premium.all_scores || fallback.premium.all_scores,
            all_hypotheses: parsed.premium.all_hypotheses?.map((h: any) => ({
              key: h.key || 'UNKNOWN',
              confidence: (h.confidence || 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH',
              signals: h.signals || [],
              observe_to_confirm: h.observe_to_confirm || [],
              title: h.title,
              description: h.description,
            })) || fallback.premium.all_hypotheses,
            all_red_flags: parsed.premium.all_red_flags?.map((f: any) => ({
              severity: (f.severity || 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH',
              title: f.title || '',
              evidence_signals: f.evidence_signals || [],
              impact: f.impact || '',
              description: f.description,
            })) || fallback.premium.all_red_flags,
            all_green_flags: parsed.premium.all_green_flags?.map((f: any) => ({
              severity: (f.severity || 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH',
              title: f.title || '',
              evidence_signals: f.evidence_signals || [],
              impact: f.impact || '',
              description: f.description,
            })) || fallback.premium.all_green_flags,
            next_actions: parsed.premium.next_actions || fallback.premium.next_actions,
          }
        : fallback.premium,
    }

    return result
  } catch (error: any) {
    console.error('[GEMINI] Erro ao fazer parse da resposta:', error.message)
    console.error('[GEMINI] Texto recebido:', text.substring(0, 500))
    return {}
  }
}

function mergeAnalysisResults(
  ruleBased: AnalysisResult,
  aiAnalysis: Partial<AnalysisResult>
): AnalysisResult {
  // Merge: use AI for both free_teaser and premium (both generated by AI)
  const mergedFreeTeaser = {
    ...ruleBased.free_teaser,
    ...(aiAnalysis.free_teaser || {}),
    // Merge hypothesis if AI provided one
    hypothesis: aiAnalysis.free_teaser?.hypothesis || ruleBased.free_teaser.hypothesis,
    // Merge flags, preferring AI ones but keeping rule-based if AI didn't provide
    flags: aiAnalysis.free_teaser?.flags?.length
      ? aiAnalysis.free_teaser.flags
      : ruleBased.free_teaser.flags,
    // Ensure scores are always present
    scores: aiAnalysis.free_teaser?.scores || ruleBased.free_teaser.scores,
  }

  // Use AI-generated premium if available, otherwise fallback to rule-based
  const mergedPremium = aiAnalysis.premium || ruleBased.premium

  return {
    ...ruleBased,
    free_teaser: mergedFreeTeaser,
    premium: mergedPremium,
  }
}
