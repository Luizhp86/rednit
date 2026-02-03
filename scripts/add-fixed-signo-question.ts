/**
 * Script para adicionar a pergunta "signo_match" como pergunta fixa
 * 
 * Execução: npx tsx scripts/add-fixed-signo-question.ts
 */

import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function main() {
  console.log('⭐ Adicionando pergunta fixa: signo_match\n')

  // Verificar se já existe
  const existing = await prisma.formQuestion.findFirst({
    where: {
      key: 'signo_match',
      isFixed: true
    }
  })

  if (existing) {
    console.log('⚠️ Pergunta fixa "signo_match" já existe!')
    console.log('   ID:', existing.id)
    return
  }

  // Criar a pergunta fixa
  const question = await prisma.formQuestion.create({
    data: {
      key: 'signo_match',
      label: 'Qual o signo do match?',
      description: '(se você souber)',
      type: 'CARD_SELECT',
      required: false, // Opcional
      order: 1, // Após outras perguntas AFTER se existirem
      weight: 30, // Baixa importância para análise
      autoAdvance: true,
      isFixed: true,
      fixedPosition: 'AFTER', // No final dos formulários
      themeId: null
    }
  })

  console.log('✅ Pergunta criada:', question.id)

  // Criar as opções dos signos
  await prisma.formQuestionOption.createMany({
    data: [
      {
        questionId: question.id,
        value: 'ARIES',
        label: 'Áries',
        icon: 'Zap',
        color: 'red',
        order: 0
      },
      {
        questionId: question.id,
        value: 'TOURO',
        label: 'Touro',
        icon: 'Shield',
        color: 'green',
        order: 1
      },
      {
        questionId: question.id,
        value: 'GEMEOS',
        label: 'Gêmeos',
        icon: 'Users',
        color: 'yellow',
        order: 2
      },
      {
        questionId: question.id,
        value: 'CANCER',
        label: 'Câncer',
        icon: 'Heart',
        color: 'pink',
        order: 3
      },
      {
        questionId: question.id,
        value: 'LEAO',
        label: 'Leão',
        icon: 'Star',
        color: 'orange',
        order: 4
      },
      {
        questionId: question.id,
        value: 'VIRGEM',
        label: 'Virgem',
        icon: 'CheckCircle2',
        color: 'blue',
        order: 5
      },
      {
        questionId: question.id,
        value: 'LIBRA',
        label: 'Libra',
        icon: 'Scale',
        color: 'purple',
        order: 6
      },
      {
        questionId: question.id,
        value: 'ESCORPIAO',
        label: 'Escorpião',
        icon: 'AlertTriangle',
        color: 'red',
        order: 7
      },
      {
        questionId: question.id,
        value: 'SAGITARIO',
        label: 'Sagitário',
        icon: 'ArrowRight',
        color: 'purple',
        order: 8
      },
      {
        questionId: question.id,
        value: 'CAPRICORNIO',
        label: 'Capricórnio',
        icon: 'TrendingUp',
        color: 'gray',
        order: 9
      },
      {
        questionId: question.id,
        value: 'AQUARIO',
        label: 'Aquário',
        icon: 'Sparkles',
        color: 'blue',
        order: 10
      },
      {
        questionId: question.id,
        value: 'PEIXES',
        label: 'Peixes',
        icon: 'Waves',
        color: 'cyan',
        order: 11
      },
      {
        questionId: question.id,
        value: 'NAO_SEI',
        label: 'Não sei',
        icon: 'HelpCircle',
        color: 'gray',
        order: 12
      }
    ]
  })

  console.log('✅ Opções criadas! (13 opções: 12 signos + "Não sei")')

  // Verificar resultado
  const result = await prisma.formQuestion.findUnique({
    where: { id: question.id },
    include: { options: true }
  })

  console.log('\n📋 Pergunta fixa criada com sucesso:')
  console.log('   Key:', result?.key)
  console.log('   Label:', result?.label)
  console.log('   Description:', result?.description)
  console.log('   Position:', result?.fixedPosition)
  console.log('   Required:', result?.required)
  console.log('   Opções:', result?.options.map(o => o.label).join(', '))

  console.log('\n🎉 Pronto! A pergunta agora aparecerá no FINAL de TODOS os formulários temáticos.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
