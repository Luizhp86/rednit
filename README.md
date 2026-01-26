# Radar Match 🎯

Plataforma de análise comportamental para relacionamentos em apps de namoro, usando IA para identificar padrões e sinais de alerta.

## 🚀 Status do Projeto

**Versão:** 0.8  
**Status:** Pronto para deploy em produção

## 📋 Sobre o Projeto

Radar Match é uma aplicação Next.js que utiliza IA (Google Gemini) para analisar comportamentos em relacionamentos iniciados em apps de namoro. A plataforma:

- ✅ Analisa padrões de comportamento com base em 14+ critérios
- ✅ Identifica sinais de alerta (red flags) e pontos positivos (green flags)
- ✅ Gera análises de compatibilidade personalizadas
- ✅ Oferece análise de evolução comportamental (PRO)
- ✅ Sistema de créditos e assinaturas via Stripe
- ✅ Painel admin completo

## 🛠️ Tecnologias

- **Framework:** Next.js 16 (App Router)
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Autenticação:** Supabase Auth
- **Pagamentos:** Stripe (produção)
- **IA:** Google Gemini API
- **Hospedagem:** Vercel
- **UI:** TailwindCSS + shadcn/ui + Framer Motion

## 📦 Estrutura do Projeto

```
radar-match/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard do usuário
│   ├── admin/             # Painel administrativo
│   └── login/             # Autenticação
├── components/            # Componentes React
├── lib/                   # Bibliotecas e utils
│   ├── ai/               # Integração com Gemini
│   ├── rules/            # Motor de análise
│   └── supabase/         # Cliente Supabase
├── prisma/               # Schema e migrations
└── docs/                 # Documentação
```

## 🚀 Deploy em Produção

### Guias Disponíveis

1. **[PROXIMOS_PASSOS.md](./PROXIMOS_PASSOS.md)** - Guia rápido de ações manuais
2. **[CHECKLIST_DEPLOY.md](./CHECKLIST_DEPLOY.md)** - Checklist interativo completo
3. **[DEPLOY_PRODUCAO.md](./DEPLOY_PRODUCAO.md)** - Guia detalhado com troubleshooting
4. **[README.VERCEL.md](./README.VERCEL.md)** - Referência rápida Vercel

### Requisitos

- Conta Vercel
- Projeto Supabase (PostgreSQL)
- Conta Stripe (modo produção)
- API Key do Google Gemini

### Deploy Rápido

```bash
# 1. Clone o repositório
git clone https://github.com/Luizhp86/rednit.git
cd rednit

# 2. Configure as variáveis de ambiente na Vercel
# Ver PROXIMOS_PASSOS.md para valores

# 3. Deploy
# Conecte o repositório na Vercel e faça deploy
```

## 🔧 Desenvolvimento Local

### Pré-requisitos

- Node.js 18+
- PostgreSQL (ou conta Supabase)
- Chaves de API (Gemini, Stripe, Supabase)

### Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas chaves

# 3. Setup do banco de dados
npx prisma generate
npx prisma db push

# 4. Rodar em desenvolvimento
npm run dev
```

Acesse: `http://localhost:3000`

## 📊 Features

### Para Usuários

- 📝 **Formulário de Análise:** 14 perguntas sobre o comportamento do match
- 🎯 **Análise Gratuita:** Teaser com principais insights
- 💎 **Análise Premium:** Relatório completo desbloqueável
- 📈 **Análise de Comportamento:** Evolução ao longo do tempo (PRO)
- 💳 **Compra de Créditos:** Pacotes avulsos
- ⭐ **Assinatura PRO:** Análises ilimitadas

### Para Administradores

- 📊 **Dashboard:** Estatísticas de usuários, análises e receita
- 👥 **Gestão de Usuários:** Visualizar, editar planos e créditos
- ⚙️ **Configurações:** Preços dinâmicos, limites, feature flags
- 📝 **Logs:** Audit trail de alterações do sistema
- 📈 **Atividade:** Tracking de eventos de usuários
- 🔑 **API Keys:** Visualização do status das chaves

## 💳 Sistema de Pagamentos

### Planos

- **FREE:** 10 análises gratuitas por dia (teaser)
- **PRO:** Análises ilimitadas + Análise de Comportamento

### Preços (configuráveis)

- PRO: R$ 29,90/mês | R$ 79,90/trimestre | R$ 299,00/ano
- Créditos: R$ 7,99 (1x) | R$ 24,90 (3x) | R$ 39,90 (5x)

## 🔐 Segurança

- ✅ Autenticação via Supabase
- ✅ Row Level Security (RLS) no banco
- ✅ Validação de inputs (Zod)
- ✅ Rate limiting
- ✅ Webhooks verificados (Stripe)
- ✅ Variáveis de ambiente seguras

## 📈 Roadmap

- [ ] Integração com Asaas (PIX)
- [ ] Sistema de emails transacionais (Resend)
- [ ] Analytics avançado
- [ ] Modo escuro
- [ ] PWA (Progressive Web App)
- [ ] API pública

## 📄 Licença

Proprietário - Todos os direitos reservados

## 👨‍💻 Autor

Luiz Henrique Pinotti  
GitHub: [@Luizhp86](https://github.com/Luizhp86)

## 🆘 Suporte

Para dúvidas sobre deploy ou desenvolvimento:
1. Consulte os guias em `docs/`
2. Verifique `DEPLOY_PRODUCAO.md` para troubleshooting
3. Abra uma issue no repositório

---

**🚀 Pronto para colocar em produção!**

Siga o guia `PROXIMOS_PASSOS.md` para fazer deploy na Vercel em menos de 1 hora.
