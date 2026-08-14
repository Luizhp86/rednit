# Configuração do Banco de Dados

## Problema Atual

O `DATABASE_URL` está usando o formato `prisma+postgres://` que aponta para um servidor PostgreSQL local que não está rodando.

## Solução: Usar URL de Conexão Direta do Supabase

### Passo 1: Obter a URL de Conexão do Supabase

1. Acesse: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/settings/database
2. Role até a seção **"Connection string"**
3. Selecione a aba **"URI"** (não "Connection pooling")
4. Copie a URL completa. Ela deve ter o formato:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   ou
   ```
   postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

### Passo 2: Atualizar o arquivo .env

Abra o arquivo `.env` e substitua a linha `DATABASE_URL` pela URL copiada:

```env
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.xxxxx.supabase.co:5432/postgres"
```

**Importante:** Substitua `[SUA-SENHA]` pela senha do seu banco de dados do Supabase.

### Passo 3: Executar as Migrações

Depois de atualizar o `.env`, execute:

```bash
npx prisma migrate dev --name init
```

Isso criará todas as tabelas necessárias no banco de dados do Supabase.

### Passo 4: Verificar se Funcionou

Execute:

```bash
npx prisma migrate status
```

Deve mostrar que todas as migrações foram aplicadas.

## Nota sobre Senha do Banco

Se você não souber a senha do banco de dados:
1. No painel do Supabase, vá em **Settings > Database**
2. Role até **"Database password"**
3. Se não souber, você pode resetar a senha
4. Use a senha no `DATABASE_URL`
