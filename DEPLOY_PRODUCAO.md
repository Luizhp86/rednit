# Guia de Deploy em Produção - Vercel

Este guia contém todos os passos para colocar o Radar Match em produção na Vercel.

## ⚠️ IMPORTANTE - Segurança

As chaves do Stripe de produção foram compartilhadas no chat. Considere regenerá-las após o deploy se houver risco de exposição.

---

## Passo 1: Criar Projeto na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New"** → **"Project"**
3. Se for a primeira vez, conecte sua conta do GitLab
4. Selecione o repositório: `luizhenrique.pinotti/rednit`
5. Selecione o branch: `dev` (ou `main` se preferir)
6. **NÃO FAÇA DEPLOY AINDA** - primeiro configure as variáveis de ambiente

---

## Passo 2: Configurar Variáveis de Ambiente

Na tela de configuração do projeto (antes do deploy), ou em **Settings** → **Environment Variables**, adicione:

### 🔵 Supabase (Database)

```
NEXT_PUBLIC_SUPABASE_URL=https://nvdqvoofbsymynafnucu.supabase.co
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_1oyBO8c9R_yq8hnDr8M2Aw_6A6Ywa9O
```

```
DATABASE_URL=postgresql://postgres.nvdqvoofbsymynafnucu:u8N8W4k773319827@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require&pgbouncer=true
```

**Importante:** Adicione `?sslmode=require&pgbouncer=true` no final da DATABASE_URL para compatibilidade com Vercel.

### 💳 Stripe (Produção - LIVE)

```
STRIPE_SECRET_KEY=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
```

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SrjR0E4S15Fj12SL5JKSUC3skYdrZOLhK6ZcAaOLV0VP1wtkinojNEhdbaI0reRCeqrBrzk3QyaaLtQs05SBsIo000VxQxU9j
```

```
STRIPE_WEBHOOK_SECRET=whsec_SERA_GERADO_NO_PASSO_4
```

**OBS:** O `STRIPE_WEBHOOK_SECRET` será gerado no Passo 4. Por enquanto, deixe como `whsec_placeholder` ou pule.

### 🤖 Gemini AI

```
GEMINI_API_KEY=AIzaSyAOR_wiI0dbZsRS9A_yvaKcVpNmwzx53_8
```

### 🌐 App URL (temporário)

```
NEXT_PUBLIC_APP_URL=https://radar-match.vercel.app
```

**OBS:** Atualize com a URL real após o primeiro deploy.

---

## Passo 3: Fazer o Primeiro Deploy

1. Depois de configurar as variáveis, clique em **"Deploy"**
2. Aguarde o build completar (pode levar 2-5 minutos)
3. Quando terminar, você verá uma URL como: `https://radar-match-xxx.vercel.app`
4. **ANOTE ESSA URL** - você precisará dela no próximo passo

### Se o Deploy Falhar

- Verifique os logs de build na Vercel
- Problemas comuns:
  - DATABASE_URL sem `?sslmode=require&pgbouncer=true`
  - Variáveis de ambiente faltando
  - Erro do Prisma: rode `npx prisma generate` localmente e faça commit

---

## Passo 4: Configurar Webhook do Stripe

Agora que você tem a URL da aplicação, configure o webhook do Stripe:

1. Acesse [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. **Certifique-se de estar no modo LIVE** (canto superior direito)
3. Clique em **"Add endpoint"**
4. Cole a URL: `https://SUA-URL-VERCEL.vercel.app/api/webhooks/stripe`
   - Exemplo: `https://radar-match-abc123.vercel.app/api/webhooks/stripe`

5. Em **"Events to send"**, selecione:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.paid`
   - ✅ `invoice.payment_failed`

6. Clique em **"Add endpoint"**

7. Após criar, clique no webhook criado e copie o **"Signing secret"** (começa com `whsec_...`)

8. Volte para a Vercel → **Settings** → **Environment Variables**

9. Atualize a variável `STRIPE_WEBHOOK_SECRET` com o valor copiado

10. Faça um **Redeploy** na Vercel (Deployments → ... → Redeploy)

---

## Passo 5: Atualizar URL do App

1. Na Vercel, vá em **Settings** → **Environment Variables**
2. Atualize `NEXT_PUBLIC_APP_URL` com sua URL final
3. Faça um **Redeploy**

---

## Passo 6: Migrar o Banco de Dados (se necessário)

Se o banco de produção ainda não tem as tabelas criadas:

### Opção 1: Via Prisma (Local)

```bash
# Apontar para o banco de produção
export DATABASE_URL="postgresql://postgres.nvdqvoofbsymynafnucu:u8N8W4k773319827@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require"

# Aplicar migrations
npx prisma db push

# Ou se tiver migrations pendentes
npx prisma migrate deploy
```

### Opção 2: Via Supabase Dashboard

1. Acesse o SQL Editor no Supabase
2. Execute as migrations manualmente ou use o Prisma Studio

---

## Passo 7: Testar em Produção

### Teste 1: Acesso Básico
- Acesse sua URL da Vercel
- Faça login com uma conta de teste
- Navegue pela aplicação

### Teste 2: Pagamento Real (⚠️ CUIDADO)
- Crie um produto de teste com valor baixo (R$ 0,50)
- Faça um pagamento teste com cartão real
- Verifique se o webhook foi recebido no Stripe Dashboard

### Teste 3: Webhook
- No Stripe Dashboard → Webhooks → seu webhook
- Clique em "Send test webhook"
- Verifique os logs na Vercel (Deployments → Logs)

---

## ✅ Checklist Final

- [ ] Projeto criado na Vercel
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Primeiro deploy concluído com sucesso
- [ ] URL da aplicação anotada
- [ ] Webhook do Stripe configurado em modo LIVE
- [ ] STRIPE_WEBHOOK_SECRET atualizado na Vercel
- [ ] Redeploy após configurar webhook
- [ ] NEXT_PUBLIC_APP_URL atualizado
- [ ] Banco de dados migrado (se necessário)
- [ ] Teste de login funcionando
- [ ] Teste de pagamento real concluído
- [ ] Webhook recebendo eventos corretamente

---

## 🔧 Troubleshooting

### Erro de conexão com banco
- Verifique se a DATABASE_URL tem `?sslmode=require&pgbouncer=true`
- Certifique-se de que o IP da Vercel não está bloqueado no Supabase

### Webhook não funcionando
- Verifique se a URL está correta
- Confirme que está em modo LIVE no Stripe
- Verifique os logs na Vercel (Deployments → Functions)
- Teste manualmente: `curl -X POST https://sua-url.vercel.app/api/webhooks/stripe`

### Prisma Client Error
- Rode `npx prisma generate` localmente
- Commit o código gerado
- Faça redeploy

---

## 📝 Próximos Passos (Opcional)

1. **Domínio Customizado**: Configure um domínio próprio na Vercel
2. **Monitoramento**: Configure Sentry para tracking de erros
3. **Analytics**: Adicione Google Analytics ou Posthog
4. **Email**: Configure Resend para emails transacionais
5. **Backup**: Configure backups automáticos no Supabase

---

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs na Vercel (Deployments → Logs)
2. Verifique os logs no Supabase
3. Consulte a documentação:
   - [Vercel Docs](https://vercel.com/docs)
   - [Stripe Webhooks](https://stripe.com/docs/webhooks)
   - [Prisma + Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
