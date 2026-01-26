# Como Aplicar a Nova Estrutura de Pagamentos

## ✅ O que foi implementado

Sistema completo de pagamentos com:
- **Pacotes de créditos avulsos** (1, 3, 5 créditos)
- **Assinaturas recorrentes** (mensal, trimestral, anual)
- **Sistema de créditos** (usuários compram créditos e usam para desbloquear análises)
- **Painel admin** atualizado para gerenciar preços
- **Componentes UI** para seleção de pacotes e planos

## 📋 Passos para Aplicar

### 1. Fazer Backup do Banco de Dados

```bash
# Se estiver usando PostgreSQL
pg_dump -U seu_usuario -d seu_banco > backup_antes_da_migracao.sql
```

### 2. Gerar e Aplicar Migração do Prisma

```bash
# Gerar a migração
npx prisma migrate dev --name add-pricing-structure

# Gerar o Prisma Client atualizado
npx prisma generate
```

### 3. Atualizar Configurações do Sistema

Execute o script SQL para inserir as configurações de preço:

```bash
# No PostgreSQL
psql -U seu_usuario -d seu_banco -f prisma/migrations/update_pricing_config.sql

# OU execute manualmente via pgAdmin ou outro cliente
```

### 4. Verificar Variáveis de Ambiente

Certifique-se de que `.env` contém:

```env
# Asaas API
ASAAS_API_URL=https://api.asaas.com/v3
ASAAS_API_KEY=seu_api_key_aqui
ASAAS_WEBHOOK_TOKEN=seu_webhook_token_seguro

# Database
DATABASE_URL=sua_connection_string

# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service

# Gemini
GEMINI_API_KEY=sua_chave_gemini

# Ambiente
NODE_ENV=development  # ou production
```

### 5. Reiniciar a Aplicação

```bash
npm run dev
```

## 🧪 Testando em Desenvolvimento

Em modo desenvolvimento (`NODE_ENV=development`), o sistema funciona sem pagamentos reais:

### Testar Compra de Créditos

1. Acesse uma análise bloqueada
2. Clique em "Comprar Créditos para Desbloquear"
3. Selecione um pacote (1, 3 ou 5 créditos)
4. Sistema adiciona créditos automaticamente
5. Use crédito para desbloquear análise

### Testar Assinatura

1. Vá em "Minha Conta"
2. Clique em um dos planos (Mensal, Trimestral, Anual)
3. Sistema ativa plano PRO automaticamente

### Testar Desbloqueio com Crédito

1. Compre créditos (passos acima)
2. Acesse uma análise bloqueada
3. Clique em "Usar 1 Crédito"
4. Análise é desbloqueada instantaneamente

## 🚀 Configurando para Produção

### 1. Configurar Webhook no Asaas

1. Acesse o painel do Asaas
2. Vá em **Configurações** → **Webhooks**
3. Adicione novo webhook:
   - **URL**: `https://seu-dominio.com/api/webhooks/asaas`
   - **Token**: Use o mesmo valor de `ASAAS_WEBHOOK_TOKEN`
   - **Eventos**:
     - ✅ PAYMENT_CONFIRMED
     - ✅ PAYMENT_RECEIVED
     - ✅ PAYMENT_OVERDUE
     - ✅ PAYMENT_REFUNDED

### 2. Testar Webhook

Use a ferramenta de teste do Asaas ou:

```bash
curl -X POST https://seu-dominio.com/api/webhooks/asaas \
  -H "Content-Type: application/json" \
  -H "asaas-access-token: seu_webhook_token" \
  -d '{
    "event": "PAYMENT_CONFIRMED",
    "payment": {
      "id": "pay_test123",
      "status": "CONFIRMED"
    }
  }'
```

### 3. Mudar NODE_ENV para Production

```env
NODE_ENV=production
```

Agora os pagamentos passarão pelo Asaas normalmente.

## 📊 Verificando no Painel Admin

1. Acesse `/admin`
2. Faça login com credenciais de admin
3. Vá na aba **Configurações**
4. Verifique se os preços estão corretos:
   - Assinaturas: R$ 29,90 / R$ 79,90 / R$ 299,00
   - Créditos: R$ 9,90 / R$ 24,90 / R$ 39,90

## 🔍 Monitoramento

### Logs Importantes

```bash
# Ver logs do webhook
tail -f logs/webhooks.log

# Ver logs de pagamentos
tail -f logs/payments.log
```

### Queries Úteis

```sql
-- Ver todos os pagamentos
SELECT 
  p.id,
  u.email,
  p.type,
  p."subscriptionPeriod",
  p."creditPackage",
  p."creditsGranted",
  p."amountCents" / 100.0 as "valor_R$",
  p.status,
  p."createdAt"
FROM payments p
JOIN users u ON p."userId" = u.id
ORDER BY p."createdAt" DESC
LIMIT 20;

-- Ver usuários com créditos
SELECT 
  email,
  name,
  plan,
  "creditsPaid",
  "creditsFreeDaily"
FROM users
WHERE "creditsPaid" > 0
ORDER BY "creditsPaid" DESC;

-- Ver assinaturas ativas
SELECT 
  email,
  plan,
  "proUntil"
FROM users
WHERE plan = 'PRO' AND "proUntil" > NOW()
ORDER BY "proUntil" DESC;
```

## ❓ Problemas Comuns

### Migração falha

**Erro**: `relation "payments" already exists`

**Solução**: O schema já existe. Use `prisma db push` ou crie migração manualmente.

### Webhook não recebe eventos

**Verificar**:
1. URL do webhook está correta no Asaas?
2. Token no `.env` corresponde ao configurado no Asaas?
3. HTTPS está configurado? (Asaas requer HTTPS)

### Créditos não são adicionados

**Verificar**:
1. Webhook está sendo recebido? (logs)
2. `creditsGranted` está preenchido no pagamento?
3. Status do pagamento é `CONFIRMED`?

### Usuário não consegue desbloquear com crédito

**Verificar**:
1. `creditsPaid > 0`?
2. Análise já está desbloqueada? (`isPaid = true`)
3. Análise pertence ao usuário?

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs
2. Execute as queries de monitoramento
3. Teste em desenvolvimento primeiro
4. Verifique documentação do Asaas: https://docs.asaas.com

## 🎉 Pronto!

Sua nova estrutura de pagamentos está funcionando. Agora você tem:
- ✅ Pacotes de créditos com descontos
- ✅ Assinaturas mensais, trimestrais e anuais
- ✅ Sistema de créditos flexível
- ✅ Painel admin completo
- ✅ Webhooks configurados
