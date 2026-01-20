# Rule Engine - Documentação Técnica

## Visão Geral

O Rule Engine é o núcleo do sistema de análise do Radar de Match. Ele processa as respostas do formulário e gera insights estruturados baseados em regras determinísticas.

## Arquitetura

### Arquivos Principais

- `lib/rules/engine.ts`: Implementação do motor de análise
- `lib/rules/ruleset.json`: Configuração das regras (versionada)

## Fluxo de Análise

1. **Input**: Respostas do formulário validadas com Zod
2. **Processamento**: 
   - Cálculo de scores (0-100)
   - Avaliação de hipóteses
   - Detecção de flags (red/green)
   - Geração de próximas ações
3. **Output**: JSON estruturado com free_teaser e premium

## Scores

Cada score é calculado com base em:
- **Base**: Valor inicial (geralmente 50)
- **Weights**: Pesos por campo/resposta
- **Clamp**: Garantia de 0-100

### Scores Disponíveis

- `consistencia`: Padrão de comportamento consistente
- `reciprocidade`: Equilíbrio na relação
- `disponibilidade`: Disponibilidade real para relacionamento
- `respeito`: Respeito a limites e necessidades
- `intencao`: Intenção genuína
- `risco_ghosting`: Probabilidade de ghosting
- `risco_enrolacao`: Probabilidade de enrolação

## Hipóteses

Hipóteses são avaliadas com base em:
- **Signals**: Sinais observados (campos específicos ou scores)
- **Threshold**: Limite mínimo para ativação
- **Confidence**: LOW, MEDIUM, HIGH baseado no score

### Hipóteses Disponíveis

- `EXPLORANDO`: Pessoa explorando opções
- `BUSCA_FIXO`: Busca relacionamento sério
- `CARENCIA_VALIDACAO`: Busca validação constante
- `RECEM_SAIU_RELACAO`: Recém saiu de relacionamento
- `SEM_DISPONIBILIDADE_REAL`: Sem disponibilidade real

## Flags

Flags são detectadas por triggers:
- **Red Flags**: Sinais de alerta
- **Green Flags**: Sinais positivos

Cada flag tem:
- **Severity**: LOW, MEDIUM, HIGH
- **Title**: Título descritivo
- **Evidence Signals**: Sinais que ativaram
- **Impact**: Descrição do impacto

## Próximas Ações

Geradas baseadas em:
- Estágio atual do relacionamento
- Scores calculados
- Contexto específico

## Versionamento

O `ruleset.json` é versionado. Futuras versões podem:
- Carregar do servidor (sem re-deploy)
- A/B testing de regras
- Atualização gradual

## Extensibilidade

Para adicionar novas regras:

1. Edite `ruleset.json`
2. Adicione novos scores/hypotheses/flags
3. O engine processa automaticamente

## Explicabilidade

Todas as conclusões incluem:
- Sinais que ativaram
- Por que foi detectado
- Nível de confiança
- O que observar para confirmar

Isso garante transparência e permite que usuários entendam as análises.
