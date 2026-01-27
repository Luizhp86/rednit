/**
 * Script para adicionar a pergunta "objetivo_usuario" como pergunta fixa
 * 
 * Execução: npx tsx scripts/add-fixed-objetivo-question.ts
 */

import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function main() {
  console.log('🎯 Adicionando pergunta fixa: objetivo_usuario\n')

  // Verificar se já existe
  const existing = await prisma.formQuestion.findFirst({
    where: {
      key: 'objetivo_usuario',
      isFixed: true
    }
  })

  if (existing) {
    console.log('⚠️ Pergunta fixa "objetivo_usuario" já existe!')
    console.log('   ID:', existing.id)
    return
  }

  // Criar a pergunta fixa
  const question = await prisma.formQuestion.create({
    data: {
      key: 'objetivo_usuario',
      label: 'O que você busca?',
      type: 'CARD_SELECT',
      required: true,
      order: 1, // Depois de genero_match que é order 0
      weight: 80, // Alta importância para análise de compatibilidade
      autoAdvance: true,
      isFixed: true,
      fixedPosition: 'BEFORE',
      themeId: null
    }
  })

  console.log('✅ Pergunta criada:', question.id)

  // Criar as opções
  await prisma.formQuestionOption.createMany({
    data: [
      {
        questionId: question.id,
        value: 'CASUAL',
        label: 'Algo casual',
        hint: 'Sem compromisso sério',
        icon: 'Sparkles',
        color: 'purple',
        order: 0
      },
      {
        questionId: question.id,
        value: 'CONHECER',
        label: 'Conhecer melhor',
        hint: 'Ver no que dá',
        icon: 'Users',
        color: 'blue',
        order: 1
      },
      {
        questionId: question.id,
        value: 'NAMORO',
        label: 'Namoro sério',
        hint: 'Relacionamento comprometido',
        icon: 'Heart',
        color: 'pink',
        order: 2
      }
    ]
  })

  console.log('✅ Opções criadas!')

  // Verificar resultado
  const result = await prisma.formQuestion.findUnique({
    where: { id: question.id },
    include: { options: true }
  })

  console.log('\n📋 Pergunta fixa criada com sucesso:')
  console.log('   Key:', result?.key)
  console.log('   Label:', result?.label)
  console.log('   Position:', result?.fixedPosition)
  console.log('   Opções:', result?.options.map(o => o.label).join(', '))

  console.log('\n🎉 Pronto! A pergunta agora aparecerá em TODOS os formulários temáticos.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
