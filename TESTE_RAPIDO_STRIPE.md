# 🚀 Teste Rápido - Integração Stripe

## Acesso Rápido

1. **Inicie o servidor** (se ainda não está rodando):
```bash
npm run dev
```

2. **Acesse a página de teste**:
```
http://localhost:3000/test-checkout
```

## O que você verá

✅ **Planos de Assinatura PRO**:
- Mensal: R$ 29,90/mês
- Trimestral: R$ 79,90 (11% OFF)
- Anual: R$ 299,00 (17% OFF)

✅ **Pacotes de Créditos**:
- 1 Crédito: R$ 7,99
- 3 Créditos: R$ 24,90 (16% OFF)
- 5 Créditos: R$ 39,90 (19% OFF)

## Fluxo de Teste

### Modo Desenvolvimento (Ativo por padrão)

1. Clique em qualquer plano ou pacote
2. Veja o feedback: "Créditos adicionados (modo desenvolvimento)"
3. O sistema simula o sucesso sem cobrança real
4. Verifique em `/account` que os créditos foram adicionados

**Isso é perfeito para testar rapidamente!**

### Modo Produção (Stripe Real)

1. Edite `.env`:
```env
NODE_ENV=production
```

2. Reinicie o servidor:
```bash
npm run dev
```

3. Clique em um plano
4. Você será **redirecionado para o Stripe Checkout**
5. Use cartão de teste:
   - **Número**: `4242 4242 4242 4242`
   - **Data**: Qualquer futura (ex: 12/25)
   - **CVC**: Qualquer 3 dígitos (ex: 123)
   - **CEP**: Qualquer (ex: 12345-678)

6. Complete o pagamento
7. Você será redirecionado de volta para `/dashboard?payment=success`

## Verificar Resultados

### Via Interface

1. Acesse `/account`
2. Veja:
   - Seu plano (FREE ou PRO)
   - Créditos pagos disponíveis
   - Data de expiração do PRO (se aplicável)

### Via Banco de Dados

```sql
-- Ver seu usuário
SELECT 
  email, 
  plan, 
  "creditsPaid", 
  "proUntil"
FROM users 
WHERE email = 'seu-email@exemplo.com';

-- Ver pagamentos
SELECT 
  provider,
  type,
  status,
  "amountCents" / 100.0 as valor_reais,
  "creditPackage",
  "subscriptionPeriod",
  "createdAt"
FROM payments
ORDER BY "createdAt" DESC
LIMIT 5;
```

## Testar Webhooks Localmente

### Instalar Stripe CLI

**Windows (Chocolatey)**:
```bash
choco install stripe-cli
```

**Mac (Homebrew)**:
```bash
brew install stripe/stripe-cli/stripe
```

**Linux**:
```bash
# Download do site oficial
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
```

### Configurar e Testar

1. **Login no Stripe**:
```bash
stripe login
```

2. **Encaminhar webhooks**:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Você verá algo como:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

3. **Copie o secret e adicione ao `.env`**:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

4. **Reinicie o servidor** (importante!)

5. **Faça um pagamento de teste**

6. **Veja os logs no terminal do Stripe CLI**:
```
2025-01-23 10:30:45   --> checkout.session.completed [evt_xxx]
2025-01-23 10:30:45   <-- [200] POST http://localhost:3000/api/webhooks/stripe
```

## Cartões de Teste Stripe

### Sucesso
- **Número**: `4242 4242 4242 4242`
- **Resultado**: Pagamento aprovado ✅

### Falha (Genérica)
- **Número**: `4000 0000 0000 0002`
- **Resultado**: Pagamento recusado ❌

### Requer Autenticação 3D Secure
- **Número**: `4000 0027 6000 3184`
- **Resultado**: Modal de autenticação (aprove para sucesso)

### Insuficiente Fundos
- **Número**: `4000 0000 0000 9995`
- **Resultado**: Recusado por fundos insuficientes

[Lista completa de cartões de teste →](https://stripe.com/docs/testing)

## Cenários de Teste Recomendados

### ✅ Checklist Básico

- [ ] Comprar 1 crédito em modo dev (bypass)
- [ ] Comprar 3 créditos em modo dev
- [ ] Assinar plano mensal em modo dev
- [ ] Ver créditos adicionados em `/account`
- [ ] Ver plano PRO ativado

### ✅ Checklist Produção (Opcional)

- [ ] Mudar para `NODE_ENV=production`
- [ ] Comprar 1 crédito com cartão de teste
- [ ] Ver redirect para Stripe
- [ ] Completar pagamento no Stripe
- [ ] Ver redirect de volta para `/dashboard?payment=success`
- [ ] Verificar webhook recebido (Stripe CLI)
- [ ] Confirmar crédito adicionado no banco

### ✅ Checklist Assinaturas

- [ ] Assinar plano mensal
- [ ] Ver `proUntil` definido corretamente (1 mês à frente)
- [ ] Assinar plano trimestral
- [ ] Ver `proUntil` definido corretamente (3 meses à frente)
- [ ] Fazer downgrade para FREE
- [ ] Ver `proUntil` removido

## Problemas Comuns

### "Missing signature" no webhook

**Causa**: Stripe CLI não está rodando ou `STRIPE_WEBHOOK_SECRET` incorreto

**Solução**:
1. Verifique se `stripe listen` está ativo
2. Copie o webhook secret correto
3. Reinicie o servidor

### "Webhook secret not configured"

**Causa**: `STRIPE_WEBHOOK_SECRET` não está no `.env`

**Solução**: Adicione a variável e reinicie

### Redirect não funciona

**Causa**: `NEXT_PUBLIC_APP_URL` incorreto ou faltando

**Solução**: Adicione ao `.env`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Créditos não aparecem após pagamento

**Causa**: Webhook não foi processado

**Solução**:
1. Verifique logs do Stripe CLI
2. Verifique logs do servidor Next.js
3. Confirme que o webhook retornou 200

## Logs Úteis

### Servidor Next.js
```bash
npm run dev
# Verá logs como:
# "Stripe webhook received: checkout.session.completed"
# "Adicionados 3 créditos ao usuário xxx"
```

### Stripe CLI
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Verá todos os eventos enviados
```

### Banco de Dados
```sql
-- Ver últimos pagamentos
SELECT * FROM payments ORDER BY "createdAt" DESC LIMIT 5;

-- Ver webhooks (se você tiver uma tabela de log)
SELECT * FROM admin_logs WHERE action LIKE '%PAYMENT%' ORDER BY "createdAt" DESC LIMIT 10;
```

## 🎉 Pronto!

Sua integração Stripe está funcionando. Teste à vontade usando a página `/test-checkout`.

Se encontrar problemas, consulte:
- [STRIPE_SETUP_COMPLETO.md](./STRIPE_SETUP_COMPLETO.md) - Documentação completa
- [Documentação Stripe](https://stripe.com/docs)
- Logs do servidor e do Stripe CLI
