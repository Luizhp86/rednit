# Deploy na Vercel - Guia Rápido

## 🚀 Deploy Rápido

1. **Conecte o repositório**: [vercel.com/new](https://vercel.com/new)
2. **Configure variáveis de ambiente**: Ver [DEPLOY_PRODUCAO.md](./DEPLOY_PRODUCAO.md)
3. **Deploy**: Clique em "Deploy"

## 📋 Variáveis de Ambiente Necessárias

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=

# Stripe (LIVE)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Gemini AI
GEMINI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

## ⚙️ Configuração do Build

O projeto já está configurado com:
- ✅ `vercel.json` otimizado
- ✅ Build command: `prisma generate && next build`
- ✅ Região: São Paulo (gru1)
- ✅ Timeout de 30s para APIs

## 📚 Documentação Completa

Ver [DEPLOY_PRODUCAO.md](./DEPLOY_PRODUCAO.md) para instruções detalhadas.

## ✅ Verificação

Antes de fazer deploy, rode:

```bash
npm run verify:prod
```

## 🔧 Troubleshooting

### Build falhou?
- Verifique se todas as variáveis de ambiente estão configuradas
- Certifique-se de que `DATABASE_URL` tem `?sslmode=require&pgbouncer=true`

### Erro do Prisma?
```bash
npx prisma generate
git add .
git commit -m "chore: update prisma client"
git push
```

### Webhook não funciona?
1. Configure o webhook no Stripe Dashboard
2. Adicione `STRIPE_WEBHOOK_SECRET` na Vercel
3. Redeploy

## 📝 Pós-Deploy

1. Teste login
2. Teste pagamento com valor baixo
3. Verifique webhook no Stripe Dashboard
4. Configure domínio customizado (opcional)
