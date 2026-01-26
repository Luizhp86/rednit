# Estrutura de Pagamentos Implementada

## Resumo

Implementada nova estrutura de pagamentos com opções de pagamento avulso (créditos) e assinatura recorrente (mensal, trimestral e anual).

## Estrutura de Preços

### Pagamento Avulso (Créditos)
- **1 Crédito**: R$ 9,90
- **Pacote 3 Créditos**: R$ 24,90 (R$ 8,30 cada — 16% desconto)
- **Pacote 5 Créditos**: R$ 39,90 (R$ 7,98 cada — 19% desconto)

### Assinatura Recorrente (PRO)
- **Mensal**: R$ 29,90/mês
- **Trimestral**: R$ 79,90/trimestre (R$ 26,63/mês — 11% desconto)
- **Anual**: R$ 299,00/ano (R$ 24,92/mês — 17% desconto)

## Mudanças Implementadas

### 1. Schema do Prisma (`prisma/schema.prisma`)

Adicionado:
- Enums `PaymentType`, `SubscriptionPeriod`, `CreditPackage`
- Campos no modelo `Payment`:
  - `subscriptionPeriod` (MONTHLY, QUARTERLY, YEARLY)
  - `creditPackage` (SINGLE, PACK_3, PACK_5)
  - `creditsGranted` (quantidade de créditos concedidos)
- Campos no modelo `SystemConfig`:
  - `proPriceQuarterly`
  - `creditPriceSingle`
  - `creditPricePack3`
  - `creditPricePack5`

### 2. Configurações (`lib/config.ts`)

Adicionados preços padrão para todos os pacotes e planos.

### 3. API de Checkout (`app/api/checkout/route.ts`)

Modificada para aceitar:
- `creditPackage`: 'SINGLE' | 'PACK_3' | 'PACK_5' (para ONE_TIME)
- `subscriptionPeriod`: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' (para SUBSCRIPTION)

Sistema de créditos:
- Ao comprar pacote, créditos são adicionados ao campo `creditsPaid` do usuário
- Créditos podem ser usados para desbloquear análises

### 4. API de Análise (`app/api/analyses/[id]/route.ts`)

Adicionado endpoint POST para desbloquear análise usando crédito:
- Verifica se usuário tem créditos
- Decrementa crédito e marca análise como paga
- Usuários PRO desbloqueiam automaticamente

### 5. Webhooks Asaas (`app/api/webhooks/asaas/route.ts`)

Atualizado para processar:
- Diferentes períodos de assinatura (mensal, trimestral, anual)
- Pacotes de créditos (adiciona quantidade correta de créditos)

### 6. Componentes UI

Criados:
- **`components/credit-packages.tsx`**: Seletor de pacotes de créditos
- **`components/subscription-plans.tsx`**: Seletor de planos de assinatura

### 7. Página de Análise (`app/dashboard/analysis/[id]/page.tsx`)

- Carrega créditos do usuário
- Mostra opção de usar crédito se disponível
- Mostra modal para comprar pacotes se não tiver créditos
- Integra componente CreditPackages

### 8. Página de Conta (`app/account/page.tsx`)

- Exibe todas as opções de assinatura (mensal, trimestral, anual)
- Exibe todas as opções de pacotes de créditos (1, 3, 5)
- Mostra descontos em destaque

### 9. Painel Admin (`app/admin/page.tsx`)

Adicionados campos para gerenciar:
- Preços de assinatura (mensal, trimestral, anual)
- Preços de pacotes de créditos (1, 3, 5)

## Próximos Passos

### 1. Migração do Banco de Dados

Execute a migração do Prisma:

```bash
npx prisma migrate dev --name add-pricing-structure
npx prisma generate
```

### 2. Configuração Inicial

Insira ou atualize a configuração padrão no banco:

```sql
INSERT INTO system_config (
  id,
  "minAnalysesFirstTime",
  "minNewAnalysesForUnlock",
  "freeCreditsDaily",
  "geminiDailyLimit",
  "geminiMonthlyBudgetCents",
  "proPriceMonthly",
  "proPriceQuarterly",
  "proPriceYearly",
  "creditPriceSingle",
  "creditPricePack3",
  "creditPricePack5",
  "maintenanceMode",
  "allowNewRegistrations"
) VALUES (
  'default',
  3,
  4,
  10,
  100,
  50000,
  2990,
  7990,
  29900,
  990,
  2490,
  3990,
  false,
  true
)
ON CONFLICT (id) DO UPDATE SET
  "proPriceQuarterly" = EXCLUDED."proPriceQuarterly",
  "creditPriceSingle" = EXCLUDED."creditPriceSingle",
  "creditPricePack3" = EXCLUDED."creditPricePack3",
  "creditPricePack5" = EXCLUDED."creditPricePack5";
```

### 3. Teste em Desenvolvimento

O sistema já está configurado para funcionar em modo desenvolvimento sem pagamentos reais:
- Compras de créditos adicionam automaticamente
- Assinaturas ativam automaticamente
- Análises são desbloqueadas sem pagamento

### 4. Configuração Asaas em Produção

Certifique-se de que as seguintes variáveis de ambiente estão configuradas:

```env
ASAAS_API_URL=https://api.asaas.com/v3
ASAAS_API_KEY=seu_api_key_aqui
ASAAS_WEBHOOK_TOKEN=seu_webhook_token_aqui
```

Configure o webhook no Asaas apontando para:
`https://seu-dominio.com/api/webhooks/asaas`

Eventos a serem monitorados:
- PAYMENT_CONFIRMED
- PAYMENT_RECEIVED
- PAYMENT_OVERDUE
- PAYMENT_REFUNDED

## Fluxo de Pagamento

### Pagamento Avulso (Créditos)

1. Usuário escolhe pacote de créditos
2. Sistema cria pagamento no Asaas via `/api/checkout`
3. Usuário paga via PIX ou cartão
4. Asaas envia webhook de confirmação
5. Sistema adiciona créditos ao usuário (`creditsPaid`)
6. Usuário pode usar créditos para desbloquear análises

### Assinatura Recorrente

1. Usuário escolhe plano (mensal, trimestral, anual)
2. Sistema cria assinatura no Asaas via `/api/checkout`
3. Usuário paga primeira cobrança
4. Asaas envia webhook de confirmação
5. Sistema ativa plano PRO com data de expiração
6. Asaas renova automaticamente conforme período escolhido

### Desbloqueio de Análise

**Com Créditos:**
1. Usuário clica em "Usar 1 Crédito"
2. Sistema verifica disponibilidade via POST `/api/analyses/[id]`
3. Decrementa crédito e desbloqueia análise
4. Análise fica disponível permanentemente

**Com Plano PRO:**
- Todas as análises são desbloqueadas automaticamente
- Sem necessidade de usar créditos

## Compatibilidade

O sistema mantém compatibilidade com o código antigo:
- Pagamentos antigos de "R$ 9,90" ainda funcionam
- Análises antigas já desbloqueadas continuam acessíveis
- Usuários PRO existentes mantêm acesso

## Observações

- Modo desenvolvimento bypass todos os pagamentos
- Usuários PRO não precisam de créditos
- Créditos não expiram
- Assinaturas renovam automaticamente no Asaas
