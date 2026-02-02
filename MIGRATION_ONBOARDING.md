# Migration: Adicionar flag hasSeenOnboarding

## O que mudou?

Adicionamos uma flag `hasSeenOnboarding` na tabela `users` para controlar se o usuário já viu o tour de onboarding do dashboard.

## Comandos para aplicar a migration

### 1. Gerar a migration (desenvolvimento)

```bash
npm run db:migrate
```

Quando solicitado o nome da migration, digite:
```
add_has_seen_onboarding_to_users
```

### 2. Aplicar no banco de desenvolvimento

A migration será aplicada automaticamente no passo acima.

### 3. Aplicar em produção

Após fazer deploy, a migration será aplicada automaticamente durante o build.

Ou manualmente via:
```bash
npx prisma migrate deploy
```

## Rollback (se necessário)

Para reverter essa migration:

```sql
ALTER TABLE users DROP COLUMN "hasSeenOnboarding";
```

## Atualização de dados existentes

Todos os usuários existentes terão `hasSeenOnboarding = false` por padrão, o que significa que verão o onboarding na próxima vez que acessarem o dashboard.

Se quiser marcar usuários existentes como já tendo visto o onboarding, execute:

```sql
-- Marcar todos usuários com 1 ou mais análises como já tendo visto
UPDATE users 
SET "hasSeenOnboarding" = true 
WHERE id IN (
  SELECT DISTINCT "userId" 
  FROM analyses
);
```

Ou pelo Prisma Studio:
```bash
npm run db:studio
```
