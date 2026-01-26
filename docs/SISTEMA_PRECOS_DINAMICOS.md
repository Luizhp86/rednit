# Sistema de Preços Dinâmicos

## Visão Geral

Todos os preços do sistema são configuráveis através do painel admin e armazenados no banco de dados na tabela `system_config`. Os preços são carregados dinamicamente em todas as páginas e componentes.

## Estrutura de Preços

### 1. Assinaturas PRO
- **Mensal**: `proPriceMonthly` (padrão: R$ 29,90 = 2990 centavos)
- **Trimestral**: `proPriceQuarterly` (padrão: R$ 79,90 = 7990 centavos)
- **Anual**: `proPriceYearly` (padrão: R$ 299,00 = 29900 centavos)

### 2. Pacotes de Créditos
- **1 Crédito**: `creditPriceSingle` (padrão: R$ 7,99 = 799 centavos)
- **3 Créditos**: `creditPricePack3` (padrão: R$ 24,90 = 2490 centavos)
- **5 Créditos**: `creditPricePack5` (padrão: R$ 39,90 = 3990 centavos)

## Como Funciona

### 1. Armazenamento
Os preços são armazenados em **centavos** no banco de dados para evitar problemas com arredondamento de ponto flutuante.

```sql
-- Exemplo de registro na tabela system_config
{
  "id": "default",
  "proPriceMonthly": 2990,      -- R$ 29,90
  "proPriceQuarterly": 7990,    -- R$ 79,90
  "proPriceYearly": 29900,      -- R$ 299,00
  "creditPriceSingle": 799,     -- R$ 7,99
  "creditPricePack3": 2490,     -- R$ 24,90
  "creditPricePack5": 3990      -- R$ 39,90
}
```

### 2. Configuração no Admin

O painel admin (`/admin`) permite editar todos os preços:

1. Acesse a aba **"Configurações"**
2. Localize as seções:
   - **Preços de Assinaturas PRO**
   - **Preços de Pacotes de Créditos**
3. Digite os valores em **reais** (ex: `29.90` ou `29,90`)
4. Clique em **"Salvar Configurações"**

Os valores são automaticamente convertidos para centavos e salvos no banco.

### 3. Cache

O sistema usa cache em memória (TTL: 1 minuto) para otimizar performance:

```typescript
// lib/config.ts
const CACHE_TTL = 60 * 1000 // 1 minuto
```

Para invalidar o cache após atualizar preços:
```typescript
import { invalidateConfigCache } from '@/lib/config'
invalidateConfigCache()
```

### 4. APIs que Fornecem Preços

#### `/api/me`
Retorna dados do usuário + preços do sistema:
```json
{
  "id": "...",
  "email": "...",
  "prices": {
    "subscription": {
      "monthly": 2990,
      "quarterly": 7990,
      "yearly": 29900
    },
    "credits": {
      "single": 799,
      "pack3": 2490,
      "pack5": 3990
    }
  }
}
```

#### `/api/prices` (público)
Endpoint dedicado apenas para preços:
```json
{
  "subscription": {
    "monthly": 2990,
    "quarterly": 7990,
    "yearly": 29900
  },
  "credits": {
    "single": 799,
    "pack3": 2490,
    "pack5": 3990
  }
}
```

### 5. Componentes que Usam Preços Dinâmicos

#### Página de Conta (`/account`)
- Busca preços via `/api/me`
- Exibe valores formatados nos botões de assinatura e créditos
- Formato: `R$ {(valor / 100).toFixed(2).replace('.', ',')}`

#### Página de Análise (`/dashboard/analysis/[id]`)
- Busca preços via `/api/me` junto com créditos do usuário
- Atualiza estados `prices` e `subscriptionPrices`
- Exibe nos modais de unlock e compra de créditos

#### Componentes de UI
- `CreditPackages`: Recebe preços via props
- `SubscriptionPlans`: Recebe preços via props

### 6. Formatação de Valores

Para exibir valores em reais:

```typescript
// De centavos para reais formatado
const formatPrice = (cents: number) => {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`
}

// Exemplo
formatPrice(2990) // "R$ 29,90"
formatPrice(799)  // "R$ 7,99"
```

### 7. Cálculo de Valores Mensais

Para planos trimestrais e anuais:

```typescript
// Trimestral (3 meses)
const monthlyQuarterly = subscriptionPrices.quarterly / 300
// R$ 79,90 / 3 = R$ 26,63/mês

// Anual (12 meses)
const monthlyYearly = subscriptionPrices.yearly / 1200
// R$ 299,00 / 12 = R$ 24,92/mês
```

## Fluxo de Atualização de Preços

1. **Admin altera preço no painel**
   ```
   Admin UI → PUT /api/admin → Atualiza system_config → Invalida cache
   ```

2. **Usuário acessa página**
   ```
   Página → GET /api/me ou /api/prices → getSystemConfig() → 
   Busca do cache ou DB → Retorna preços atualizados
   ```

3. **Checkout usa preços dinâmicos**
   ```
   POST /api/checkout → getSystemConfig() → 
   Usa preços do banco → Cria pagamento no Asaas
   ```

## Valores Padrão

Se não houver configuração no banco, o sistema usa valores padrão definidos em `lib/config.ts`:

```typescript
const DEFAULT_CONFIG = {
  proPriceMonthly: 2990,
  proPriceQuarterly: 7990,
  proPriceYearly: 29900,
  creditPriceSingle: 799,
  creditPricePack3: 2490,
  creditPricePack5: 3990,
  // ...
}
```

## Inicialização do Banco

Para criar o registro inicial de configuração:

```sql
INSERT INTO "system_config" (
  "id",
  "proPriceMonthly",
  "proPriceQuarterly",
  "proPriceYearly",
  "creditPriceSingle",
  "creditPricePack3",
  "creditPricePack5"
) VALUES (
  'default',
  2990,
  7990,
  29900,
  799,
  2490,
  3990
)
ON CONFLICT ("id") DO UPDATE SET
  "proPriceMonthly" = EXCLUDED."proPriceMonthly",
  "proPriceQuarterly" = EXCLUDED."proPriceQuarterly",
  "proPriceYearly" = EXCLUDED."proPriceYearly",
  "creditPriceSingle" = EXCLUDED."creditPriceSingle",
  "creditPricePack3" = EXCLUDED."creditPricePack3",
  "creditPricePack5" = EXCLUDED."creditPricePack5";
```

## Testes

### Testar alteração de preços:

1. Acesse `/admin`
2. Vá para "Configurações"
3. Altere um preço (ex: 1 Crédito para R$ 9,99)
4. Salve
5. Acesse `/account` ou uma análise bloqueada
6. Verifique se o novo preço aparece

### Verificar preços no banco:

```sql
SELECT 
  "creditPriceSingle" / 100.0 as "1_credito",
  "creditPricePack3" / 100.0 as "3_creditos",
  "creditPricePack5" / 100.0 as "5_creditos",
  "proPriceMonthly" / 100.0 as "pro_mensal",
  "proPriceQuarterly" / 100.0 as "pro_trimestral",
  "proPriceYearly" / 100.0 as "pro_anual"
FROM "system_config"
WHERE "id" = 'default';
```

## Benefícios

✅ **Flexibilidade**: Altere preços sem deploy  
✅ **Consistência**: Um único local de verdade para preços  
✅ **Performance**: Cache reduz consultas ao banco  
✅ **Manutenibilidade**: Fácil adicionar novos planos/pacotes  
✅ **Testes A/B**: Possível testar diferentes estratégias de preço  
✅ **Promoções**: Altere preços temporariamente para campanhas  

## Próximos Passos (Opcional)

- [ ] Histórico de alterações de preços
- [ ] Preços por região/moeda
- [ ] Cupons de desconto
- [ ] Preços promocionais com data de expiração
- [ ] API para webhooks de alteração de preço
