# Rednit (Radar Match)

Motor de análise comportamental para relacionamentos que começaram em app de namoro. Você descreve o que está acontecendo; o motor devolve scores, hipóteses, red flags, green flags e um plano do que observar.

Demo: [rednit-nu.vercel.app](https://rednit-nu.vercel.app)  
Repositório: [github.com/Luizhp86/rednit](https://github.com/Luizhp86/rednit)

---

## Para que serve

Conversas de app são ambíguas. A pessoa some, promete e não marca, só aparece de madrugada, ou parece perfeita até o primeiro “não”. O Rednit organiza isso em um relatório, em vez de deixar tudo no feeling.

É útil para:

- **quem está saindo com alguém** e quer um segundo olhar, com linguagem clara
- **terapeutas, coaches e criadores** que queiram um motor de sinais (não um horóscopo)
- **devs** que queiram reusar o motor de regras (`lib/rules`) em outro produto — app, bot, pesquisa, onboarding

Não é oráculo e não substitui julgamento. É um motor determinístico: mesmas respostas, mesma análise. A IA (Gemini) entra depois, para redigir o texto com mais naturalidade — o veredito numérico vem das regras.

---

## Como o motor funciona

O cérebro está em dois arquivos, independentes da interface:

```
lib/rules/
  engine.ts      # analyze(input) → scores, hipóteses, flags, relatório
  ruleset.json   # pesos, sinais, red/green flags, hipóteses
```

Você passa um formulário (iniciativa, frequência, respeito a limites, encontro, etc.). O motor:

1. **Dispara sinais** — cada resposta vira um código (`INICIATIVA_VOCE_SEMPRE`, `RESPEITO_INSISTE`…)
2. **Calcula 9 scores** (0–100, na prática 10–90):
   - reciprocidade, constância, ação no mundo real
   - respeito, coerência, disponibilidade
   - risco de ghosting, risco de enrolação, compatibilidade com o seu objetivo
3. **Cruza com o estágio** — primeiro chat, conversando, ou pós-encontro (o mesmo atraso pesa mais depois do date)
4. **Monta hipóteses** — explorando opções, busca sério, validação, rebote, evitativo, interesse superficial
5. **Marca flags** — desprezo a limites, future faking, cancelou sem remarcar, reciprocidade equilibrada, etc.
6. **Devolve dois cortes:**
   - *teaser grátis* — headline, 1 risco, 1 flag, o que olhar em 48h
   - *relatório premium* — top 3 hipóteses, mapa de risco, checklist, plano por estágio

A base teórica do `ruleset.json` é explícita: apego, investimento (Rusbult), Gottman (desprezo como preditor), interdependência. Os pesos estão no JSON — dá para calibrar sem reescrever o TypeScript.

### Usar só o motor (sem o site)

```ts
import { analyze } from "./lib/rules/engine";

const result = analyze({
  genero_match: "ELE",
  objetivo_usuario: "NAMORO",
  estagio: "TALKING",
  iniciativa: "VOCE",
  frequencia_contato: "SOME",
  tempo_resposta: "DIAS",
  respeito_limites: "RESPEITA",
  sinais_alerta: [],
  inegociaveis: [],
  nome_match: "Alex",
});

console.log(result.scores);
console.log(result.hypotheses_top3);
console.log(result.free_teaser.headline);
```

Isso é o produto. O restante do repo é o produto em volta: login, créditos, Stripe, painel admin, Gemini para o texto.

---

## Como usar o produto (usuário)

1. Crie conta (Supabase Auth)
2. Preencha o formulário sobre o match (há formulários temáticos além do padrão)
3. Veja o teaser grátis
4. Desbloqueie o relatório completo com crédito ou plano PRO

Planos típicos (valores configuráveis no admin):

- **FREE** — teasers com limite diário
- **PRO** — relatórios ilimitados + evolução ao longo do tempo
- **Créditos avulsos** — 1, 3 ou 5 análises

---

## Como rodar localmente

### O que você precisa

- Node.js 18+
- Projeto [Supabase](https://supabase.com) (Auth + Postgres)
- [Gemini API key](https://aistudio.google.com/apikey)
- (opcional) Stripe, para pagamentos

### Passo a passo

```bash
git clone https://github.com/Luizhp86/rednit.git
cd rednit
npm install
cp .env.example .env
```

Preencha no `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=postgresql://...?
GEMINI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Banco e app:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

Abra `http://localhost:3000`.

Guias extras de deploy (Vercel + Stripe): `PROXIMOS_PASSOS.md`, `CHECKLIST_DEPLOY.md`, `DEPLOY_PRODUCAO.md`.

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| App | Next.js 16, TypeScript, Tailwind, shadcn/ui |
| Motor | TypeScript puro + `ruleset.json` |
| Texto / IA | Google Gemini |
| Auth + DB | Supabase + Prisma + PostgreSQL |
| Pagamento | Stripe |
| Host | Vercel |

---

## Estrutura

```
app/                 rotas (dashboard, admin, login, API)
components/          UI
lib/
  rules/             motor de análise ← comece aqui
  ai/                Gemini (redação)
  supabase/          auth
  stripe.ts          cobrança
prisma/              schema e migrations
docs/                notas de produto e deploy
```

---

## Licença

MIT. Pode clonar, estudar o `ruleset`, recalibrar pesos e embutir o `analyze()` em outro projeto.

Isso não é aconselhamento psicológico nem diagnóstico. É um modelo de sinais, aberto para crítica e melhoria.
