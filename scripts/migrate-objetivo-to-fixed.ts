/**
 * Script para migrar a pergunta "objetivo_usuario" para pergunta fixa
 * Remove a pergunta do tema "Relacionamento Geral" e cria como pergunta fixa
 * 
 * Execute com: npx tsx scripts/migrate-objetivo-to-fixed.ts
 */

import { config } from 'dotenv'
config()

import { prisma } from '../lib/prisma'

async function main() {
  console.log('🎯 Migrando pergunta de objetivo para pergunta fixa...\n')

  try {
    // Buscar pergunta de objetivo existente no tema "Relacionamento Geral"
    const existingObjetivoQuestion = await prisma.formQuestion.findFirst({
      where: {
        key: 'objetivo_usuario',
        theme: {
          name: 'relacionamento-geral'
        }
      },
      include: {
        options: true
      }
    })

    // Verificar se já existe como pergunta fixa
    const existingFixed = await prisma.formQuestion.findFirst({
      where: {
        key: 'objetivo_usuario',
        isFixed: true
      }
    })

    if (existingFixed) {
      console.log('⚠️  Pergunta fixa "objetivo_usuario" já existe!')
      console.log('   ID:', existingFixed.id)
      
      // Se existe fixa mas também existe no tema, remover do tema
      if (existingObjetivoQuestion) {
        console.log('\n📝 Removendo pergunta do tema "Relacionamento Geral"...')
        await prisma.formQuestionOption.deleteMany({
          where: { questionId: existingObjetivoQuestion.id }
        })
        await prisma.formQuestion.delete({
          where: { id: existingObjetivoQuestion.id }
        })
        console.log('  ✅ Pergunta removida do tema')
      }
      return
    }

    if (existingObjetivoQuestion) {
      console.log('📝 Encontrada pergunta no tema "Relacionamento Geral"')
      console.log('   ID:', existingObjetivoQuestion.id)
      console.log('   Label:', existingObjetivoQuestion.label)
      console.log('   Opções:', existingObjetivoQuestion.options.length)

      // Criar como pergunta fixa (BEFORE, depois de genero_match que é order 0)
      const fixedObjetivoQuestion = await prisma.formQuestion.create({
        data: {
          key: 'objetivo_usuario',
          label: existingObjetivoQuestion.label,
          type: existingObjetivoQuestion.type,
          required: existingObjetivoQuestion.required,
          order: 1, // Depois de genero_match (order 0)
          weight: existingObjetivoQuestion.weight,
          autoAdvance: existingObjetivoQuestion.autoAdvance,
          isFixed: true,
          fixedPosition: 'BEFORE',
          themeId: null
        }
      })

      console.log('✅ Pergunta fixa criada:', fixedObjetivoQuestion.id)

      // Copiar as opções
      await prisma.formQuestionOption.createMany({
        data: existingObjetivoQuestion.options.map((opt) => ({
          questionId: fixedObjetivoQuestion.id,
          value: opt.value,
          label: opt.label,
          hint: opt.hint,
          icon: opt.icon,
          color: opt.color,
          order: opt.order
        }))
      })

      console.log('✅ Opções copiadas:', existingObjetivoQuestion.options.length)

      // Remover pergunta antiga do tema
      await prisma.formQuestionOption.deleteMany({
        where: { questionId: existingObjetivoQuestion.id }
      })
      await prisma.formQuestion.delete({
        where: { id: existingObjetivoQuestion.id }
      })

      console.log('✅ Pergunta removida do tema "Relacionamento Geral"')
      console.log('\n✨ Migração concluída!')
      console.log('   A pergunta "objetivo_usuario" agora é fixa e aparece em todos os temas')
    } else {
      // Se não existir no tema, criar do zero como fixa
      console.log('⚠️  Pergunta não encontrada no tema "Relacionamento Geral"')
      console.log('📝 Criando pergunta fixa do zero...')
      
      const fixedObjetivoQuestion = await prisma.formQuestion.create({
        data: {
          key: 'objetivo_usuario',
          label: 'Qual seu objetivo?',
          type: 'CARD_SELECT',
          required: true,
          order: 1, // Depois de genero_match (order 0)
          weight: 80,
          autoAdvance: true,
          isFixed: true,
          fixedPosition: 'BEFORE',
          themeId: null
        }
      })

      await prisma.formQuestionOption.createMany({
        data: [
          { questionId: fixedObjetivoQuestion.id, value: 'CASUAL', label: 'Casual', hint: 'Algo leve', icon: 'Sparkles', color: 'purple', order: 0 },
          { questionId: fixedObjetivoQuestion.id, value: 'CONHECER', label: 'Conhecer', hint: 'Ver no que dá', icon: 'Heart', color: 'pink', order: 1 },
          { questionId: fixedObjetivoQuestion.id, value: 'NAMORO', label: 'Namoro sério', hint: 'Algo duradouro', icon: 'Heart', color: 'red', order: 2 }
        ]
      })

      console.log('✅ Pergunta fixa criada do zero')
      console.log('\n✨ Migração concluída!')
    }

    // Verificar resultado final
    const finalCheck = await prisma.formQuestion.findFirst({
      where: {
        key: 'objetivo_usuario',
        isFixed: true
      },
      include: {
        options: true
      }
    })

    if (finalCheck) {
      console.log('\n📊 Verificação final:')
      console.log('   ✅ Pergunta fixa existe')
      console.log('   Label:', finalCheck.label)
      console.log('   Order:', finalCheck.order)
      console.log('   Fixed Position:', finalCheck.fixedPosition)
      console.log('   Opções:', finalCheck.options.length)
    }

  } catch (error) {
    console.error('\n❌ Erro na migração:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
