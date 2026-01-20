// @ts-ignore - JSON import
import ruleset from './ruleset.json'

export type AnalysisInput = {
  objetivo_usuario: 'CASUAL' | 'CONHECER' | 'NAMORO'
  ritmo_usuario: 'RAPIDO' | 'MEDIO' | 'LENTO'
  inegociaveis: string[]
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
  texto_bio_match?: string
  trecho_chat?: string
  nome_match?: string
}

export type ScoreResult = {
  consistencia: number
  reciprocidade: number
  disponibilidade: number
  respeito: number
  intencao: number
  risco_ghosting: number
  risco_enrolacao: number
}

export type HypothesisResult = {
  key: string
  confidence: 'LOW' | 'MEDIUM' | 'HIGH'
  signals: Array<{ code: string; label: string; why: string }>
  observe_to_confirm: string[]
  title?: string // Enhanced by AI
  description?: string // Enhanced by AI
  upgrade_hook?: string // Hook to encourage premium upgrade
}

export type FlagResult = {
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  title: string
  evidence_signals: Array<{ code: string; label: string; why: string }>
  impact: string
  description?: string // Enhanced by AI
  upgrade_hook?: string // Hook to encourage premium upgrade
}

export type AnalysisResult = {
  nome_match?: string // Nome do match para personalização
  scores: ScoreResult
  hypotheses: HypothesisResult[]
  red_flags: FlagResult[]
  green_flags: FlagResult[]
  next_actions: Array<{ stage: string; action: string; reason: string }>
  free_teaser: {
    hypothesis: HypothesisResult | null
    flags: FlagResult[]
    scores: Partial<ScoreResult>
    insight_preview?: string // AI-generated preview text
  }
  premium: {
    all_scores: ScoreResult
    all_hypotheses: HypothesisResult[]
    all_red_flags: FlagResult[]
    all_green_flags: FlagResult[]
    next_actions: Array<{ stage: string; action: string; reason: string }>
    preview?: {
      teaser_text?: string
      additional_insights_count?: number
      next_actions_preview?: string
    }
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function calculateScore(
  scoreConfig: any,
  input: AnalysisInput,
  allScores?: ScoreResult
): number {
  let total = scoreConfig.base || 50

  for (const [field, weight] of Object.entries(scoreConfig.weights || {})) {
    const inputValue = (input as any)[field]

    if (typeof weight === 'number') {
      // Direct numeric weight (deprecated - now using enum mappings)
      if (typeof inputValue === 'number') {
        total += weight * inputValue
      }
    } else if (typeof weight === 'object' && weight !== null) {
      // Object mapping (e.g., { "SIM": 10, "NAO": -20 })
      if (weight[inputValue] !== undefined) {
        total += weight[inputValue]
      }
    }
  }

  return clamp(total, 0, 100)
}

function evaluateHypothesis(
  hypothesisKey: string,
  hypothesisConfig: any,
  input: AnalysisInput,
  scores: ScoreResult
): HypothesisResult | null {
  let hypothesisScore = 0
  const signals: Array<{ code: string; label: string; why: string }> = []

  for (const signal of hypothesisConfig.signals || []) {
    if (signal.field === 'sinais_alerta') {
      if (input.sinais_alerta.includes(signal.value)) {
        hypothesisScore += signal.weight
        signals.push({
          code: signal.value,
          label: getSignalLabel(signal.value),
          why: `Sinal de alerta "${getSignalLabel(signal.value)}" presente`,
        })
      }
    } else if (signal.score) {
      // Reference to another score
      const scoreValue = (scores as any)[signal.field]
      if (scoreValue !== undefined && scoreValue >= signal.score) {
        hypothesisScore += signal.weight
        signals.push({
          code: signal.field,
          label: `Score ${signal.field} >= ${signal.score}`,
          why: `Score de ${signal.field} está em ${scoreValue}`,
        })
      }
    } else {
      const inputValue = (input as any)[signal.field]
      if (inputValue === signal.value) {
        hypothesisScore += signal.weight
        signals.push({
          code: `${signal.field}_${signal.value}`,
          label: `${signal.field} = ${signal.value}`,
          why: `${signal.field} corresponde ao padrão esperado`,
        })
      }
    }
  }

  if (hypothesisScore < hypothesisConfig.threshold) {
    return null
  }

  let confidence: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
  if (hypothesisScore >= hypothesisConfig.threshold * 1.5) {
    confidence = 'HIGH'
  } else if (hypothesisScore >= hypothesisConfig.threshold * 1.2) {
    confidence = 'MEDIUM'
  }

  return {
    key: hypothesisKey,
    confidence,
    signals,
    observe_to_confirm: generateObserveToConfirm(hypothesisKey, input),
  }
}

function generateObserveToConfirm(hypothesisKey: string, input: AnalysisInput): string[] {
  const observations: Record<string, string[]> = {
    EXPLORANDO: [
      'Observe se há interesse em conhecer você além do físico',
      'Veja se há reciprocidade nas conversas',
      'Atenção a sinais de comprometimento',
    ],
    BUSCA_FIXO: [
      'Confirme se ações correspondem às palavras',
      'Observe consistência ao longo do tempo',
      'Veja se há espaço para você na vida da pessoa',
    ],
    CARENCIA_VALIDACAO: [
      'Observe se busca validação constante',
      'Atenção a manipulação emocional',
      'Veja se há respeito aos seus limites',
    ],
    RECEM_SAIU_RELACAO: [
      'Observe se está emocionalmente disponível',
      'Atenção a comparações com ex',
      'Veja se há espaço para um relacionamento novo',
    ],
    SEM_DISPONIBILIDADE_REAL: [
      'Confirme disponibilidade real para encontros',
      'Observe padrões de comunicação',
      'Atenção a prioridades e compromissos',
    ],
  }

  return observations[hypothesisKey] || ['Continue observando os padrões de comportamento']
}

function evaluateFlags(
  flagConfigs: any[],
  input: AnalysisInput,
  scores: ScoreResult
): FlagResult[] {
  const flags: FlagResult[] = []

  for (const flagConfig of flagConfigs) {
    let matches = true
    const evidenceSignals: Array<{ code: string; label: string; why: string }> = []

    for (const trigger of flagConfig.triggers || []) {
      if (trigger.required === false && !matches) {
        continue
      }

      if (trigger.field === 'sinais_alerta' && trigger.contains) {
        if (input.sinais_alerta.includes(trigger.value)) {
          evidenceSignals.push({
            code: trigger.value,
            label: getSignalLabel(trigger.value),
            why: `Sinal de alerta "${getSignalLabel(trigger.value)}" presente`,
          })
        } else {
          if (trigger.required !== false) matches = false
        }
      } else if (trigger.score && trigger.operator) {
        const scoreValue = (scores as any)[trigger.field]
        const conditionMet =
          trigger.operator === '>=' ? scoreValue >= trigger.value : scoreValue <= trigger.value
        if (conditionMet) {
          evidenceSignals.push({
            code: `${trigger.field}_${trigger.operator}_${trigger.value}`,
            label: `Score ${trigger.field} ${trigger.operator} ${trigger.value}`,
            why: `Score de ${trigger.field} está em ${scoreValue}`,
          })
        } else {
          if (trigger.required !== false) matches = false
        }
      } else {
        const inputValue = (input as any)[trigger.field]
        const conditionMet = trigger.operator
          ? trigger.operator === '>=' && inputValue >= trigger.value
          : inputValue === trigger.value

        if (conditionMet) {
          evidenceSignals.push({
            code: `${trigger.field}_${trigger.value}`,
            label: `${trigger.field} = ${trigger.value}`,
            why: `${trigger.field} corresponde ao padrão`,
          })
        } else {
          if (trigger.required !== false) matches = false
        }
      }
    }

    if (matches && evidenceSignals.length > 0) {
      flags.push({
        severity: flagConfig.severity,
        title: flagConfig.title,
        evidence_signals: evidenceSignals,
        impact: flagConfig.impact,
      })
    }
  }

  return flags
}

function getSignalLabel(signal: string): string {
  const labels: Record<string, string> = {
    LOVE_BOMBING: 'Love bombing',
    CIUME_CEDO: 'Ciúme cedo',
    VITIMISMO: 'Vitimismo',
    HOSTILIDADE: 'Hostilidade',
    CONTRADICOES: 'Contradições',
    SUMICO_POS_INTIMIDADE: 'Sumiço pós-intimidade',
    TRIANGULACAO: 'Triangulação',
  }
  return labels[signal] || signal
}

function generateNextActions(input: AnalysisInput, scores: ScoreResult): Array<{
  stage: string
  action: string
  reason: string
}> {
  const actions: Array<{ stage: string; action: string; reason: string }> = []

  if (input.estagio === 'FIRST_CHAT') {
    if (scores.reciprocidade < 50) {
      actions.push({
        stage: 'FIRST_CHAT',
        action: 'Observe se há reciprocidade nas próximas interações',
        reason: 'Reciprocidade baixa detectada',
      })
    }
    if (scores.risco_ghosting > 60) {
      actions.push({
        stage: 'FIRST_CHAT',
        action: 'Teste de consistência: observe padrão de resposta',
        reason: 'Risco de ghosting elevado',
      })
    }
  }

  if (input.estagio === 'TALKING') {
    if (scores.intencao > 70 && !input.encontro_marcado) {
      actions.push({
        stage: 'TALKING',
        action: 'Considere propor encontro em janela de 1-2 semanas',
        reason: 'Intenção alta detectada',
      })
    }
    if (scores.risco_enrolacao > 60) {
      actions.push({
        stage: 'TALKING',
        action: 'Estabeleça limite claro sobre expectativas',
        reason: 'Risco de enrolação detectado',
      })
    }
  }

  if (input.estagio === 'POST_DATE') {
    if (scores.consistencia < 50) {
      actions.push({
        stage: 'POST_DATE',
        action: 'Observe padrão de comportamento consistente',
        reason: 'Consistência baixa detectada',
      })
    }
  }

  return actions
}

export function analyze(input: AnalysisInput): AnalysisResult {
  // Calculate all scores
  const scores: ScoreResult = {
    consistencia: calculateScore((ruleset as any).scores.consistencia, input),
    reciprocidade: calculateScore((ruleset as any).scores.reciprocidade, input),
    disponibilidade: calculateScore((ruleset as any).scores.disponibilidade, input),
    respeito: calculateScore((ruleset as any).scores.respeito, input),
    intencao: calculateScore((ruleset as any).scores.intencao, input),
    risco_ghosting: calculateScore((ruleset as any).scores.risco_ghosting, input),
    risco_enrolacao: calculateScore((ruleset as any).scores.risco_enrolacao, input),
  }

  // Recalculate with all scores available for hypotheses that depend on scores
  const finalScores = {
    ...scores,
    consistencia: calculateScore((ruleset as any).scores.consistencia, input, scores),
    reciprocidade: calculateScore((ruleset as any).scores.reciprocidade, input, scores),
    disponibilidade: calculateScore((ruleset as any).scores.disponibilidade, input, scores),
    respeito: calculateScore((ruleset as any).scores.respeito, input, scores),
    intencao: calculateScore((ruleset as any).scores.intencao, input, scores),
    risco_ghosting: calculateScore((ruleset as any).scores.risco_ghosting, input, scores),
    risco_enrolacao: calculateScore((ruleset as any).scores.risco_enrolacao, input, scores),
  }

  // Evaluate hypotheses
  const allHypotheses: HypothesisResult[] = []
  for (const [key, config] of Object.entries((ruleset as any).hypotheses)) {
    const hypothesis = evaluateHypothesis(key, config, input, finalScores)
    if (hypothesis) {
      allHypotheses.push(hypothesis)
    }
  }

  // Sort by confidence and take top 3
  allHypotheses.sort((a, b) => {
    const confOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
    return confOrder[b.confidence] - confOrder[a.confidence]
  })
  const topHypotheses = allHypotheses.slice(0, 3)

  // Evaluate flags
  const redFlags = evaluateFlags((ruleset as any).red_flags, input, finalScores)
  const greenFlags = evaluateFlags((ruleset as any).green_flags, input, finalScores)

  // Generate next actions
  const nextActions = generateNextActions(input, finalScores)

  // Free teaser: 1 hypothesis + 3 flags + 2 scores
  const freeTeaser = {
    hypothesis: topHypotheses[0] || null,
    flags: [...redFlags.slice(0, 2), ...greenFlags.slice(0, 1)],
    scores: {
      risco_ghosting: finalScores.risco_ghosting,
      intencao: finalScores.intencao,
    },
  }

  return {
    nome_match: input.nome_match, // Incluir nome do match para personalização
    scores: finalScores,
    hypotheses: topHypotheses,
    red_flags: redFlags,
    green_flags: greenFlags,
    next_actions: nextActions,
    free_teaser: freeTeaser,
    premium: {
      all_scores: finalScores,
      all_hypotheses: allHypotheses,
      all_red_flags: redFlags,
      all_green_flags: greenFlags,
      next_actions: nextActions,
    },
  }
}
