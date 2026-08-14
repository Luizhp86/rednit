# 🚀 Próximos Passos - Ações Manuais para Deploy

## ✅ O que já está pronto:

- ✅ Código preparado e otimizado para produção
- ✅ `vercel.json` configurado
- ✅ Scripts de verificação criados
- ✅ Guias completos de deploy criados
- ✅ Commit e push realizados

**Todos os arquivos estão no repositório GitLab e prontos para deploy!**

---

## 🎯 PRÓXIMAS AÇÕES (VOCÊ PRECISA FAZER):

### 1️⃣ Acessar a Vercel (5 minutos)

```
🌐 Acesse: https://vercel.com/new
```

1. Faça login na Vercel
2. Clique em **"Add New"** → **"Project"**
3. Conecte sua conta do GitHub (se primeira vez)
4. Selecione: `Luizhp86/rednit`
5. Branch: `dev`
6. ⚠️ **NÃO CLIQUE EM DEPLOY AINDA!**

---

### 2️⃣ Configurar Variáveis de Ambiente (10 minutos)

**Abra o arquivo `CHECKLIST_DEPLOY.md` (Passo 3)**

Você precisa adicionar 8 variáveis na Vercel:

```bash
# Copie e cole cada uma na Vercel:

# Supabase (3 variáveis)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=require&pgbouncer=true

# Stripe LIVE (3 variáveis)
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Gemini (1 variável)
GEMINI_API_KEY=your_gemini_api_key

# App URL (1 variável)
NEXT_PUBLIC_APP_URL=https://radar-match.vercel.app
```

✅ Marque quando terminar: [ ]

---

### 3️⃣ Fazer o Deploy (5 minutos)

1. Depois de configurar as 8 variáveis, clique em **"Deploy"**
2. Aguarde o build (2-5 minutos)
3. ✍️ **ANOTE A URL GERADA**: `_______________________`

✅ Deploy concluído: [ ]

---

### 4️⃣ Configurar Webhook do Stripe (10 minutos)

```
🌐 Acesse: https://dashboard.stripe.com/webhooks
```

1. ⚠️ **Certifique-se de estar no modo LIVE** (canto superior direito)
2. Clique em **"Add endpoint"**
3. Cole a URL: `https://SUA-URL-VERCEL/api/webhooks/stripe`
4. Selecione os 6 eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Salve e copie o **Signing Secret** (whsec_...)
6. Volte na Vercel → **Settings** → **Environment Variables**
7. Atualize `STRIPE_WEBHOOK_SECRET` com o valor copiado
8. Faça **Redeploy**

✅ Webhook configurado: [ ]

---

### 5️⃣ Atualizar URL Final (2 minutos)

1. Na Vercel, vá em **Settings** → **Environment Variables**
2. Atualize `NEXT_PUBLIC_APP_URL` com a URL real da Vercel
3. Faça **Redeploy**

✅ URL atualizada: [ ]

---

### 6️⃣ Testar (15 minutos)

**Teste 1: Acesso Básico**
- [ ] Acesse a URL da Vercel
- [ ] Login funciona?
- [ ] Navegação funciona?

**Teste 2: Painel Admin**
- [ ] Acesse /admin
- [ ] Dashboard carrega?

**Teste 3: Webhook**
- [ ] No Stripe Dashboard → Webhooks → seu endpoint
- [ ] Clique em "Send test webhook"
- [ ] Verificou nos logs da Vercel?

**Teste 4: Pagamento Real** ⚠️
- [ ] Teste com valor baixo (R$ 1,00)
- [ ] Pagamento processado?
- [ ] Webhook recebido?

---

## 📚 Guias Disponíveis:

- **`CHECKLIST_DEPLOY.md`** ← **COMECE AQUI** (checklist passo a passo)
- **`DEPLOY_PRODUCAO.md`** ← Guia completo com troubleshooting
- **`README.VERCEL.md`** ← Guia rápido de referência

---

## 🆘 Se algo der errado:

### Build falhou?
- Verifique se todas as 8 variáveis estão configuradas
- Confirme que `DATABASE_URL` tem `?sslmode=require&pgbouncer=true`

### Erro 500 na aplicação?
- Verifique os logs na Vercel: **Deployments** → **Functions**
- Procure por erros de conexão com banco ou API

### Webhook não funciona?
- Confirme que está em modo **LIVE** no Stripe
- Verifique se a URL está correta
- Teste manualmente o endpoint

---

## ✅ Checklist Final:

- [ ] Projeto criado na Vercel
- [ ] 8 variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] URL anotada
- [ ] Webhook do Stripe configurado
- [ ] `STRIPE_WEBHOOK_SECRET` atualizado
- [ ] `NEXT_PUBLIC_APP_URL` atualizado
- [ ] Testes básicos passaram
- [ ] Aplicação em produção funcionando! 🎉

---

## 📞 Precisa de ajuda?

Estou pronto para ajudar em qualquer passo! Basta me avisar:
- Qual passo você está
- Qual erro está aparecendo
- Screenshots se necessário

**Tempo total estimado: 40-50 minutos**

---

## 🔐 Lembrete de Segurança:

Após o deploy, considere regenerar as chaves do Stripe se houver risco de exposição, já que foram compartilhadas neste chat.

---

**🚀 Boa sorte com o deploy! Você está a alguns cliques de colocar o Radar Match em produção!**
