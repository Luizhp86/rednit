# rednit

Micro-SaaS web que fornece insights inteligentes sobre relacionamentos, identificando red flags, green flags e hipóteses probabilísticas baseadas em evidências.

## 🚀 Características

- **Análises baseadas em regras**: Motor determinístico que avalia padrões comportamentais
- **Hipóteses probabilísticas**: Identifica possíveis momentos de vida e comportamentos com nível de confiança
- **Red Flags e Green Flags**: Sinais de alerta e positivos com evidências
- **Scores quantitativos**: Métricas de consistência, reciprocidade, disponibilidade, respeito, intenção e riscos
- **Gating FREE vs PRO**: Versão gratuita com prévia + paywall para relatório completo
- **Pagamentos BR**: Integração com Asaas (Pix + cartão)
- **Privacidade**: Exclusão de dados e conta

## 🛠️ Stack

- **Frontend/Fullstack**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- **Hospedagem**: Vercel
- **Database/Auth**: Supabase (Postgres + Google OAuth)
- **ORM**: Prisma
- **Pagamentos**: Asaas (Pix + cartão)
- **Validação**: Zod

## 📋 Pré-requisitos

- Node.js 18+
- Conta no Supabase
- Conta no Asaas (para pagamentos)

## 🔧 Configuração

### 1. Clone o repositório

```bash
git clone <repo-url>
cd rednit
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e preencha com suas credenciais:

```bash
cp .env.example .env
```

Variáveis necessárias:

- `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima do Supabase
- `DATABASE_URL`: String de conexão do Postgres (do Supabase)
- `ASAAS_API_URL`: URL da API Asaas (padrão: https://api.asaas.com/v3)
- `ASAAS_API_KEY`: Chave da API Asaas
- `ASAAS_WEBHOOK_TOKEN`: Token para validar webhooks do Asaas

### 4. Configure o Supabase

#### 4.1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote a URL e a chave anônima

#### 4.2. Configurar Google OAuth

1. No painel do Supabase, vá em **Authentication > Providers**
2. Ative o provider **Google**
3. Configure as credenciais OAuth do Google:
   - Crie um projeto no [Google Cloud Console](https://console.cloud.google.com)
   - Configure a tela de consentimento OAuth
   - Crie credenciais OAuth 2.0
   - Adicione a URL de callback: `https://<seu-projeto>.supabase.co/auth/v1/callback`
   - Adicione também: `http://localhost:3000/auth/callback` para desenvolvimento
4. Cole o Client ID e Client Secret no Supabase

#### 4.3. Obter string de conexão do Postgres

1. No painel do Supabase, vá em **Settings > Database**
2. Copie a **Connection string** (URI)
3. Use no `DATABASE_URL` (substitua `[YOUR-PASSWORD]` pela senha do banco)

### 5. Configure o Prisma

Execute as migrações do banco de dados:

```bash
npx prisma migrate dev --name init
```

Isso criará todas as tabelas necessárias no banco.

### 6. Configure o Asaas

1. Crie uma conta em [asaas.com](https://asaas.com)
2. Obtenha sua API Key no painel
3. Configure o webhook:
   - URL: `https://seu-dominio.com/api/webhooks/asaas`
   - Eventos: `PAYMENT_CONFIRMED`, `PAYMENT_RECEIVED`, `PAYMENT_OVERDUE`, `PAYMENT_REFUNDED`
   - Token: Gere um token seguro e use no `ASAAS_WEBHOOK_TOKEN`

## 🚀 Executando localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📦 Deploy na Vercel

### 1. Conecte o repositório

1. Acesse [vercel.com](https://vercel.com)
2. Importe o repositório do GitHub/GitLab

### 2. Configure as variáveis de ambiente

No painel da Vercel, adicione todas as variáveis do `.env`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `ASAAS_API_URL`
- `ASAAS_API_KEY`
- `ASAAS_WEBHOOK_TOKEN`

### 3. Configure o build

A Vercel detecta automaticamente Next.js. Certifique-se de que o comando de build está correto:

```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

### 4. Atualize o callback do Google OAuth

No Google Cloud Console, adicione a URL de produção:
`https://seu-dominio.vercel.app/auth/callback`

### 5. Atualize o webhook do Asaas

Configure o webhook do Asaas para apontar para:
`https://seu-dominio.vercel.app/api/webhooks/asaas`

## 📁 Estrutura do Projeto

```
rednit/
├── app/
│   ├── api/
│   │   ├── analyze/          # Endpoint de análise
│   │   ├── checkout/         # Criação de checkout Asaas
│   │   ├── webhooks/asaas/   # Webhook de pagamentos
│   │   ├── me/               # Dados do usuário
│   │   ├── analyses/         # CRUD de análises
│   │   └── delete-account/   # Exclusão de conta
│   ├── auth/callback/        # Callback OAuth
│   ├── login/                # Página de login
│   ├── dashboard/            # Dashboard principal
│   │   ├── new/              # Formulário de análise
│   │   └── analysis/[id]/    # Resultado da análise
│   ├── account/              # Página de conta
│   └── layout.tsx
├── lib/
│   ├── prisma.ts             # Cliente Prisma
│   ├── supabase/             # Clientes Supabase
│   ├── rules/                # Rule engine
│   │   ├── engine.ts
│   │   └── ruleset.json
│   └── validations/           # Schemas Zod
├── prisma/
│   └── schema.prisma         # Schema do banco
└── middleware.ts              # Middleware de autenticação
```

## 🔐 Segurança e Privacidade

- **Minimização de dados**: Apenas dados necessários são armazenados
- **Criptografia**: Supabase gerencia criptografia em repouso
- **Rate limiting**: Implementado em `/api/analyze` e `/api/checkout`
- **Validação**: Todos os inputs são validados com Zod
- **Exclusão de dados**: Usuários podem excluir análises e conta

## 📊 Modelo de Dados

### Tabelas principais:

- **users**: Usuários e planos
- **analyses**: Análises realizadas
- **payments**: Registro de pagamentos
- **entitlements**: Direitos de acesso PRO

## 🎯 Funcionalidades

### Versão Gratuita (FREE)
- 1 análise por dia
- Prévia com 1 hipótese, 3 flags e 2 scores
- Histórico de análises

### Versão PRO
- Análises ilimitadas (com rate limit)
- Acesso completo a todos os scores, hipóteses e flags
- Próximas ações sugeridas

### Pagamentos
- **Desbloqueio único**: R$ 9,90 por análise
- **Assinatura mensal**: R$ 29,90/mês

## 🧪 Rule Engine

O motor de análise está em `lib/rules/engine.ts` e usa regras definidas em `lib/rules/ruleset.json`.

As regras podem ser ajustadas sem re-deploy, carregando o JSON do servidor (futuro).

## 📝 Licença

Este projeto é privado e proprietário.

## 🤝 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.
