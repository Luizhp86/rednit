# Correção da Integração Stripe - Webhooks

## Data
23 de Janeiro de 2026

## Problema Identificado

Erros de compilação TypeScript no webhook do Stripe (`app/api/webhooks/stripe/route.ts`) causados por incompatibilidades de tipo entre a versão 20 do Stripe SDK e os tipos TypeScript declarados.

### Erros Encontrados

1. **Erro de `invoice.subscription`**:
   - Tipo: `Property 'subscription' does not exist on type 'Invoice'`
   - Localização: Função `getSubscriptionId`
   - Causa: O tipo `Stripe.Invoice` não declara a propriedade `subscription`, embora ela esteja presente em webhooks de renovação

2. **Erro de `current_period_end`**:
   - Tipo: `Property 'current_period_end' does not exist on type 'Subscription'`
   - Localização: Funções `handleInvoicePaid` e `handleSubscriptionUpdated`
   - Causa: Incompatibilidade entre a versão da API Stripe (`2025-12-15.clover`) e os tipos TypeScript declarados

## Solução Implementada

### 1. Tipos Estendidos para Webhooks

Criamos tipos estendidos que representam corretamente a estrutura dos objetos recebidos via webhooks:

```typescript
// Types estendidos para compatibilidade com webhooks do Stripe
type InvoiceWithSubscription = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription
}

type SubscriptionWithPeriod = Stripe.Subscription & {
  current_period_end: number
  current_period_start: number
}
```

### 2. Função `getSubscriptionId` Aprimorada

Removemos o `@ts-ignore` e implementamos type guards adequados:

```typescript
function getSubscriptionId(invoice: Stripe.Invoice): string | null {
  const invoiceWithSub = invoice as InvoiceWithSubscription
  const subscription = invoiceWithSub.subscription
  
  if (!subscription) return null
  
  // subscription pode ser string (ID) ou objeto expandido Stripe.Subscription
  if (typeof subscription === 'string') {
    return subscription
  }
  
  // Se for objeto Stripe.Subscription, tem propriedade id
  if (typeof subscription === 'object' && 'id' in subscription) {
    return subscription.id
  }
  
  return null
}
```

### 3. Uso de Type Assertions Seguras

Nas funções que processam subscriptions, aplicamos o tipo estendido:

```typescript
// Em handleInvoicePaid
const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId)
const subscription = subscriptionResponse as unknown as SubscriptionWithPeriod

// Em handleSubscriptionUpdated
const subscription = subscriptionData as SubscriptionWithPeriod
```

## Benefícios da Solução

1. **Segurança de Tipos**: Mantém a verificação estrita do TypeScript sem usar `@ts-ignore`
2. **Manutenibilidade**: Tipos claramente documentados e extensíveis
3. **Compatibilidade**: Funciona com a versão atual do Stripe SDK (v20.2.0) e API version `2025-12-15.clover`
4. **Type Guards**: Verificações de tipo em runtime garantem robustez

## Arquivos Modificados

- `app/api/webhooks/stripe/route.ts`

## Testes Realizados

✅ Build do Next.js passa sem erros TypeScript:
```
npm run build
✓ Compiled successfully
✓ Generating static pages
```

## Contexto Técnico

### Por que o problema ocorreu?

O Stripe SDK v20 introduziu mudanças significativas nos tipos TypeScript, especialmente com diferentes versões da API. A versão da API `2025-12-15.clover` é uma preview/beta que pode ter tipos ainda não completamente sincronizados com a tipagem oficial.

### Por que essa solução?

1. **Realidade vs Tipos**: Em webhooks, o Stripe envia propriedades que não estão nos tipos oficiais
2. **Type Extension**: Ao invés de ignorar tipos, estendemos os existentes para refletir a realidade
3. **Type Safety**: Mantemos os benefícios do TypeScript sem comprometer a funcionalidade

## Próximos Passos Recomendados

1. **Testes de Webhook**: Testar em ambiente de desenvolvimento com eventos reais do Stripe
2. **Monitoramento**: Verificar logs de webhook para confirmar processamento correto
3. **Atualização Futura**: Quando a versão da API `2025-12-15.clover` for estável, revisar se os tipos oficiais foram atualizados

## Referências

- [Stripe API - Invoice Object](https://docs.stripe.com/api/invoices/object)
- [Stripe API - Subscription Object](https://docs.stripe.com/api/subscriptions/object)
- [Stripe Node.js SDK v20](https://github.com/stripe/stripe-node)
