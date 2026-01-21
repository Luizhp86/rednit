# Exemplo de Estrutura de Análise - rednit

Este documento mostra exemplos de saída do motor de análise conforme a especificação.

## Estrutura Completa (AnalysisResult)

```json
{
  "meta": {
    "analysis_id": "uuid-here",
    "created_at": "2024-01-20T10:30:00Z",
    "stage": "TALKING",
    "completeness_score": 75
  },
  "scores": {
    "reciprocidade": 65,
    "constancia": 58,
    "acao_mundo_real": 42,
    "respeito": 80,
    "coerencia": 55,
    "disponibilidade": 45,
    "risco_ghosting": 35,
    "risco_enrolacao": 68,
    "compat_objetivo": 60
  },
  "hypotheses_top3": [
    {
      "key": "EXPLORANDO",
      "confidence": "MEDIUM",
      "signals": [
        {
          "code": "FREQ_ALTERNADA",
          "label": "Frequência alternada",
          "why": "Campo \"frequencia_contato\" = \"ALTERNADA\"",
          "weight_applied": 1
        }
      ],
      "observe_to_confirm": [
        "Observe se há interesse em conhecer você além do físico",
        "Veja se há reciprocidade nas conversas"
      ],
      "observe_to_refute": [
        "Se demonstrar interesse genuíno e consistência"
      ]
    }
  ],
  "red_flags": [
    {
      "severity": "MEDIUM",
      "title": "Promessa sem ação",
      "impact": "Alto risco de enrolação e frustração",
      "signals": [
        {
          "code": "FUTURO_FALA_NAO_FAZ",
          "label": "Fala mas não faz",
          "why": "Campo \"fala_futuro\" = \"FALA\"",
          "weight_applied": 1
        }
      ]
    }
  ],
  "green_flags": [
    {
      "severity": "HIGH",
      "title": "Respeito",
      "benefit": "Sinal de maturidade emocional e respeito",
      "signals": [
        {
          "code": "RESPEITO_TOTAL",
          "label": "Respeita totalmente seus limites",
          "why": "Campo \"respeito_limites\" = \"RESPEITA\"",
          "weight_applied": 1
        }
      ]
    }
  ],
  "next_actions": [
    "Estabeleça limite claro sobre expectativas",
    "Observe padrão de comportamento consistente"
  ],
  "signals_fired": [
    {
      "code": "INICIATIVA_EQUILIBRADO",
      "label": "Iniciativa equilibrada",
      "why": "Campo \"iniciativa\" = \"MEIO_A_MEIO\"",
      "weight_applied": 1
    },
    {
      "code": "FREQ_ALTERNADA",
      "label": "Frequência alternada",
      "why": "Campo \"frequencia_contato\" = \"ALTERNADA\"",
      "weight_applied": 1
    }
  ],
  "free_teaser": {
    "headline": "Padrão exploratório detectado",
    "hypothesis_1": {
      "key": "EXPLORANDO",
      "confidence": "MEDIUM",
      "signals": [...],
      "observe_to_confirm": [...],
      "observe_to_refute": [...]
    },
    "ONE_risk_score": {
      "type": "risco_enrolacao",
      "value": 68,
      "label": "Risco de Enrolação"
    },
    "red_flag": {
      "severity": "MEDIUM",
      "title": "Promessa sem ação",
      "impact": "Alto risco de enrolação e frustração",
      "signals": [...]
    },
    "green_flag": {
      "severity": "HIGH",
      "title": "Respeito",
      "benefit": "Sinal de maturidade emocional e respeito",
      "signals": [...]
    },
    "observe_48h": [
      "Observe se há interesse em conhecer você além do físico"
    ],
    "locked_cards": [
      "Top 3 hipóteses",
      "Mapa de risco completo",
      "Compatibilidade",
      "Checklist validação",
      "Plano por estágio"
    ],
    "clarity_percent": 45
  },
  "premium_report": {
    "executive_summary": [
      "Hipótese principal: EXPLORANDO (confiança MEDIUM)",
      "Reciprocidade: 65/100",
      "Constância: 58/100",
      "Ação no mundo real: 42/100",
      "1 red flag(s) identificado(s)",
      "1 green flag(s) identificado(s)"
    ],
    "hypothesis_1": {...},
    "hypothesis_2": {...},
    "hypothesis_3": {...},
    "full_risk_map": {
      "risco_ghosting": 35,
      "risco_enrolacao": 68,
      "explanations": [
        "Risco de enrolação elevado (68/100) - promessas sem ação"
      ]
    },
    "compatibility_explained": {
      "score": 60,
      "explanation": "Compatibilidade com seu objetivo (NAMORO): 60/100",
      "alignment": "PARCIAL"
    },
    "validation_checklist": [
      "Observe se há interesse em conhecer você além do físico",
      "Veja se há reciprocidade nas conversas",
      "Observe padrão de resposta nas próximas 48h",
      "Verifique consistência entre palavras e ações",
      "Avalie respeito aos seus limites"
    ],
    "stage_plan": [
      {
        "stage": "TALKING",
        "actions": [
          "Continue observando padrões de comportamento",
          "Teste reciprocidade nas próximas interações",
          "Estabeleça limites claros se necessário"
        ],
        "metrics": [
          "Frequência de contato",
          "Tempo de resposta",
          "Iniciativa nas conversas"
        ]
      }
    ]
  }
}
```

## Dimensões e Scores

### Dimensões Principais (0-100)
- **reciprocidade**: Interesse mútuo e equilíbrio na iniciativa
- **constancia**: Consistência na comunicação e comportamento
- **acao_mundo_real**: Comprometimento com ações concretas (encontros, etc)
- **respeito**: Respeito aos limites e maturidade emocional
- **coerencia**: Consistência entre palavras e ações
- **disponibilidade**: Disponibilidade real para relacionamento

### Scores Derivados (0-100)
- **risco_ghosting**: Probabilidade de sumiço/ghosting
- **risco_enrolacao**: Probabilidade de enrolação sem comprometimento
- **compat_objetivo**: Compatibilidade entre objetivo do usuário e comportamento do match

### Multiplicador por Estágio
- **FIRST_CHAT**: 0.6 (menor peso para ações no mundo real)
- **TALKING**: 1.0 (peso padrão)
- **POST_DATE**: 1.3 (maior peso para ações no mundo real)

## Hipóteses de "Momento de Vida"

### Chaves Disponíveis
- **EXPLORANDO**: Padrão exploratório, baixa consistência e ação
- **BUSCA_FIXO**: Busca por relacionamento sério, alta consistência e ação
- **CARENCIA_VALIDACAO**: Necessidade de validação constante (requer texto)
- **RECEM_SAIU_RELACAO**: Recém-saída de relacionamento (requer texto)
- **SEM_DISPONIBILIDADE_REAL**: Baixa disponibilidade real

### Confiança
- **LOW**: Sinais insuficientes ou muitos campos opcionais não informados
- **MEDIUM**: Sinais moderados, alguns campos opcionais faltando
- **HIGH**: Sinais fortes, maioria dos campos informados

## Free Teaser vs Premium Report

### Free Teaser (Viciante, 20 segundos)
- Headline impactante
- 1 hipótese principal
- 1 score de risco (ghosting OU enrolação)
- 1 red flag + 1 green flag (se existirem)
- 1 observação para 48h
- Cards bloqueados com blur
- Clarity percent (ex: 28%)

### Premium Report (Completo)
- Executive summary (bullets)
- Top 3 hipóteses completas
- Mapa de risco completo (ambos os riscos)
- Compatibilidade explicada
- Checklist de validação (5 itens)
- Plano por estágio (ações e métricas)

## Signals Explicáveis

Cada signal contém:
- **code**: Código único do signal
- **label**: Label legível
- **why**: Explicação do porquê (campo + valor)
- **weight_applied**: Peso aplicado (normalmente 1)

Todos os scores, hipóteses e flags apontam para os signals que os geraram, garantindo transparência e explicabilidade.
