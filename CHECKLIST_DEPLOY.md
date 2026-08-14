# ✅ Checklist de Deploy - Radar Match

Use este checklist para acompanhar seu progresso no deploy em produção.

---

## ✅ Passo 1: Preparação (CONCLUÍDO)

- [x] Código preparado para produção
- [x] Arquivos de configuração criados
- [x] Commit e push realizados
- [x] Guias de deploy criados

**Arquivos criados:**
- `DEPLOY_PRODUCAO.md` - Guia completo com todos os detalhes
- `README.VERCEL.md` - Guia rápido
- `vercel.json` - Configurações otimizadas
- `scripts/verify-production.js` - Script de verificação

---

## 📋 Passo 2: Criar Projeto na Vercel

Siga estas etapas:

1. [ ] Acesse [vercel.com](https://vercel.com) e faça login
2. [ ] Clique em **"Add New"** → **"Project"**
3. [ ] Conecte sua conta do GitHub (se for a primeira vez)
4. [ ] Selecione o repositório: `Luizhp86/rednit`
5. [ ] Selecione o branch: `dev`
6. [ ] **NÃO clique em Deploy ainda!** Vá para o Passo 3 primeiro

---

## 🔐 Passo 3: Configurar Variáveis de Ambiente

**IMPORTANTE:** Configure TODAS as variáveis antes do primeiro deploy!

Na tela de configuração do projeto, ou em **Settings** → **Environment Variables**:

### Supabase (3 variáveis)
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=require&pgbouncer=true
```

- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] `DATABASE_URL` configurada (com `?sslmode=require&pgbouncer=true`)

### Stripe (3 variáveis - PRODUÇÃO)
```
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

- [ ] `STRIPE_SECRET_KEY` configurada (começa com `sk_live_`)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` configurada (começa com `pk_live_`)
- [ ] `STRIPE_WEBHOOK_SECRET` configurada (por enquanto use `whsec_placeholder`)

### Gemini AI (1 variável)
```
GEMINI_API_KEY=your_gemini_api_key
```

- [ ] `GEMINI_API_KEY` configurada

### App URL (1 variável)
```
NEXT_PUBLIC_APP_URL=https://radar-match.vercel.app
```

- [ ] `NEXT_PUBLIC_APP_URL` configurada (ajustar depois com URL real)

**Total: 8 variáveis devem estar configuradas**

---

## 🚀 Passo 4: Primeiro Deploy

1. [ ] Todas as 8 variáveis estão configuradas?
2. [ ] Clique em **"Deploy"** na Vercel
3. [ ] Aguarde o build (2-5 minutos)
4. [ ] Build concluído com sucesso?
5. [ ] Anote a URL gerada: `____________________________`

**Se o build falhar:**
- Verifique os logs na Vercel
- Confirme que todas as variáveis estão configuradas
- Verifique se `DATABASE_URL` tem os parâmetros corretos

---

## 🔗 Passo 5: Configurar Webhook do Stripe

Agora que você tem a URL da aplicação:

1. [ ] Acesse [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. [ ] Confirme que está no **modo LIVE** (canto superior direito)
3. [ ] Clique em **"Add endpoint"**
4. [ ] Cole: `https://SUA-URL-VERCEL/api/webhooks/stripe`
5. [ ] Selecione os eventos:
   - [ ] `checkout.session.completed`
   - [ ] `customer.subscription.created`
   - [ ] `customer.subscription.updated`
   - [ ] `customer.subscription.deleted`
   - [ ] `invoice.paid`
   - [ ] `invoice.payment_failed`
6. [ ] Clique em **"Add endpoint"**
7. [ ] Copie o **Signing secret** (whsec_...)
8. [ ] Na Vercel, atualize `STRIPE_WEBHOOK_SECRET` com o valor copiado
9. [ ] Faça um **Redeploy** na Vercel

---

## 🔄 Passo 6: Atualizar URL Final

1. [ ] Na Vercel, vá em **Settings** → **Environment Variables**
2. [ ] Atualize `NEXT_PUBLIC_APP_URL` com sua URL real da Vercel
3. [ ] Clique em **Redeploy**

---

## 🗄️ Passo 7: Verificar Banco de Dados

O banco já deve ter as tabelas (você está usando o mesmo projeto Supabase).

Mas se precisar aplicar migrations:

```bash
# Localmente
export DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=require"
npx prisma db push
```

- [ ] Banco de dados verificado/migrado

---

## 🧪 Passo 8: Testes de Validação

### Teste 1: Acesso Básico
- [ ] Acesse a URL da Vercel
- [ ] Login funciona?
- [ ] Navegação funciona?

### Teste 2: Painel Admin
- [ ] Acesse /admin
- [ ] Dashboard carrega?
- [ ] Estatísticas aparecem?

### Teste 3: Webhook (Teste)
- [ ] No Stripe Dashboard → Webhooks → seu endpoint
- [ ] Clique em "Send test webhook"
- [ ] Webhook foi recebido? (verifique logs na Vercel)

### Teste 4: Pagamento Real ⚠️
**CUIDADO: Será um pagamento real!**

- [ ] Crie uma conta de teste na aplicação
- [ ] Tente comprar 1 crédito (valor mais baixo)
- [ ] Use um cartão de teste do Stripe (se disponível)
- [ ] Pagamento processado com sucesso?
- [ ] Crédito foi adicionado à conta?
- [ ] Webhook foi recebido?

---

## ✅ Checklist Final

Marque apenas quando TODOS os itens acima estiverem concluídos:

- [ ] Projeto criado e deployado na Vercel
- [ ] Todas as 8 variáveis de ambiente configuradas
- [ ] Webhook do Stripe configurado e testado
- [ ] Testes básicos passaram
- [ ] Teste de pagamento real bem-sucedido
- [ ] Aplicação em produção funcionando! 🎉

---

## 🆘 Precisa de Ajuda?

Consulte os guias detalhados:
- `DEPLOY_PRODUCAO.md` - Guia completo com troubleshooting
- `README.VERCEL.md` - Guia rápido de referência

**Comandos úteis:**
```bash
# Verificar variáveis antes do deploy
npm run verify:prod

# Ver logs do Prisma
npx prisma studio

# Aplicar migrations
npx prisma db push
```

---

## 📝 Anotações

Use este espaço para anotar informações importantes:

**URL da aplicação:**
`_______________________________________________`

**Stripe Webhook Secret:**
`_______________________________________________`

**Data do deploy:**
`_______________________________________________`

**Problemas encontrados:**
```
_________________________________________________
_________________________________________________
_________________________________________________
```
