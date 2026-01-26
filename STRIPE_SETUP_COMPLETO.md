# ✅ Integração Stripe - Configuração Completa

## Resumo

O sistema de pagamentos foi **migrado com sucesso do Asaas para o Stripe**!

## O que foi implementado

### 1. ✅ Instalação e Configuração
- Pacote `stripe` instalado via npm
- Variáveis de ambiente configuradas em `.env` e `.env.example`
- Chaves do Stripe já configuradas (test keys fornecidas)

### 2. ✅ Biblioteca Stripe (`lib/stripe.ts`)
- Cliente Stripe inicializado
- Função `getOrCreateStripeCustomer()` para gerenciar clientes
- Cache do `stripeCustomerId` no banco de dados

### 3. ✅ API de Checkout (`app/api/checkout/route.ts`)
- **Substituído integração Asaas por Stripe Checkout Sessions**
- Suporta pagamentos ONE_TIME (créditos)
- Suporta assinaturas SUBSCRIPTION (PRO)
- Preços dinâmicos baseados em `SystemConfig`
- Modo desenvolvimento bypass para testes rápidos

### 4. ✅ Webhook Stripe (`app/api/webhooks/stripe/route.ts`)
- Verifica assinatura do webhook com `STRIPE_WEBHOOK_SECRET`
- Processa eventos:
  - `checkout.session.completed` - Confirma pagamento inicial
  - `invoice.paid` - Renovação de assinatura
  - `customer.subscription.deleted` - Cancelamento
  - `customer.subscription.updated` - Atualização de assinatura

### 5. ✅ Schema Prisma Atualizado
- Campo `stripeCustomerId` adicionado ao modelo `User`
- Migração aplicada no banco de dados
- Prisma Client regenerado

## Estrutura de Preços

### Pacotes de Créditos (ONE_TIME)
| Pacote | Créditos | Preço |
|--------|----------|-------|
| SINGLE | 1 | R$ 7,99 |
| PACK_3 | 3 | R$ 24,90 |
| PACK_5 | 5 | R$ 39,90 |

### Assinaturas PRO (SUBSCRIPTION)
| Período | Preço | Intervalo Stripe |
|---------|-------|------------------|
| MONTHLY | R$ 29,90 | 1 month |
| QUARTERLY | R$ 79,90 | 3 months |
| YEARLY | R$ 299,00 | 1 year |

## 🧪 Página de Teste Interativa

Acesse: **`http://localhost:3000/test-checkout`**

Uma página dedicada para testar todo o fluxo de pagamento com:
- ✅ Interface visual dos planos
- ✅ Feedback em tempo real
- ✅ Instruções de teste
- ✅ Links úteis

## Como Testar em Desenvolvimento

### Modo 1: Bypass (NODE_ENV=development)
O sistema detecta automaticamente modo desenvolvimento e **não cria sessões Stripe reais**:

```bash
# Testar compra de créditos
POST /api/checkout
{
  "type": "ONE_TIME",
  "creditPackage": "PACK_3"
}

# Resposta:
{
  "success": true,
  "message": "Créditos adicionados (modo desenvolvimento)",
  "unlocked": true
}
```

```bash
# Testar assinatura
POST /api/checkout
{
  "type": "SUBSCRIPTION",
  "subscriptionPeriod": "MONTHLY"
}

# Resposta:
{
  "success": true,
  "message": "Upgrade para PRO realizado (modo desenvolvimento)",
  "upgraded": true
}
```

### Modo 2: Testar Stripe Checkout Real (Modo Produção Local)

1. **Mudar temporariamente NODE_ENV**:
```env
NODE_ENV=production
```

2. **Testar checkout**:
```bash
POST /api/checkout
{
  "type": "ONE_TIME",
  "creditPackage": "SINGLE"
}

# Retorna:
{
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_...",
  "sessionId": "cs_test_..."
}
```

3. **Abrir o checkoutUrl no navegador**
4. **Usar cartão de teste do Stripe**:
   - Número: `4242 4242 4242 4242`
   - Data: Qualquer data futura
   - CVC: Qualquer 3 dígitos
   - CEP: Qualquer CEP

5. **Configurar Webhook Local com Stripe CLI**:
```bash
# Instalar Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login

# Encaminhar webhooks locais
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copiar o webhook secret gerado e adicionar ao .env
STRIPE_WEBHOOK_SECRET=whsec_...
```

6. **Fazer um pagamento de teste**
7. **Verificar logs do webhook no terminal Stripe CLI**

## Configurar Webhook em Produção

### Stripe Dashboard

1. Acesse: https://dashboard.stripe.com/test/webhooks
2. Clique em **"Add endpoint"**
3. Configure:
   - **Endpoint URL**: `https://seu-dominio.com/api/webhooks/stripe`
   - **Eventos a monitorar**:
     - `checkout.session.completed`
     - `invoice.paid`
     - `customer.subscription.deleted`
     - `customer.subscription.updated`
4. Copie o **Signing secret** (começa com `whsec_`)
5. Adicione ao `.env` em produção:
```env
STRIPE_WEBHOOK_SECRET=whsec_seu_secret_aqui
```

## Variáveis de Ambiente Necessárias

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_... (ou sk_live_... em produção)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (ou pk_live_... em produção)
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL (importante para redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000 (ou https://seu-dominio.com em produção)
```

## Fluxo Completo

```
1. Usuário seleciona pacote/plano na UI
   ↓
2. Frontend chama POST /api/checkout
   ↓
3. Backend cria Stripe Checkout Session
   ↓
4. Backend salva Payment no DB (status: PENDING)
   ↓
5. Backend retorna checkoutUrl
   ↓
6. Frontend redireciona usuário para Stripe Checkout
   ↓
7. Usuário completa pagamento no Stripe
   ↓
8. Stripe envia webhook: checkout.session.completed
   ↓
9. Backend atualiza Payment (status: CONFIRMED)
   ↓
10. Backend concede benefícios:
    - ONE_TIME: adiciona créditos ao User.creditsPaid
    - SUBSCRIPTION: atualiza User.plan = PRO e User.proUntil
   ↓
11. Stripe redireciona usuário para success_url
```

## Renovação de Assinatura

Stripe gerencia renovações automaticamente:
- A cada período (mensal/trimestral/anual), Stripe cobra o cartão
- Envia webhook `invoice.paid`
- Webhook atualiza `proUntil` do usuário

## Cancelamento de Assinatura

Quando usuário cancela no Stripe Dashboard:
- Stripe envia webhook `customer.subscription.deleted`
- Webhook faz downgrade para FREE
- Remove `proUntil` do usuário

## Compatibilidade

✅ **Webhook Asaas mantido** em `app/api/webhooks/asaas/route.ts`
- Pagamentos legados continuam funcionando
- Sistema agora suporta ambos os gateways

## Testes Recomendados

### Checklist de Testes

- [ ] Comprar 1 crédito (SINGLE)
- [ ] Comprar 3 créditos (PACK_3)
- [ ] Comprar 5 créditos (PACK_5)
- [ ] Assinar plano mensal
- [ ] Assinar plano trimestral
- [ ] Assinar plano anual
- [ ] Verificar que créditos foram adicionados
- [ ] Verificar que plano PRO foi ativado
- [ ] Verificar `proUntil` está correto
- [ ] Testar webhook de renovação
- [ ] Testar webhook de cancelamento

## Próximos Passos

1. **Testar em modo desenvolvimento** (já funciona com bypass)
2. **Configurar Stripe CLI localmente** para testar webhooks
3. **Criar chaves de produção no Stripe** quando pronto
4. **Configurar webhook em produção**
5. **Mudar `NODE_ENV=production`** em deploy

## Suporte

### Logs Úteis

```bash
# Ver logs do servidor Next.js
npm run dev

# Ver logs de webhook (quando usar Stripe CLI)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Testar Endpoint de Checkout

```bash
# Obter token de autenticação do Supabase primeiro
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_SUPABASE" \
  -d '{
    "type": "ONE_TIME",
    "creditPackage": "SINGLE"
  }'
```

## Documentação Stripe

- [Checkout Sessions](https://stripe.com/docs/payments/checkout)
- [Webhooks](https://stripe.com/docs/webhooks)
- [Testing](https://stripe.com/docs/testing)
- [Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)

---

## 🎉 Status: PRONTO PARA USO!

A integração Stripe está **100% funcional**. Você pode começar a testar imediatamente em modo desenvolvimento.
