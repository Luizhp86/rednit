/**
 * Script para verificar temas criados
 */

import { config } from 'dotenv'
config()

import { prisma } from '../lib/prisma'

async function main() {
  console.log('🔍 Verificando temas criados...\n')

  try {
    // Listar todos os temas
    const themes = await prisma.formTheme.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    })

    console.log(`📋 Total de temas: ${themes.length}\n`)
    
    for (const theme of themes) {
      const seasonal = theme.seasonal ? '🎭 SAZONAL' : '📅'
      const active = theme.active ? '✅' : '❌'
      console.log(`${seasonal} ${active} ${theme.displayName} (${theme.name})`)
      console.log(`   Cor: ${theme.color} | Ícone: ${theme.icon}`)
      console.log(`   Perguntas: ${theme._count.questions}`)
      if (theme.seasonal) {
        console.log(`   Período: ${theme.startDate?.toLocaleDateString('pt-BR')} - ${theme.endDate?.toLocaleDateString('pt-BR')}`)
      }
      console.log()
    }

    // Verificar perguntas fixas
    const fixedQuestions = await prisma.formQuestion.findMany({
      where: { isFixed: true },
      include: {
        _count: {
          select: { options: true }
        }
      }
    })

    console.log(`\n📌 Perguntas Fixas: ${fixedQuestions.length}\n`)
    for (const q of fixedQuestions) {
      console.log(`   ${q.fixedPosition === 'BEFORE' ? '⬆️ BEFORE' : '⬇️ AFTER'} ${q.label}`)
      console.log(`      Key: ${q.key} | Tipo: ${q.type} | Peso: ${q.weight}`)
      console.log(`      Opções: ${q._count.options}`)
      console.log()
    }

    console.log('\n✅ Verificação concluída!')

  } catch (error) {
    console.error('❌ Erro:', error)
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
