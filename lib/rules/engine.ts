// @ts-ignore - JSON import
import ruleset from './ruleset.json'

export type AnalysisInput = {
  genero_match: 'ELE' | 'ELA'
  objetivo_usuario: 'CASUAL' | 'CONHECER' | 'NAMORO'
  ritmo_usuario: 'RAPIDO' | 'MEDIO' | 'LENTO'
  estagio: 'FIRST_CHAT' | 'TALKING' | 'POST_DATE'
  iniciativa: 'VOCE' | 'MATCH' | 'MEIO_A_MEIO'
  frequencia_contato: 'DIARIA' | 'ALTERNADA' | 'SOME'
  tempo_resposta?: 'MINUTOS' | 'HORAS' | 'DIAS'
  encontro_marcado?: 'SIM' | 'NAO'
  cancelou_encontro?: 'SIM' | 'NAO'
  remarcou_com_data?: 'SIM' | 'NAO' | 'NAO_SE_APLICA'
  curiosidade_por_voce?: 'ALTA' | 'MEDIA' | 'BAIXA'
  respeito_limites?: 'RESPEITA' | 'NEGOCIA' | 'INSISTE' | 'DEBOCHA'
  disponivel_so_madrugada?: 'SIM' | 'NAO'
  fala_futuro?: 'NAO' | 'FALA' | 'FALA_E_FAZ'
  sinais_alerta: string[]
  inegociaveis: string[]
  texto_bio_match?: string
  trecho_chat?: string
  nome_match?: string
}

export type Scores = {
  reciprocidade: number
  constancia: number
  acao_mundo_real: number
  respeito: number
  coerencia: number
  disponibilidade: number
  risco_ghosting: number
  risco_enrolacao: number
  compat_objetivo: number
}

export type SignalFired = {
  code: string
  label: string
  why: string
  weight_applied: number
}

export type HypothesisResult = {
  key: string
  confidence: 'LOW' | 'MEDIUM' | 'HIGH'
  signals: SignalFired[]
  observe_to_confirm: string[]
  observe_to_refute: string[]
  title?: string
  description?: string
}

export type FlagResult = {
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  title: string
  impact?: string
  benefit?: string
  signals: SignalFired[]
  description?: string
}

export type FreeTeaser = {
  headline: string
  hypothesis_1: HypothesisResult | null
  ONE_risk_score: {
    type: 'risco_ghosting' | 'risco_enrolacao'
    value: number
    label: string
  }
  red_flag?: FlagResult
  green_flag?: FlagResult
  observe_48h: string[]
  locked_cards: string[]
  clarity_percent: number
}

export type PremiumReport = {
  executive_summary: string[]
  hypothesis_1: HypothesisResult | null
  hypothesis_2: HypothesisResult | null
  hypothesis_3: HypothesisResult | null
  full_risk_map: {
    risco_ghosting: number
    risco_enrolacao: number
    explanations: string[]
  }
  compatibility_explained: {
    score: number
    explanation: string
    alignment: 'ALINHADO' | 'PARCIAL' | 'DESALINHADO'
  }
  validation_checklist: string[]
  stage_plan: Array<{
    stage: string
    actions: string[]
    metrics: string[]
  }>
}

export type AnalysisResult = {
  meta: {
    analysis_id?: string
    created_at: string
    stage: string
    completeness_score: number
  }
  scores: Scores
  hypotheses_top3: HypothesisResult[]
  red_flags: FlagResult[]
  green_flags: FlagResult[]
  next_actions: string[]
  signals_fired: SignalFired[]
  free_teaser: FreeTeaser
  premium_report: PremiumReport
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function getStageMultiplier(stage: string): number {
  const multipliers = (ruleset as any).stage_multipliers || {}
  return multipliers[stage] || 1.0
}

function collectSignals(input: AnalysisInput): SignalFired[] {
  const signals: SignalFired[] = []
  const signalConfigs = (ruleset as any).signals || {}

  // Mapear valores do formulário para valores do ruleset
  const fieldMappings: Record<string, Record<string, string>> = {
    iniciativa: {
      'VOCE': 'VOCE_SEMPRE',
      'MATCH': 'MATCH_SEMPRE',
      'MEIO_A_MEIO': 'EQUILIBRADO'
    },
    frequencia_contato: {
      'DIARIA': 'DIARIA',
      'ALTERNADA': 'ALTERNADA',
      'SOME': 'RARAMENTE'
    },
    tempo_resposta: {
      'MINUTOS': 'MINUTOS',
      'HORAS': 'HORAS',
      'DIAS': 'DIAS'
    },
    curiosidade_por_voce: {
      'ALTA': 'ALTA',
      'MEDIA': 'MEDIA',
      'BAIXA': 'BAIXA'
    },
    respeito_limites: {
      'RESPEITA': 'RESPEITA',
      'NEGOCIA': 'NEGOCIA',
      'INSISTE': 'INSISTE',
      'DEBOCHA': 'DEBOCHA'
    },
    fala_futuro: {
      'NAO': 'NAO_FALA',
      'FALA': 'FALA_NAO_FAZ',
      'FALA_E_FAZ': 'FALA_E_FAZ'
    },
    encontro_marcado: {
      'SIM': 'SIM',
      'NAO': 'NAO'
    },
    cancelou_encontro: {
      'SIM': 'SIM',
      'NAO': 'NAO'
    },
    remarcou_com_data: {
      'SIM': 'SIM',
      'NAO': 'NAO',
      'NAO_SE_APLICA': 'NAO_SE_APLICA'
    },
    disponivel_so_madrugada: {
      'SIM': 'SIM',
      'NAO': 'NAO'
    }
  }

  // Processar cada campo que tem signals configurados
  for (const [field, mapping] of Object.entries(fieldMappings)) {
    const inputValue = (input as any)[field]
    if (!inputValue) continue

    const rulesetValue = mapping[inputValue]
    if (!rulesetValue) continue

    const fieldSignals = signalConfigs[field]
    if (!fieldSignals) continue

    const signalConfig = fieldSignals[rulesetValue]
    if (!signalConfig) continue

    signals.push({
      code: signalConfig.code,
      label: signalConfig.label,
      why: `Campo "${field}" = "${inputValue}"`,
      weight_applied: 1
    })
  }

  return signals
}

function calculateScores(input: AnalysisInput, signals: SignalFired[]): Scores {
  const baseScores: Scores = {
    reciprocidade: 50,
    constancia: 50,
    acao_mundo_real: 50,
    respeito: 50,
    coerencia: 50,
    disponibilidade: 50,
    risco_ghosting: 30,
    risco_enrolacao: 30,
    compat_objetivo: 50
  }

  const signalConfigs = (ruleset as any).signals || {}
  const stageMultiplier = getStageMultiplier(input.estagio)

  // Aplicar deltas dos signals
  for (const signal of signals) {
    const field = Object.keys(signalConfigs).find(f => {
      const fieldSignals = signalConfigs[f]
      return Object.values(fieldSignals).some((s: any) => s.code === signal.code)
    })

    if (field) {
      const fieldSignals = signalConfigs[field]
      const signalConfig = Object.values(fieldSignals).find((s: any) => s.code === signal.code) as any

      if (signalConfig?.deltas) {
        for (const [dimension, delta] of Object.entries(signalConfig.deltas)) {
          if (dimension === 'acao_mundo_real') {
            baseScores[dimension as keyof Scores] += (delta as number) * stageMultiplier
          } else {
            baseScores[dimension as keyof Scores] += delta as number
          }
        }
      }
    }
  }

  // Aplicar regras específicas para encontro_marcado
  if (input.encontro_marcado === 'NAO') {
    if (input.estagio === 'TALKING') {
      baseScores.acao_mundo_real -= 8
    } else if (input.estagio === 'POST_DATE') {
      baseScores.acao_mundo_real -= 15
    }
  }

  // Aplicar regras específicas para cancelou_encontro
  if (input.cancelou_encontro === 'SIM') {
    baseScores.acao_mundo_real -= 10 * stageMultiplier
  }

  // Calcular compat_objetivo
  if (input.disponivel_so_madrugada === 'SIM' && input.objetivo_usuario === 'NAMORO') {
    baseScores.compat_objetivo -= 15
  }

  // Clamp todos os scores
  const clamped: Scores = {
    reciprocidade: clamp(baseScores.reciprocidade, 0, 100),
    constancia: clamp(baseScores.constancia, 0, 100),
    acao_mundo_real: clamp(baseScores.acao_mundo_real, 0, 100),
    respeito: clamp(baseScores.respeito, 0, 100),
    coerencia: clamp(baseScores.coerencia, 0, 100),
    disponibilidade: clamp(baseScores.disponibilidade, 0, 100),
    risco_ghosting: clamp(baseScores.risco_ghosting, 0, 100),
    risco_enrolacao: clamp(baseScores.risco_enrolacao, 0, 100),
    compat_objetivo: clamp(baseScores.compat_objetivo, 0, 100)
  }

  return clamped
}

function evaluateHypotheses(input: AnalysisInput, scores: Scores, signals: SignalFired[]): HypothesisResult[] {
  const hypotheses: HypothesisResult[] = []
  const hypothesisConfigs = (ruleset as any).hypotheses || {}

  for (const [key, config] of Object.entries(hypothesisConfigs)) {
    const hypothesisConfig = config as any

    // Verificar se requer texto e não tem
    if (hypothesisConfig.requires_text && !input.trecho_chat && !input.texto_bio_match) {
      continue
    }

    let hypothesisScore = 0
    const hypothesisSignals: SignalFired[] = []

    for (const signalRule of hypothesisConfig.signals || []) {
      let matches = false

      if (signalRule.score && signalRule.operator) {
        const scoreValue = (scores as any)[signalRule.field]
        if (signalRule.operator === '>=' && scoreValue >= signalRule.score) {
          matches = true
        } else if (signalRule.operator === '<=' && scoreValue <= signalRule.score) {
          matches = true
        }
      } else if (signalRule.contains) {
        if (signalRule.field === 'sinais_alerta') {
          matches = input.sinais_alerta.includes(signalRule.value)
        }
      } else {
        const inputValue = (input as any)[signalRule.field]
        matches = inputValue === signalRule.value
      }

      if (matches) {
        hypothesisScore += signalRule.weight
        const relatedSignal = signals.find(s => 
          s.code.includes(signalRule.field.toUpperCase()) || 
          s.why.includes(signalRule.field)
        )
        if (relatedSignal) {
          hypothesisSignals.push(relatedSignal)
        }
      }
    }

    if (hypothesisScore >= hypothesisConfig.threshold) {
      let confidence: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
      if (hypothesisScore >= hypothesisConfig.threshold * 1.5) {
        confidence = 'HIGH'
      } else if (hypothesisScore >= hypothesisConfig.threshold * 1.2) {
        confidence = 'MEDIUM'
      }

      // Reduzir confiança se campos opcionais não informados
      const optionalFields = ['tempo_resposta', 'curiosidade_por_voce', 'respeito_limites', 'fala_futuro']
      const missingOptional = optionalFields.filter(f => !(input as any)[f]).length
      if (missingOptional > 2 && confidence === 'HIGH') {
        confidence = 'MEDIUM'
      } else if (missingOptional > 2 && confidence === 'MEDIUM') {
        confidence = 'LOW'
      }

      hypotheses.push({
        key,
        confidence,
        signals: hypothesisSignals,
        observe_to_confirm: generateObserveToConfirm(key),
        observe_to_refute: generateObserveToRefute(key)
      })
    }
  }

  // Ordenar por confiança e pegar top 3
  const confOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
  hypotheses.sort((a, b) => confOrder[b.confidence] - confOrder[a.confidence])
  return hypotheses.slice(0, 3)
}

function generateObserveToConfirm(key: string): string[] {
  const observations: Record<string, string[]> = {
    EXPLORANDO: [
      'Observe se há interesse em conhecer você além do físico',
      'Veja se há reciprocidade nas conversas'
    ],
    BUSCA_FIXO: [
      'Confirme se ações correspondem às palavras',
      'Observe consistência ao longo do tempo'
    ],
    CARENCIA_VALIDACAO: [
      'Observe se busca validação constante',
      'Atenção a manipulação emocional'
    ],
    RECEM_SAIU_RELACAO: [
      'Observe se está emocionalmente disponível',
      'Atenção a comparações com ex'
    ],
    SEM_DISPONIBILIDADE_REAL: [
      'Confirme disponibilidade real para encontros',
      'Observe padrões de comunicação'
    ]
  }
  return observations[key] || ['Continue observando os padrões de comportamento']
}

function generateObserveToRefute(key: string): string[] {
  const refutations: Record<string, string[]> = {
    EXPLORANDO: ['Se demonstrar interesse genuíno e consistência'],
    BUSCA_FIXO: ['Se houver inconsistências ou falta de ação'],
    CARENCIA_VALIDACAO: ['Se não houver sinais de manipulação'],
    RECEM_SAIU_RELACAO: ['Se demonstrar disponibilidade emocional'],
    SEM_DISPONIBILIDADE_REAL: ['Se houver disponibilidade real e consistência']
  }
  return refutations[key] || ['Se os padrões mudarem']
}

function evaluateFlags(input: AnalysisInput, scores: Scores, signals: SignalFired[]): {
  redFlags: FlagResult[]
  greenFlags: FlagResult[]
} {
  const redFlags: FlagResult[] = []
  const greenFlags: FlagResult[] = []

  const redFlagConfigs = (ruleset as any).red_flags || []
  const greenFlagConfigs = (ruleset as any).green_flags || []

  // Avaliar red flags
  for (const flagConfig of redFlagConfigs) {
    let matches = true
    const evidenceSignals: SignalFired[] = []

    for (const trigger of flagConfig.triggers || []) {
      if (trigger.required === false && !matches) continue

      let conditionMet = false

      if (trigger.score && trigger.operator) {
        const scoreValue = (scores as any)[trigger.field]
        if (trigger.operator === '>=') {
          conditionMet = scoreValue >= trigger.score
        } else if (trigger.operator === '<=') {
          conditionMet = scoreValue <= trigger.score
        } else if (trigger.operator === '!=') {
          conditionMet = scoreValue !== trigger.score
        }
      } else if (trigger.contains) {
        if (trigger.field === 'sinais_alerta') {
          conditionMet = input.sinais_alerta.includes(trigger.value)
        }
      } else {
        const inputValue = (input as any)[trigger.field]
        conditionMet = inputValue === trigger.value
      }

      if (conditionMet) {
        const relatedSignal = signals.find(s => 
          s.code.includes(trigger.field.toUpperCase()) || 
          s.why.includes(trigger.field)
        )
        if (relatedSignal) {
          evidenceSignals.push(relatedSignal)
        }
      } else {
        if (trigger.required !== false) {
          matches = false
        }
      }
    }

    if (matches && evidenceSignals.length > 0) {
      redFlags.push({
        severity: flagConfig.severity,
        title: flagConfig.title,
        impact: flagConfig.impact,
        signals: evidenceSignals
      })
    }
  }

  // Avaliar green flags
  for (const flagConfig of greenFlagConfigs) {
    let matches = true
    const evidenceSignals: SignalFired[] = []

    for (const trigger of flagConfig.triggers || []) {
      if (trigger.required === false && !matches) continue

      let conditionMet = false

      if (trigger.score && trigger.operator) {
        const scoreValue = (scores as any)[trigger.field]
        if (trigger.operator === '>=') {
          conditionMet = scoreValue >= trigger.score
        } else if (trigger.operator === '<=') {
          conditionMet = scoreValue <= trigger.score
        } else if (trigger.operator === '!=') {
          conditionMet = scoreValue !== trigger.score
        }
      } else {
        const inputValue = (input as any)[trigger.field]
        conditionMet = inputValue === trigger.value
      }

      if (conditionMet) {
        const relatedSignal = signals.find(s => 
          s.code.includes(trigger.field.toUpperCase()) || 
          s.why.includes(trigger.field)
        )
        if (relatedSignal) {
          evidenceSignals.push(relatedSignal)
        }
      } else {
        if (trigger.required !== false) {
          matches = false
        }
      }
    }

    if (matches && evidenceSignals.length > 0) {
      greenFlags.push({
        severity: flagConfig.severity,
        title: flagConfig.title,
        benefit: flagConfig.benefit,
        signals: evidenceSignals
      })
    }
  }

  return { redFlags, greenFlags }
}

function calculateCompletenessScore(input: AnalysisInput): number {
  const requiredFields = ['genero_match', 'objetivo_usuario', 'ritmo_usuario', 'estagio', 'iniciativa', 'frequencia_contato']
  const optionalFields = ['tempo_resposta', 'curiosidade_por_voce', 'respeito_limites', 'fala_futuro', 'encontro_marcado', 'cancelou_encontro', 'remarcou_com_data', 'disponivel_so_madrugada', 'texto_bio_match', 'trecho_chat']

  let score = 0
  const totalFields = requiredFields.length + optionalFields.length

  // Campos obrigatórios valem mais
  for (const field of requiredFields) {
    if ((input as any)[field]) score += 10
  }

  // Campos opcionais valem menos
  for (const field of optionalFields) {
    if ((input as any)[field]) score += 3
  }

  return Math.min(100, Math.round((score / (requiredFields.length * 10 + optionalFields.length * 3)) * 100))
}

function generateFreeTeaser(
  input: AnalysisInput,
  scores: Scores,
  hypotheses: HypothesisResult[],
  redFlags: FlagResult[],
  greenFlags: FlagResult[],
  completenessScore: number
): FreeTeaser {
  const hypothesis1 = hypotheses[0] || null

  // Escolher o maior risco
  const riskType = scores.risco_ghosting > scores.risco_enrolacao ? 'risco_ghosting' : 'risco_enrolacao'
  const riskValue = scores[riskType]
  const riskLabel = riskType === 'risco_ghosting' ? 'Risco de Ghosting' : 'Risco de Enrolação'

  // Headline mais viciante e instigante
  let headline = '🔍 Análise concluída: padrões revelados'
  if (hypothesis1) {
    const hypothesisLabels: Record<string, string> = {
      EXPLORANDO: '⚠️ Padrão exploratório detectado - atenção necessária',
      BUSCA_FIXO: '💚 Sinais positivos: busca por relacionamento sério identificada',
      CARENCIA_VALIDACAO: '🚩 Possível necessidade de validação constante',
      RECEM_SAIU_RELACAO: '⏰ Possível recém-saída de relacionamento',
      SEM_DISPONIBILIDADE_REAL: '⏳ Baixa disponibilidade real - incompatibilidade detectada'
    }
    headline = hypothesisLabels[hypothesis1.key] || headline
  } else if (riskValue > 70) {
    headline = `🚨 ALERTA: ${riskLabel} muito alto (${riskValue}%)`
  } else if (riskValue > 50) {
    headline = `⚠️ ${riskLabel} moderado detectado`
  } else if (scores.reciprocidade > 70 && scores.constancia > 70) {
    headline = '💚 Sinais muito positivos: alta reciprocidade e consistência'
  }

  // Observe 48h mais específico e acionável
  const observe48h: string[] = []
  if (hypothesis1) {
    observe48h.push(hypothesis1.observe_to_confirm[0] || 'Continue observando padrões de comportamento')
    if (hypothesis1.observe_to_confirm[1]) {
      observe48h.push(hypothesis1.observe_to_confirm[1])
    }
  } else if (riskValue > 60) {
    observe48h.push(`Teste a consistência: observe se o padrão de ${riskLabel.toLowerCase()} se mantém`)
    observe48h.push('Avalie se há sinais de mudança de comportamento')
  } else {
    observe48h.push('Observe consistência na comunicação nas próximas 48h')
    observe48h.push('Verifique se há reciprocidade nas interações')
  }

  // Calcular clarity percent
  const clarityPercent = Math.min(100, Math.round(completenessScore * 0.4 + (hypotheses.length > 0 ? 20 : 0) + (redFlags.length + greenFlags.length > 0 ? 10 : 0)))

  // Para o free teaser, remover detalhes técnicos e manter apenas informações instigantes
  const simplifiedHypothesis = hypothesis1 ? {
    ...hypothesis1,
    // Remover signals e observe_to_confirm do free - criar curiosidade
    signals: [],
    observe_to_confirm: [],
    observe_to_refute: []
  } : null

  // Escolher apenas 1 flag (red tem prioridade se existir)
  const mainFlag = redFlags[0] || greenFlags[0]
  const simplifiedFlag = mainFlag ? {
    ...mainFlag,
    // Remover signals e descrições detalhadas
    signals: [],
    description: undefined
  } : undefined

  return {
    headline,
    hypothesis_1: simplifiedHypothesis,
    ONE_risk_score: {
      type: riskType,
      value: riskValue,
      label: riskLabel
    },
    red_flag: redFlags[0] ? simplifiedFlag : undefined,
    green_flag: !redFlags[0] && greenFlags[0] ? simplifiedFlag : undefined,
    observe_48h: observe48h.slice(0, 1), // Apenas 1 item para criar curiosidade
    locked_cards: [
      'Top 3 hipóteses completas',
      'Mapa de risco detalhado',
      'Análise de compatibilidade',
      'Checklist de validação',
      'Plano de ação por estágio'
    ],
    clarity_percent: clarityPercent
  }
}

function generatePremiumReport(
  input: AnalysisInput,
  scores: Scores,
  hypotheses: HypothesisResult[],
  redFlags: FlagResult[],
  greenFlags: FlagResult[]
): PremiumReport {
  const executiveSummary: string[] = []
  
  if (hypotheses.length > 0) {
    executiveSummary.push(`Hipótese principal: ${hypotheses[0].key} (confiança ${hypotheses[0].confidence})`)
  }
  
  executiveSummary.push(`Reciprocidade: ${scores.reciprocidade}/100`)
  executiveSummary.push(`Constância: ${scores.constancia}/100`)
  executiveSummary.push(`Ação no mundo real: ${scores.acao_mundo_real}/100`)
  
  if (redFlags.length > 0) {
    executiveSummary.push(`${redFlags.length} red flag(s) identificado(s)`)
  }
  
  if (greenFlags.length > 0) {
    executiveSummary.push(`${greenFlags.length} green flag(s) identificado(s)`)
  }

  const riskExplanations: string[] = []
  if (scores.risco_ghosting > 50) {
    riskExplanations.push(`Risco de ghosting elevado (${scores.risco_ghosting}/100) - padrões de comunicação intermitente`)
  }
  if (scores.risco_enrolacao > 50) {
    riskExplanations.push(`Risco de enrolação elevado (${scores.risco_enrolacao}/100) - promessas sem ação`)
  }

  const compatibilityAlignment = scores.compat_objetivo >= 70 ? 'ALINHADO' : 
                                 scores.compat_objetivo >= 50 ? 'PARCIAL' : 'DESALINHADO'

  const validationChecklist: string[] = []
  if (hypotheses.length > 0) {
    validationChecklist.push(...hypotheses[0].observe_to_confirm)
  }
  validationChecklist.push('Observe padrão de resposta nas próximas 48h')
  validationChecklist.push('Verifique consistência entre palavras e ações')
  validationChecklist.push('Avalie respeito aos seus limites')
  validationChecklist.push('Monitore interesse genuíno vs. superficial')

  const stagePlan = [
    {
      stage: input.estagio,
      actions: [
        'Continue observando padrões de comportamento',
        'Teste reciprocidade nas próximas interações',
        'Estabeleça limites claros se necessário'
      ],
      metrics: [
        'Frequência de contato',
        'Tempo de resposta',
        'Iniciativa nas conversas'
      ]
    }
  ]

  return {
    executive_summary: executiveSummary,
    hypothesis_1: hypotheses[0] || null,
    hypothesis_2: hypotheses[1] || null,
    hypothesis_3: hypotheses[2] || null,
    full_risk_map: {
      risco_ghosting: scores.risco_ghosting,
      risco_enrolacao: scores.risco_enrolacao,
      explanations: riskExplanations
    },
    compatibility_explained: {
      score: scores.compat_objetivo,
      explanation: `Compatibilidade com seu objetivo (${input.objetivo_usuario}): ${scores.compat_objetivo}/100`,
      alignment: compatibilityAlignment
    },
    validation_checklist: validationChecklist.slice(0, 5),
    stage_plan: stagePlan
  }
}

function generateNextActions(input: AnalysisInput, scores: Scores): string[] {
  const actions: string[] = []

  if (scores.reciprocidade < 50) {
    actions.push('Observe se há reciprocidade nas próximas interações')
  }

  if (scores.risco_ghosting > 60) {
    actions.push('Teste de consistência: observe padrão de resposta')
  }

  if (scores.risco_enrolacao > 60) {
    actions.push('Estabeleça limite claro sobre expectativas')
  }

  if (input.estagio === 'TALKING' && scores.acao_mundo_real > 70 && !input.encontro_marcado) {
    actions.push('Considere propor encontro em janela de 1-2 semanas')
  }

  if (scores.constancia < 50) {
    actions.push('Observe padrão de comportamento consistente')
  }

  return actions.slice(0, 5)
}

export function analyze(input: AnalysisInput): AnalysisResult {
  // Coletar signals
  const signals = collectSignals(input)

  // Calcular scores
  const scores = calculateScores(input, signals)

  // Avaliar hipóteses
  const hypotheses = evaluateHypotheses(input, scores, signals)

  // Avaliar flags
  const { redFlags, greenFlags } = evaluateFlags(input, scores, signals)

  // Calcular completeness
  const completenessScore = calculateCompletenessScore(input)

  // Gerar next actions
  const nextActions = generateNextActions(input, scores)

  // Gerar free teaser
  const freeTeaser = generateFreeTeaser(input, scores, hypotheses, redFlags, greenFlags, completenessScore)

  // Gerar premium report
  const premiumReport = generatePremiumReport(input, scores, hypotheses, redFlags, greenFlags)

  return {
    meta: {
      created_at: new Date().toISOString(),
      stage: input.estagio,
      completeness_score: completenessScore
    },
    scores,
    hypotheses_top3: hypotheses,
    red_flags: redFlags,
    green_flags: greenFlags,
    next_actions: nextActions,
    signals_fired: signals,
    free_teaser: freeTeaser,
    premium_report: premiumReport
  }
}
