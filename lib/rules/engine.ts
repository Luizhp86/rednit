// @ts-ignore - JSON import
import ruleset from './ruleset.json'

export type AnalysisInput = {
  genero_match: 'ELE' | 'ELA'
  // Campos opcionais para suportar formulários temáticos
  objetivo_usuario?: 'CASUAL' | 'CONHECER' | 'NAMORO'
  ritmo_usuario?: 'RAPIDO' | 'MEDIO' | 'LENTO'
  estagio?: 'FIRST_CHAT' | 'TALKING' | 'POST_DATE'
  iniciativa?: 'VOCE' | 'MATCH' | 'MEIO_A_MEIO'
  frequencia_contato?: 'DIARIA' | 'ALTERNADA' | 'SOME'
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
  // Campos de formulários temáticos (passthrough)
  [key: string]: any
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
    question_weights_applied?: boolean
  }
  scores: Scores
  hypotheses_top3: HypothesisResult[]
  red_flags: FlagResult[]
  green_flags: FlagResult[]
  next_actions: string[]
  signals_fired: SignalFired[]
  free_teaser: FreeTeaser
  premium_report: PremiumReport
  nome_match?: string
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function getStageMultiplier(stage?: string): number {
  if (!stage) return 1.0
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

  // Textos amigáveis para o usuário (sem enums técnicos)
  const friendlyWhyTexts: Record<string, Record<string, string>> = {
    iniciativa: {
      'VOCE': 'Você sempre toma a iniciativa de conversar',
      'MATCH': 'O match sempre toma a iniciativa',
      'MEIO_A_MEIO': 'Ambos iniciam conversas de forma equilibrada'
    },
    frequencia_contato: {
      'DIARIA': 'Vocês conversam todos os dias',
      'ALTERNADA': 'Vocês conversam alguns dias sim, outros não',
      'SOME': 'Contato raro ou intermitente'
    },
    tempo_resposta: {
      'MINUTOS': 'Responde rapidamente (em minutos)',
      'HORAS': 'Responde no mesmo dia (em horas)',
      'DIAS': 'Demora dias para responder'
    },
    curiosidade_por_voce: {
      'ALTA': 'Demonstra bastante interesse em conhecer você',
      'MEDIA': 'Demonstra interesse moderado por você',
      'BAIXA': 'Demonstra pouco interesse em conhecer você'
    },
    respeito_limites: {
      'RESPEITA': 'Respeita completamente seus limites',
      'NEGOCIA': 'Tenta negociar quando você coloca limites',
      'INSISTE': 'Insiste mesmo depois que você diz não',
      'DEBOCHA': 'Ridiculariza ou debocha dos seus limites'
    },
    fala_futuro: {
      'NAO': 'Evita falar sobre planos futuros',
      'FALA': 'Fala sobre futuro mas não concretiza',
      'FALA_E_FAZ': 'Fala sobre futuro e cumpre o que promete'
    },
    encontro_marcado: {
      'SIM': 'Já marcaram ou tiveram um encontro',
      'NAO': 'Ainda não marcaram nenhum encontro'
    },
    cancelou_encontro: {
      'SIM': 'Já cancelou um encontro marcado',
      'NAO': 'Nunca cancelou um encontro'
    },
    remarcou_com_data: {
      'SIM': 'Remarcou com uma nova data específica',
      'NAO': 'Cancelou mas não remarcou com data definida',
      'NAO_SE_APLICA': 'Não houve cancelamento'
    },
    disponivel_so_madrugada: {
      'SIM': 'Só está disponível de madrugada',
      'NAO': 'Disponível em horários variados'
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

    // Usar texto amigável ou fallback para o label
    const friendlyWhy = friendlyWhyTexts[field]?.[inputValue] || signalConfig.label

    signals.push({
      code: signalConfig.code,
      label: signalConfig.label,
      why: friendlyWhy,
      weight_applied: 1
    })
  }

  return signals
}

function calculateScores(
  input: AnalysisInput, 
  signals: SignalFired[],
  questionWeights: Record<string, number> = {}
): Scores {
  // Usar valores base do ruleset (psicologicamente calibrados)
  const scoreConfigs = (ruleset as any).scores || {}
  const baseScores: Scores = {
    reciprocidade: scoreConfigs.reciprocidade?.base ?? 50,
    constancia: scoreConfigs.constancia?.base ?? 50,
    acao_mundo_real: scoreConfigs.acao_mundo_real?.base ?? 50,
    respeito: scoreConfigs.respeito?.base ?? 70, // Começa alto, desce com red flags
    coerencia: scoreConfigs.coerencia?.base ?? 50,
    disponibilidade: scoreConfigs.disponibilidade?.base ?? 50,
    risco_ghosting: scoreConfigs.risco_ghosting?.base ?? 25,
    risco_enrolacao: scoreConfigs.risco_enrolacao?.base ?? 25,
    compat_objetivo: scoreConfigs.compat_objetivo?.base ?? 50
  }

  const signalConfigs = (ruleset as any).signals || {}
  const stageMultiplier = getStageMultiplier(input.estagio)

  // Aplicar deltas dos signals com pesos ajustados
  for (const signal of signals) {
    const field = Object.keys(signalConfigs).find(f => {
      const fieldSignals = signalConfigs[f]
      return Object.values(fieldSignals).some((s: any) => s.code === signal.code)
    })

    if (field) {
      const fieldSignals = signalConfigs[field]
      const signalConfig = Object.values(fieldSignals).find((s: any) => s.code === signal.code) as any

      if (signalConfig?.deltas) {
        // Calcular multiplicador baseado no peso da pergunta
        // Peso 0-100 -> multiplicador 0.5x-2x (peso 50 = 1x padrão)
        const questionWeight = questionWeights[field] ?? 50
        const weightMultiplier = 0.5 + (questionWeight / 100) * 1.5
        
        for (const [dimension, delta] of Object.entries(signalConfig.deltas)) {
          let adjustedDelta = (delta as number) * weightMultiplier
          
          if (dimension === 'acao_mundo_real') {
            baseScores[dimension as keyof Scores] += adjustedDelta * stageMultiplier
          } else {
            baseScores[dimension as keyof Scores] += adjustedDelta
          }
        }
      }
    }
  }

  // Aplicar regras específicas para encontro_marcado
  if (input.encontro_marcado === 'NAO' && input.estagio) {
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

  // Calcular compat_objetivo baseado no objetivo do usuário
  // Usar TODOS os campos, não apenas os opcionais
  const userObjective = input.objetivo_usuario || 'CONHECER' // Default se não informado
  
  // ============================================
  // FATORES OBRIGATÓRIOS (sempre aplicados se existirem)
  // ============================================
  
  // Iniciativa - desequilíbrio é ruim para qualquer objetivo
  if (input.iniciativa) {
    if (input.iniciativa === 'VOCE') {
      baseScores.compat_objetivo -= 15 // Você sempre inicia = baixo interesse do match
    } else if (input.iniciativa === 'MEIO_A_MEIO') {
      baseScores.compat_objetivo += 15 // Equilibrado = bom sinal
    } else if (input.iniciativa === 'MATCH') {
      baseScores.compat_objetivo += 10 // Match inicia = interesse
    }
  }
  
  // Frequência de contato
  if (input.frequencia_contato) {
    if (input.frequencia_contato === 'DIARIA') {
      baseScores.compat_objetivo += 15
    } else if (input.frequencia_contato === 'SOME') {
      baseScores.compat_objetivo -= 20
    }
  }
  // ALTERNADA é neutro (0)
  
  // ============================================
  // FATORES POR OBJETIVO
  // ============================================
  
  if (userObjective === 'NAMORO') {
    // Para namoro sério, EXIGÊNCIAS ALTAS
    
    // Frequência importa muito
    if (input.frequencia_contato === 'SOME') {
      baseScores.compat_objetivo -= 10 // Penalidade adicional
    }
    
    // Campos opcionais quando preenchidos
    if (input.disponivel_so_madrugada === 'SIM') {
      baseScores.compat_objetivo -= 25 // Muito ruim para namoro
    }
    if (input.fala_futuro === 'NAO') {
      baseScores.compat_objetivo -= 15
    }
    if (input.fala_futuro === 'FALA') { // Fala mas não faz
      baseScores.compat_objetivo -= 25 // Future faking é péssimo
    }
    if (input.fala_futuro === 'FALA_E_FAZ') {
      baseScores.compat_objetivo += 25 // Ótimo para namoro
    }
    if (input.curiosidade_por_voce === 'BAIXA') {
      baseScores.compat_objetivo -= 20
    }
    if (input.curiosidade_por_voce === 'ALTA') {
      baseScores.compat_objetivo += 15
    }
    if (input.respeito_limites === 'RESPEITA') {
      baseScores.compat_objetivo += 20
    }
    if (input.respeito_limites === 'NEGOCIA') {
      baseScores.compat_objetivo -= 5
    }
    
    // Encontros são importantes para namoro
    if (input.encontro_marcado === 'SIM') {
      baseScores.compat_objetivo += 10
    }
    if (input.cancelou_encontro === 'SIM' && input.remarcou_com_data !== 'SIM') {
      baseScores.compat_objetivo -= 15
    }
    
    // Tempo de resposta
    if (input.tempo_resposta === 'DIAS') {
      baseScores.compat_objetivo -= 15
    }
    if (input.tempo_resposta === 'MINUTOS') {
      baseScores.compat_objetivo += 10
    }
    
  } else if (userObjective === 'CONHECER') {
    // Para "conhecer melhor", ser mais flexível mas ainda considerar sinais
    
    if (input.disponivel_so_madrugada === 'SIM') {
      baseScores.compat_objetivo -= 10
    }
    if (input.curiosidade_por_voce === 'BAIXA') {
      baseScores.compat_objetivo -= 10
    }
    if (input.curiosidade_por_voce === 'ALTA') {
      baseScores.compat_objetivo += 10
    }
    if (input.respeito_limites === 'RESPEITA') {
      baseScores.compat_objetivo += 10
    }
    if (input.tempo_resposta === 'DIAS') {
      baseScores.compat_objetivo -= 10
    }
    
  } else if (userObjective === 'CASUAL') {
    // Para casual, menos exigências mas respeito é essencial
    
    if (input.respeito_limites === 'RESPEITA') {
      baseScores.compat_objetivo += 15
    }
    // Disponibilidade madrugada não é problema para casual
    if (input.frequencia_contato === 'DIARIA') {
      baseScores.compat_objetivo += 5 // Bom mas não essencial
    }
  }
  
  // ============================================
  // DEAL BREAKERS (para qualquer objetivo)
  // ============================================
  if (input.respeito_limites === 'INSISTE') {
    baseScores.compat_objetivo -= 35
  }
  if (input.respeito_limites === 'DEBOCHA') {
    baseScores.compat_objetivo -= 50 // Praticamente minimiza
  }

  // ============================================
  // GRANULARIZAÇÃO DE RISCO_ENROLACAO
  // Adicionar fatores extras para mais variação
  // ============================================
  
  // Combinação de fatores que indicam enrolação
  if (input.iniciativa === 'VOCE' && input.frequencia_contato === 'SOME') {
    baseScores.risco_enrolacao += 12 // Você sempre puxa e ainda some = enrolação alta
  }
  if (input.iniciativa === 'VOCE' && input.tempo_resposta === 'DIAS') {
    baseScores.risco_enrolacao += 8 // Você sempre puxa e demora dias = baixa prioridade
  }
  if (input.fala_futuro === 'FALA' && input.encontro_marcado === 'NAO') {
    baseScores.risco_enrolacao += 15 // Fala de futuro mas não marca encontro = future faking
  }
  if (input.curiosidade_por_voce === 'BAIXA' && input.frequencia_contato === 'SOME') {
    baseScores.risco_enrolacao += 10 // Desinteressado e some = só quer passar tempo
  }
  
  // Fatores que REDUZEM enrolação
  if (input.iniciativa === 'MEIO_A_MEIO' && input.frequencia_contato === 'DIARIA') {
    baseScores.risco_enrolacao -= 12 // Equilibrado e frequente = investimento real
  }
  if (input.encontro_marcado === 'SIM' && input.cancelou_encontro === 'NAO') {
    baseScores.risco_enrolacao -= 10 // Marcou e não cancelou = ação real
  }
  if (input.fala_futuro === 'FALA_E_FAZ' && input.encontro_marcado === 'SIM') {
    baseScores.risco_enrolacao -= 15 // Cumpre o que promete = confiável
  }
  if (input.curiosidade_por_voce === 'ALTA' && input.tempo_resposta === 'MINUTOS') {
    baseScores.risco_enrolacao -= 8 // Interessado e responsivo = engajado
  }
  
  // ============================================
  // GRANULARIZAÇÃO DE COMPAT_OBJETIVO
  // Adicionar mais variação por combinações
  // ============================================
  
  // Padrões específicos por objetivo
  if (userObjective === 'NAMORO') {
    // Combo muito positivo para namoro
    if (input.fala_futuro === 'FALA_E_FAZ' && input.respeito_limites === 'RESPEITA') {
      baseScores.compat_objetivo += 12
    }
    // Combo preocupante para namoro
    if (input.disponivel_so_madrugada === 'SIM' && input.curiosidade_por_voce === 'BAIXA') {
      baseScores.compat_objetivo -= 18
    }
  } else if (userObjective === 'CONHECER') {
    // Para conhecer, equilíbrio é mais importante
    if (input.iniciativa === 'MEIO_A_MEIO' && input.curiosidade_por_voce === 'ALTA') {
      baseScores.compat_objetivo += 12
    }
    if (input.frequencia_contato === 'SOME' && input.tempo_resposta === 'DIAS') {
      baseScores.compat_objetivo -= 15 // Desengajado
    }
  } else if (userObjective === 'CASUAL') {
    // Para casual, respeito e comunicação clara importam
    if (input.respeito_limites === 'RESPEITA' && input.frequencia_contato !== 'SOME') {
      baseScores.compat_objetivo += 10
    }
    if (input.respeito_limites !== 'RESPEITA' && input.iniciativa === 'VOCE') {
      baseScores.compat_objetivo -= 12 // Você sempre puxa e não respeita = situação ruim
    }
  }
  
  // Fatores universais de variação
  if (input.sinais_alerta && input.sinais_alerta.length >= 3) {
    baseScores.compat_objetivo -= 8 // Muitos alertas = compatibilidade reduzida
    baseScores.risco_enrolacao += 5
  }
  if (input.sinais_alerta && input.sinais_alerta.length >= 5) {
    baseScores.compat_objetivo -= 12 // Situação muito preocupante
    baseScores.risco_enrolacao += 8
  }
  
  // Variação por estágio (mais tempo sem progresso = pior)
  if (input.estagio === 'TALKING' && input.encontro_marcado === 'NAO') {
    baseScores.risco_enrolacao += 7 // Conversando mas não marcou = estagnado
    baseScores.compat_objetivo -= 5
  }
  if (input.estagio === 'POST_DATE' && input.fala_futuro === 'NAO') {
    baseScores.risco_enrolacao += 10 // Após encontro e não fala de futuro = interesse físico apenas
    baseScores.compat_objetivo -= 8
  }

  // ============================================
  // CAMPOS DE FORMULÁRIOS TEMÁTICOS
  // Adicionar variação baseada em campos específicos
  // ============================================
  
  // Campos do tema "Encontro de Carnaval"
  if (input.nivel_embriaguez) {
    if (input.nivel_embriaguez === 'BASTANTE' || input.nivel_embriaguez === 'MUITO') {
      baseScores.coerencia -= 10 // Decisões sob influência são menos confiáveis
      baseScores.risco_enrolacao += 8 // Pode ter sido só o momento
    }
    if (input.nivel_embriaguez === 'NADA' || input.nivel_embriaguez === 'POUCO') {
      baseScores.coerencia += 5 // Decisão mais consciente
      baseScores.risco_enrolacao -= 5
    }
  }
  
  if (input.vibe_mensagens) {
    if (input.vibe_mensagens === 'EMPOLGADO' || input.vibe_mensagens === 'CARINHOSO') {
      baseScores.reciprocidade += 8
      baseScores.risco_ghosting -= 5
      baseScores.compat_objetivo += 5
    }
    if (input.vibe_mensagens === 'FRIO' || input.vibe_mensagens === 'SECO') {
      baseScores.reciprocidade -= 12
      baseScores.risco_enrolacao += 10
      baseScores.compat_objetivo -= 8
    }
    if (input.vibe_mensagens === 'NAO_RESPONDEU') {
      baseScores.risco_ghosting += 25
      baseScores.risco_enrolacao += 15
      baseScores.compat_objetivo -= 15
    }
  }
  
  if (input.como_despedida) {
    if (input.como_despedida === 'TROCARAM' || input.como_despedida === 'BEIJO_MAIS') {
      baseScores.acao_mundo_real += 10
      baseScores.compat_objetivo += 5
    }
    if (input.como_despedida === 'SEM_CONTATO' || input.como_despedida === 'FUGIU') {
      baseScores.risco_ghosting += 15
      baseScores.compat_objetivo -= 10
    }
  }
  
  if (input.quem_mensagem_depois) {
    if (input.quem_mensagem_depois === 'ELE_ELA') {
      baseScores.reciprocidade += 10
      baseScores.risco_enrolacao -= 8
    }
    if (input.quem_mensagem_depois === 'NINGUEM') {
      baseScores.risco_ghosting += 15
      baseScores.risco_enrolacao += 10
    }
    if (input.quem_mensagem_depois === 'EU') {
      baseScores.reciprocidade -= 8
      baseScores.risco_enrolacao += 5
    }
  }
  
  if (input.marcaram_ver_fora) {
    if (input.marcaram_ver_fora === 'SIM_COM_DATA') {
      baseScores.acao_mundo_real += 15
      baseScores.risco_enrolacao -= 12
      baseScores.compat_objetivo += 10
    }
    if (input.marcaram_ver_fora === 'SIM_SEM_DATA') {
      baseScores.risco_enrolacao += 8 // Interesse mas sem compromisso concreto
    }
    if (input.marcaram_ver_fora === 'NAO') {
      baseScores.risco_enrolacao += 12
      baseScores.compat_objetivo -= 8
    }
  }
  
  if (input.tinha_contato_antes) {
    if (input.tinha_contato_antes === 'SIM') {
      baseScores.constancia += 8 // Já se conheciam = mais contexto
      baseScores.compat_objetivo += 5
    }
  }
  
  if (input.onde_conheceram) {
    // Contexto influencia expectativas
    if (input.onde_conheceram === 'APP' || input.onde_conheceram === 'REDE_SOCIAL') {
      // Contexto digital = intenções mais claras geralmente
      baseScores.compat_objetivo += 3
    }
    if (input.onde_conheceram === 'BALADA' || input.onde_conheceram === 'FESTA' || input.onde_conheceram === 'BLOCO') {
      // Contexto festa = mais incerteza sobre intenções reais
      baseScores.risco_enrolacao += 5
    }
  }

  // ============================================
  // CLAMP FINAL: Todos entre 10-90 (nunca certeza absoluta)
  // ============================================
  const clamped: Scores = {
    reciprocidade: clamp(baseScores.reciprocidade, 10, 90),
    constancia: clamp(baseScores.constancia, 10, 90),
    acao_mundo_real: clamp(baseScores.acao_mundo_real, 10, 90),
    respeito: clamp(baseScores.respeito, 10, 90),
    coerencia: clamp(baseScores.coerencia, 10, 90),
    disponibilidade: clamp(baseScores.disponibilidade, 10, 90),
    risco_ghosting: clamp(baseScores.risco_ghosting, 10, 90),
    risco_enrolacao: clamp(baseScores.risco_enrolacao, 10, 90),
    compat_objetivo: clamp(baseScores.compat_objetivo, 10, 90)
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
      'Teste: proponha algo concreto e observe a reação (encontro, plano específico)',
      'Observe se faz perguntas pessoais ou só responde o que você pergunta',
      'Note se a frequência de contato diminui quando você para de iniciar'
    ],
    BUSCA_FIXO: [
      'Verifique se as promessas se transformam em ações nas próximas semanas',
      'Observe se mantém a consistência mesmo quando você não inicia',
      'Note se demonstra interesse em conhecer pessoas importantes para você'
    ],
    CARENCIA_VALIDACAO: [
      'Observe se fica ansioso(a) quando você demora para responder',
      'Note se há ciúme ou questionamentos excessivos sobre sua vida',
      'Atenção a mudanças de humor bruscas baseadas na sua atenção'
    ],
    RECEM_SAIU_RELACAO: [
      'Observe se menciona o ex com frequência (positiva ou negativamente)',
      'Note se parece estar se provando algo ou comparando você',
      'Atenção a padrões de hot/cold (muito intenso, depois distante)'
    ],
    SEM_DISPONIBILIDADE_REAL: [
      'Teste: proponha encontros em horários normais por 2-3 semanas',
      'Observe se sempre há desculpas para não concretizar',
      'Note se a comunicação só acontece em horários específicos'
    ],
    INTERESSE_SUPERFICIAL: [
      'Observe se conversas são sempre superficiais ou focadas no físico',
      'Teste: traga temas mais profundos e veja o engajamento',
      'Note se evita conhecer você em contextos não-românticos'
    ]
  }
  return observations[key] || ['Continue observando os padrões de comportamento nas próximas 48-72h']
}

function generateObserveToRefute(key: string): string[] {
  const refutations: Record<string, string[]> = {
    EXPLORANDO: [
      'Se propor encontros e planos concretos por iniciativa própria',
      'Se demonstrar curiosidade genuína sobre sua vida',
      'Se a frequência de contato aumentar naturalmente'
    ],
    BUSCA_FIXO: [
      'Se houver inconsistência entre palavras e ações',
      'Se evitar definir o que vocês são',
      'Se a comunicação diminuir sem explicação'
    ],
    CARENCIA_VALIDACAO: [
      'Se respeitar seu tempo e espaço sem pressão',
      'Se manter estabilidade emocional',
      'Se não usar culpa ou vitimismo para conseguir atenção'
    ],
    RECEM_SAIU_RELACAO: [
      'Se demonstrar clareza sobre o que busca agora',
      'Se não mencionar o ex constantemente',
      'Se manter consistência emocional'
    ],
    SEM_DISPONIBILIDADE_REAL: [
      'Se reorganizar agenda para te encontrar em horários normais',
      'Se propor alternativas concretas quando não pode',
      'Se manter comunicação constante independente do horário'
    ],
    INTERESSE_SUPERFICIAL: [
      'Se demonstrar interesse por sua vida, trabalho, família',
      'Se propor atividades além de encontros íntimos',
      'Se engajar em conversas profundas e significativas'
    ]
  }
  return refutations[key] || ['Se os padrões de comportamento mudarem consistentemente']
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
  // Campos padrão do formulário tradicional
  const standardFields = ['genero_match', 'objetivo_usuario', 'ritmo_usuario', 'estagio', 'iniciativa', 'frequencia_contato']
  const optionalFields = ['tempo_resposta', 'curiosidade_por_voce', 'respeito_limites', 'fala_futuro', 'encontro_marcado', 'cancelou_encontro', 'remarcou_com_data', 'disponivel_so_madrugada', 'texto_bio_match', 'trecho_chat']

  // Contar todos os campos preenchidos (incluindo campos de formulários temáticos)
  const excludeFields = ['sinais_alerta', 'inegociaveis', 'themeId']
  let filledCount = 0
  let totalCount = 0
  
  for (const [key, value] of Object.entries(input)) {
    if (excludeFields.includes(key)) continue
    if (Array.isArray(value)) continue // Arrays são tratados separadamente
    
    totalCount++
    if (value !== undefined && value !== null && value !== '') {
      filledCount++
    }
  }

  // Se não há campos suficientes para calcular, retornar um valor base
  if (totalCount === 0) return 50
  
  return Math.min(100, Math.round((filledCount / totalCount) * 100))
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
  
  // Nome do match para personalização (usar "match" se não informado)
  const matchName = input.nome_match?.trim() || 'match'

  // Escolher o maior risco
  const riskType = scores.risco_ghosting > scores.risco_enrolacao ? 'risco_ghosting' : 'risco_enrolacao'
  const riskValue = scores[riskType]
  const riskLabel = riskType === 'risco_ghosting' ? 'Risco de Ghosting' : 'Risco de Enrolação'

  // Headline baseado em psicologia - mais preciso e impactante, usando nome do match
  let headline = `🔍 Análise de ${matchName} concluída: padrões identificados`
  
  // Prioridade 1: Red flags críticos
  if (scores.respeito < 30) {
    headline = `🚨 ALERTA sobre ${matchName}: Sinais de desrespeito detectados`
  } else if (hypothesis1) {
    const hypothesisLabels: Record<string, string> = {
      EXPLORANDO: `⚠️ ${matchName} pode estar "conhecendo opções"`,
      BUSCA_FIXO: `💚 ${matchName} demonstra interesse genuíno`,
      CARENCIA_VALIDACAO: `🚩 ${matchName} pode buscar validação constante`,
      RECEM_SAIU_RELACAO: `⏰ ${matchName} pode estar em rebote`,
      SEM_DISPONIBILIDADE_REAL: `⏳ ${matchName} pode estar evitando compromisso`,
      INTERESSE_SUPERFICIAL: `⚠️ ${matchName} demonstra interesse superficial`
    }
    headline = hypothesisLabels[hypothesis1.key] || headline
  } else if (riskValue > 70) {
    headline = `🚨 ${matchName}: ${riskLabel} elevado em ${riskValue}%`
  } else if (riskValue > 50) {
    headline = `⚠️ ${matchName}: ${riskLabel} moderado detectado`
  } else if (scores.reciprocidade > 70 && scores.constancia > 70 && scores.respeito > 70) {
    headline = `💚 ${matchName} apresenta sinais muito positivos`
  } else if (scores.reciprocidade > 60 && scores.constancia > 60) {
    headline = `🔍 ${matchName} apresenta sinais moderadamente positivos`
  }

  // Observe 48h mais específico e acionável
  const observe48h: string[] = []
  if (hypothesis1) {
    const firstObserve = hypothesis1.observe_to_confirm[0] || `Continue observando padrões de comportamento de ${matchName}`
    observe48h.push(firstObserve.replace(/a pessoa|o match|match|ele\/ela/gi, matchName))
    if (hypothesis1.observe_to_confirm[1]) {
      observe48h.push(hypothesis1.observe_to_confirm[1].replace(/a pessoa|o match|match|ele\/ela/gi, matchName))
    }
  } else if (riskValue > 60) {
    observe48h.push(`Teste: observe se o padrão de ${riskLabel.toLowerCase()} de ${matchName} se mantém`)
    observe48h.push(`Avalie se há sinais de mudança de comportamento em ${matchName}`)
  } else {
    observe48h.push(`Observe a consistência de ${matchName} na comunicação nas próximas 48h`)
    observe48h.push(`Verifique se ${matchName} demonstra reciprocidade nas interações`)
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
      `Top 3 hipóteses sobre ${matchName}`,
      'Mapa de risco detalhado',
      'Análise de compatibilidade',
      'Checklist de validação',
      'Plano de ação por estágio'
    ],
    clarity_percent: clarityPercent,
    nome_match: matchName // Adicionar nome_match ao free_teaser
  } as FreeTeaser & { nome_match: string }
}

function generatePremiumReport(
  input: AnalysisInput,
  scores: Scores,
  hypotheses: HypothesisResult[],
  redFlags: FlagResult[],
  greenFlags: FlagResult[]
): PremiumReport {
  // Nome do match para personalização (usar "match" se não informado)
  const matchName = input.nome_match?.trim() || 'match'
  const pronome = input.genero_match === 'ELE' ? 'ele' : 'ela'
  const pronomePossessivo = input.genero_match === 'ELE' ? 'dele' : 'dela'
  
  const hypothesisLabels: Record<string, { title: string; description: string }> = {
    EXPLORANDO: { 
      title: `${matchName} pode estar explorando opções`, 
      description: `${matchName} mantém uma conexão superficial e evita compromisso real. Pode estar conversando com múltiplas pessoas ao mesmo tempo.` 
    },
    BUSCA_FIXO: { 
      title: `${matchName} parece buscar algo sério`, 
      description: `${matchName} demonstra investimento consistente e interesse genuíno em construir algo com você.` 
    },
    CARENCIA_VALIDACAO: { 
      title: `${matchName} pode estar buscando validação`, 
      description: `${matchName} apresenta padrão de apego ansioso - pode ser intenso(a) demais e buscar validação constante.` 
    },
    RECEM_SAIU_RELACAO: { 
      title: `${matchName} pode estar em rebote`, 
      description: `${matchName} pode estar emocionalmente indisponível ou usando o relacionamento para superar o ex.` 
    },
    SEM_DISPONIBILIDADE_REAL: { 
      title: `${matchName} parece indisponível emocionalmente`, 
      description: `${matchName} apresenta padrão evitativo - evita intimidade real e mantém distância emocional.` 
    },
    INTERESSE_SUPERFICIAL: { 
      title: `${matchName} demonstra interesse superficial`, 
      description: `${matchName} tem foco no superficial/físico, com baixo investimento emocional genuíno.` 
    }
  }

  const executiveSummary: string[] = []
  
  // Análise geral baseada nos scores
  const overallHealth = (scores.reciprocidade + scores.constancia + scores.respeito) / 3
  if (overallHealth >= 70) {
    executiveSummary.push(`✅ ${matchName} apresenta sinais positivos - o relacionamento tem potencial saudável`)
  } else if (overallHealth >= 50) {
    executiveSummary.push(`⚠️ ${matchName} apresenta sinais mistos - observe com atenção antes de investir mais`)
  } else {
    executiveSummary.push(`🚨 ${matchName} apresenta sinais preocupantes - considere seriamente se vale continuar`)
  }
  
  if (hypotheses.length > 0) {
    const h = hypotheses[0]
    const label = hypothesisLabels[h.key]
    executiveSummary.push(`Perfil provável de ${matchName}: ${label?.title?.replace(`${matchName} `, '') || h.key} (${h.confidence === 'HIGH' ? 'alta' : h.confidence === 'MEDIUM' ? 'média' : 'baixa'} confiança)`)
  }
  
  // Destaque dos scores mais relevantes
  if (scores.respeito < 50) {
    executiveSummary.push(`⚠️ O respeito de ${matchName} aos seus limites é baixo (${scores.respeito}/100) - sinal de alerta importante`)
  }
  if (scores.reciprocidade < 40) {
    executiveSummary.push(`⚠️ A reciprocidade de ${matchName} é baixa (${scores.reciprocidade}/100) - você está investindo mais do que ${pronome}`)
  }
  if (scores.coerencia < 40) {
    executiveSummary.push(`⚠️ A coerência de ${matchName} é baixa (${scores.coerencia}/100) - palavras não batem com ações`)
  }
  
  if (redFlags.length > 0) {
    executiveSummary.push(`🚩 ${redFlags.length} red flag(s) identificado(s) em ${matchName}: ${redFlags.map(f => f.title).join(', ')}`)
  }
  
  if (greenFlags.length > 0) {
    executiveSummary.push(`💚 ${greenFlags.length} green flag(s) identificado(s) em ${matchName}: ${greenFlags.map(f => f.title).join(', ')}`)
  }

  // Explicações de risco mais detalhadas
  const riskExplanations: string[] = []
  if (scores.risco_ghosting > 60) {
    riskExplanations.push(`🔴 Risco alto de ${matchName} dar ghosting (${scores.risco_ghosting}%) - padrão evitativo identificado, comunicação intermitente`)
  } else if (scores.risco_ghosting > 40) {
    riskExplanations.push(`🟡 Risco moderado de ${matchName} dar ghosting (${scores.risco_ghosting}%) - alguns sinais de evitação`)
  } else {
    riskExplanations.push(`🟢 Risco baixo de ${matchName} dar ghosting (${scores.risco_ghosting}%) - comunicação relativamente consistente`)
  }
  
  if (scores.risco_enrolacao > 60) {
    riskExplanations.push(`🔴 Risco alto de ${matchName} enrolar (${scores.risco_enrolacao}%) - promessas sem ações concretas, evita definições`)
  } else if (scores.risco_enrolacao > 40) {
    riskExplanations.push(`🟡 Risco moderado de ${matchName} enrolar (${scores.risco_enrolacao}%) - observe se há evolução`)
  } else {
    riskExplanations.push(`🟢 Risco baixo de ${matchName} enrolar (${scores.risco_enrolacao}%) - sinais de comprometimento`)
  }

  // Compatibilidade mais detalhada
  const compatibilityAlignment = scores.compat_objetivo >= 65 ? 'ALINHADO' : 
                                 scores.compat_objetivo >= 45 ? 'PARCIAL' : 'DESALINHADO'
  
  const objetivoLabels: Record<string, string> = {
    'NAMORO': 'namoro sério',
    'CONHECER': 'conhecer melhor',
    'CASUAL': 'algo casual'
  }
  
  const userObjective = input.objetivo_usuario || 'CONHECER'
  let compatExplanation = `Compatibilidade de ${matchName} com seu objetivo (${objetivoLabels[userObjective] || userObjective}): ${scores.compat_objetivo}/100. `
  if (compatibilityAlignment === 'ALINHADO') {
    compatExplanation += `O comportamento de ${matchName} é compatível com o que você busca.`
  } else if (compatibilityAlignment === 'PARCIAL') {
    compatExplanation += `${matchName} apresenta alguns sinais de compatibilidade, mas também pontos de atenção.`
  } else {
    compatExplanation += `O comportamento de ${matchName} não parece compatível com o que você busca.`
  }

  // Checklist de validação mais específico
  const validationChecklist: string[] = []
  
  if (hypotheses.length > 0) {
    const h1Confirms = hypotheses[0].observe_to_confirm || []
    // Personalizar os itens de confirmação com o nome do match
    validationChecklist.push(...h1Confirms.slice(0, 2).map(item => 
      item.replace(/a pessoa|o match|match|ele\/ela/gi, matchName)
    ))
  }
  
  // Itens baseados nos scores problemáticos
  if (scores.reciprocidade < 50) {
    validationChecklist.push(`Teste: não inicie contato por 48-72h e observe se ${matchName} procura você`)
  }
  if (scores.coerencia < 50) {
    validationChecklist.push(`Anote as promessas de ${matchName} e verifique se são cumpridas na próxima semana`)
  }
  if (scores.acao_mundo_real < 50) {
    validationChecklist.push(`Proponha algo concreto (encontro, atividade) para ${matchName} e observe a resposta`)
  }
  
  validationChecklist.push(`Observe se o padrão de comunicação de ${matchName} é consistente ao longo da semana`)
  validationChecklist.push(`Note como ${matchName} reage quando você estabelece limites ou diz não`)

  // Plano por estágio mais detalhado
  const stageActions: Record<string, { actions: string[]; metrics: string[] }> = {
    'FIRST_CHAT': {
      actions: [
        `Mantenha expectativas baixas com ${matchName} - é cedo para avaliar`,
        `Observe os padrões de comunicação de ${matchName} sem pressionar`,
        'Não invista emocionalmente demais nesta fase'
      ],
      metrics: [
        `Qualidade das respostas de ${matchName} (engajamento vs. monossilábicas)`,
        `Interesse de ${matchName} em conhecer você`,
        `Respeito de ${matchName} a limites básicos`
      ]
    },
    'TALKING': {
      actions: [
        `Teste reciprocidade: reduza iniciativa e observe a resposta de ${matchName}`,
        `Proponha encontro para ${matchName} validar interesse real`,
        `Estabeleça para ${matchName} o que você busca de forma clara`
      ],
      metrics: [
        `Evolução da frequência e qualidade da comunicação de ${matchName}`,
        `Disposição de ${matchName} para encontros no mundo real`,
        `Consistência de ${matchName} entre palavras e ações`
      ]
    },
    'POST_DATE': {
      actions: [
        `Observe se a comunicação de ${matchName} mantém ou aumenta após o encontro`,
        `Defina expectativas claras com ${matchName} sobre o que vocês são`,
        'Não aceite indefinição prolongada - estabeleça prazo mental'
      ],
      metrics: [
        `Frequência de contato de ${matchName} pós-encontro vs. antes`,
        `Iniciativa de ${matchName} de marcar novo encontro`,
        `Clareza de ${matchName} sobre intenções e exclusividade`
      ]
    }
  }

  const currentStageConfig = stageActions[input.estagio || 'TALKING'] || stageActions['TALKING']

  // Adicionar hipóteses com títulos e descrições
  const enrichedHypotheses = hypotheses.map(h => ({
    ...h,
    title: hypothesisLabels[h.key]?.title || h.key,
    description: hypothesisLabels[h.key]?.description || ''
  }))

  return {
    executive_summary: executiveSummary,
    hypothesis_1: enrichedHypotheses[0] || null,
    hypothesis_2: enrichedHypotheses[1] || null,
    hypothesis_3: enrichedHypotheses[2] || null,
    full_risk_map: {
      risco_ghosting: scores.risco_ghosting,
      risco_enrolacao: scores.risco_enrolacao,
      explanations: riskExplanations
    },
    compatibility_explained: {
      score: scores.compat_objetivo,
      explanation: compatExplanation,
      alignment: compatibilityAlignment
    },
    validation_checklist: validationChecklist.slice(0, 6),
    stage_plan: [{
      stage: input.estagio || 'FIRST_CHAT',
      actions: currentStageConfig.actions,
      metrics: currentStageConfig.metrics
    }]
  }
}

function generateNextActions(input: AnalysisInput, scores: Scores): string[] {
  const actions: string[] = []

  // Ações prioritárias baseadas em red flags
  if (scores.respeito < 40) {
    actions.push('PRIORIDADE: Avalie seriamente se vale a pena continuar - desrespeito a limites é deal breaker')
  }

  // Ações baseadas em desequilíbrio
  if (scores.reciprocidade < 40) {
    actions.push('Teste: pare de iniciar conversas por 48-72h e observe se a pessoa procura você')
  } else if (scores.reciprocidade < 55) {
    actions.push('Reduza um pouco sua iniciativa e observe se há compensação do outro lado')
  }

  // Ações baseadas em riscos
  if (scores.risco_ghosting > 60) {
    actions.push('Não invista emocionalmente demais - mantenha expectativas realistas')
  }

  if (scores.risco_enrolacao > 60) {
    actions.push('Defina um prazo mental: se não houver evolução em 2-3 semanas, reavalie')
  }

  // Ações baseadas em estágio
  if (input.estagio) {
    if (input.estagio === 'TALKING') {
      if (!input.encontro_marcado || input.encontro_marcado === 'NAO') {
        if (scores.acao_mundo_real > 50) {
          actions.push('Proponha um encontro casual para testar interesse real no mundo offline')
        } else {
          actions.push('Observe se há iniciativa de encontro do outro lado antes de propor')
        }
      }
    }

    if (input.estagio === 'POST_DATE') {
      if (scores.constancia < 50) {
        actions.push('Atenção: fase crítica pós-encontro - se comunicação diminuiu, pode ser sinal de desinteresse')
      }
    }
  }

  // Ações baseadas em coerência
  if (scores.coerencia < 40) {
    actions.push('Foque em AÇÕES, não em palavras - observe se promessas se concretizam')
  }

  // Ação positiva se tudo estiver bem
  if (scores.reciprocidade > 65 && scores.constancia > 65 && scores.respeito > 70) {
    actions.push('Continue investindo gradualmente - sinais são positivos, mas mantenha seu ritmo')
  }

  return actions.slice(0, 5)
}

export function analyze(
  input: AnalysisInput, 
  questionWeights: Record<string, number> = {}
): AnalysisResult {
  // Coletar signals
  const signals = collectSignals(input)

  // Calcular scores (passando pesos das perguntas)
  const scores = calculateScores(input, signals, questionWeights)

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

  // Nome do match para incluir no resultado (usar "match" se não informado)
  const matchName = input.nome_match?.trim() || 'match'
  
  return {
    meta: {
      created_at: new Date().toISOString(),
      stage: input.estagio || 'TALKING', // Default para TALKING se não informado
      completeness_score: completenessScore,
      question_weights_applied: Object.keys(questionWeights).length > 0,
    },
    scores,
    hypotheses_top3: hypotheses,
    red_flags: redFlags,
    green_flags: greenFlags,
    next_actions: nextActions,
    signals_fired: signals,
    free_teaser: freeTeaser,
    premium_report: premiumReport,
    nome_match: matchName // Incluir nome do match no nível raiz
  }
}
