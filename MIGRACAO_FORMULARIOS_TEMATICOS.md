# Sistema de Formulários Temáticos - Guia de Implementação

## ✅ Implementação Completa

O sistema de formulários temáticos dinâmicos foi completamente implementado!

## 🗄️ Estrutura do Banco de Dados

### Novos Modelos

1. **FormTheme** - Temas de formulário
   - Suporta temas regulares e sazonais (com data início/fim)
   - Configurável: ícone, cor, ordem de exibição
   
2. **FormQuestion** - Perguntas
   - Vinculadas a um tema ou podem ser "fixas" (aparecem em todos)
   - Peso (0-100) para análise - quanto maior o peso, mais influencia
   - Suporte a perguntas condicionais (showIf)
   - Tipos: CARD_SELECT, TEXTAREA, AVATAR_SELECT, NUMBER, MULTI_SELECT

3. **FormQuestionOption** - Opções de resposta
   - Para perguntas tipo select
   - Suporte a ícones e cores

4. **Analysis** - Atualizado
   - Campo `themeId` para rastrear qual tema foi usado

## 🎨 Interface Admin

Nova aba **"Formulários"** no painel admin (`/admin`) com:

### Gerenciamento de Temas
- Criar/editar/deletar temas
- Ativar/desativar temas
- Configurar temas sazonais com período de disponibilidade
- Duplicar temas existentes

### Gerenciamento de Perguntas
- Adicionar perguntas ao tema
- Configurar peso de cada pergunta (0-100)
- Definir se é obrigatória ou opcional
- Adicionar opções de resposta com ícones e cores
- Reordenar perguntas (drag-and-drop planejado)

### Perguntas Fixas
- Perguntas que aparecem em TODOS os temas
- Configurar se aparecem antes ou depois das perguntas do tema

## 🎯 Jornada do Usuário

1. Acessa `/dashboard/new`
2. **Nova tela**: seleciona um tema (visual com cards)
3. Responde perguntas do tema + perguntas fixas
4. Sistema gera análise com pesos aplicados

## 🔧 APIs Criadas

### Admin (autenticação necessária)
- `GET /api/admin/form-themes` - Listar temas
- `POST /api/admin/form-themes` - Criar tema
- `GET/PATCH/DELETE /api/admin/form-themes/[id]` - Gerenciar tema
- `GET /api/admin/form-questions` - Listar perguntas
- `POST /api/admin/form-questions` - Criar pergunta
- `PATCH/DELETE /api/admin/form-questions/[id]` - Gerenciar pergunta
- `POST /api/admin/form-questions/reorder` - Reordenar perguntas

### Público (usuário autenticado)
- `GET /api/form-themes` - Listar temas ativos (inclui validação de período sazonal)
- `GET /api/form-themes/[id]/questions` - Buscar perguntas de um tema

## 📊 Motor de Análise Atualizado

O motor de análise (`lib/rules/engine.ts`) foi adaptado para:

- Aceitar pesos das perguntas como parâmetro
- Aplicar multiplicador baseado no peso:
  - Peso 0 = multiplicador 0.5x (metade da influência)
  - Peso 50 = multiplicador 1x (influência padrão)
  - Peso 100 = multiplicador 2x (dobro da influência)
- Manter compatibilidade com análises antigas (sem tema)

**Exemplo:**
Se uma pergunta tem peso 90 e normalmente alteraria um score em +10 pontos, com o peso 90 ela alterará +18 pontos (10 * 1.8).

## 🚀 Migração do Formulário Atual

### Executar Script de Migração

```bash
# Carregar variáveis de ambiente
# Execute no diretório raiz do projeto

npx tsx scripts/migrate-default-form-theme.ts
```

Este script irá:
1. Criar tema "Relacionamento Geral"
2. Migrar todas as 14 perguntas atuais
3. Configurar pesos apropriados para cada pergunta
4. Criar pergunta fixa "nome do match"

### Pesos Configurados

As perguntas foram configuradas com os seguintes pesos baseados em sua importância:

- **Respeito aos limites**: 95 (crítico)
- **Frequência de contato**: 90 (muito alto)
- **Iniciativa**: 85 (muito alto)
- **Encontro marcado**: 85 (muito alto)
- **Objetivo do usuário**: 80 (alto)
- **Curiosidade por você**: 80 (alto)
- **Tempo de resposta**: 75 (alto)
- **Cancelou encontro**: 75 (alto)
- **Ritmo preferido**: 70 (médio-alto)
- **Fala sobre futuro**: 70 (médio-alto)
- **Remarcou com data**: 70 (médio-alto)
- **Disponível só madrugada**: 65 (médio)
- **Estágio**: 60 (médio)
- **Gênero do match**: 50 (padrão)
- **Nome do match**: 40 (baixo - informativo)

## 📝 Exemplos de Uso

### Criar Tema Sazonal

```typescript
const carnavalTheme = await prisma.formTheme.create({
  data: {
    name: 'encontro-carnaval',
    displayName: 'Encontro de Carnaval',
    description: 'Avalie aquele match que conheceu no carnaval',
    icon: 'Sparkles',
    color: 'yellow',
    active: true,
    seasonal: true,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-02-20'),
    order: 0
  }
})
```

### Adicionar Pergunta ao Tema

```typescript
const question = await prisma.formQuestion.create({
  data: {
    themeId: carnavalTheme.id,
    key: 'encontrou_aonde',
    label: 'Onde vocês se conheceram?',
    type: 'CARD_SELECT',
    required: true,
    order: 0,
    weight: 70,
    autoAdvance: true
  }
})

// Adicionar opções
await prisma.formQuestionOption.createMany({
  data: [
    { questionId: question.id, value: 'BLOCO', label: 'Bloco de rua', order: 0 },
    { questionId: question.id, value: 'FESTA', label: 'Festa privada', order: 1 },
    { questionId: question.id, value: 'BAILE', label: 'Baile', order: 2 }
  ]
})
```

## 🎨 Próximos Passos (Melhorias Futuras)

1. **UI Melhorada**
   - Drag-and-drop para reordenar perguntas
   - Preview do formulário ao editar
   - Duplicar pergunta entre temas

2. **Validação Dinâmica**
   - Implementar validação Zod dinâmica baseada nas perguntas
   - Validações customizadas por tipo de pergunta

3. **Analytics**
   - Dashboard de uso por tema
   - Taxa de conclusão por pergunta
   - Análise de abandono do formulário

4. **A/B Testing**
   - Testar variações de perguntas
   - Comparar pesos diferentes

## ⚠️ Notas Importantes

### Compatibilidade
- Análises antigas (sem `themeId`) continuam funcionando normalmente
- O formulário hardcoded ainda funciona como fallback
- Temas inativos não aparecem para usuários

### Deletar Temas
- Só é possível deletar temas que não têm análises associadas
- Use "desativar" ao invés de deletar para preservar dados

### Performance
- Temas e perguntas são carregados sob demanda
- Cache pode ser implementado futuramente para melhorar performance

## 🐛 Troubleshooting

**Tema não aparece para usuário:**
- Verifique se `active = true`
- Se sazonal, verifique se está dentro do período (startDate/endDate)
- Verifique se há perguntas cadastradas no tema

**Perguntas não carregam:**
- Verifique se as perguntas têm opções (para tipo CARD_SELECT)
- Verifique a ordem das perguntas (field `order`)

**Pesos não estão sendo aplicados:**
- Verifique logs da API `/api/analyze`
- Confirme que `themeId` está sendo enviado no payload
- Verifique se `question_weights_applied: true` aparece no resultado

## 📚 Documentação Técnica

- Schema Prisma: `prisma/schema.prisma`
- Motor de análise: `lib/rules/engine.ts`
- Componente de seleção: `components/theme-selector.tsx`
- Manager admin: `components/admin/form-themes-manager.tsx`
- APIs: `app/api/form-themes/` e `app/api/admin/form-themes/`

---

**Data de Implementação:** Janeiro 2026  
**Status:** ✅ Completo e funcional
