/**
 * Script para remover a pergunta "objetivo_usuario" de todos os temas
 * (já que agora ela é uma pergunta fixa)
 * 
 * Execute com: npx tsx scripts/remove-objetivo-from-themes.ts
 */

import { config } from 'dotenv'
config()

import { prisma } from '../lib/prisma'

async function main() {
  console.log('🔍 Procurando perguntas de objetivo em temas...\n')

  try {
    // Buscar todas as perguntas de objetivo que NÃO são fixas
    const objetivoQuestions = await prisma.formQuestion.findMany({
      where: {
        key: 'objetivo_usuario',
        isFixed: false
      },
      include: {
        options: true,
        theme: {
          select: {
            name: true,
            displayName: true
          }
        }
      }
    })

    if (objetivoQuestions.length === 0) {
      console.log('✅ Nenhuma pergunta de objetivo encontrada em temas')
      console.log('   Tudo certo! A pergunta já é apenas fixa.')
      return
    }

    console.log(`📋 Encontradas ${objetivoQuestions.length} pergunta(s) de objetivo em temas:`)
    objetivoQuestions.forEach((q, idx) => {
      console.log(`   ${idx + 1}. Tema: ${q.theme?.displayName || 'Sem tema'} (${q.theme?.name || 'N/A'})`)
      console.log(`      ID: ${q.id}`)
      console.log(`      Label: ${q.label}`)
    })

    console.log('\n🗑️  Removendo perguntas dos temas...')

    for (const question of objetivoQuestions) {
      // Remover opções primeiro
      await prisma.formQuestionOption.deleteMany({
        where: { questionId: question.id }
      })
      
      // Remover pergunta
      await prisma.formQuestion.delete({
        where: { id: question.id }
      })
      
      console.log(`   ✅ Removida do tema: ${question.theme?.displayName || 'Sem tema'}`)
    }

    console.log('\n✨ Limpeza concluída!')
    console.log('   A pergunta "objetivo_usuario" agora existe apenas como pergunta fixa')

  } catch (error) {
    console.error('\n❌ Erro na limpeza:', error)
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
