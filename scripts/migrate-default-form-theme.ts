/**
 * Script para migrar o formulário hardcoded atual para o banco de dados
 * como tema padrão "Relacionamento Geral"
 * 
 * Execute com: npx tsx scripts/migrate-default-form-theme.ts
 */

import { prisma } from '../lib/prisma'

async function main() {
  console.log('🚀 Iniciando migração do formulário padrão...\n')

  try {
    // Verificar se já existe o tema
    const existing = await prisma.formTheme.findUnique({
      where: { name: 'relacionamento-geral' }
    })

    if (existing) {
      console.log('⚠️  Tema "Relacionamento Geral" já existe. Pulando criação...\n')
      return
    }

    // Criar tema padrão
    console.log('📝 Criando tema "Relacionamento Geral"...')
    const theme = await prisma.formTheme.create({
      data: {
        name: 'relacionamento-geral',
        displayName: 'Relacionamento Geral',
        description: 'Análise completa para relacionamentos amorosos em qualquer estágio',
        icon: 'Heart',
        color: 'purple',
        active: true,
        order: 0,
        seasonal: false
      }
    })
    console.log('✅ Tema criado:', theme.id, '\n')

    // Perguntas do tema
    console.log('📋 Criando perguntas...')
    
    const questions = [
      {
        key: 'genero_match',
        label: 'Este match é ele ou ela?',
        type: 'CARD_SELECT',
        required: true,
        order: 0,
        weight: 50,
        autoAdvance: true,
        options: [
          { value: 'ELE', label: 'Ele', hint: 'Match masculino', icon: 'User', color: 'blue', order: 0 },
          { value: 'ELA', label: 'Ela', hint: 'Match feminino', icon: 'User', color: 'pink', order: 1 }
        ]
      },
      {
        key: 'objetivo_usuario',
        label: 'Qual seu objetivo?',
        type: 'CARD_SELECT',
        required: true,
        order: 1,
        weight: 80,
        autoAdvance: true,
        options: [
          { value: 'CASUAL', label: 'Casual', hint: 'Algo leve', icon: 'Sparkles', color: 'purple', order: 0 },
          { value: 'CONHECER', label: 'Conhecer', hint: 'Ver no que dá', icon: 'Heart', color: 'pink', order: 1 },
          { value: 'NAMORO', label: 'Namoro sério', hint: 'Algo duradouro', icon: 'Heart', color: 'red', order: 2 }
        ]
      },
      {
        key: 'ritmo_usuario',
        label: 'Qual ritmo você prefere?',
        type: 'CARD_SELECT',
        required: true,
        order: 2,
        weight: 70,
        autoAdvance: true,
        options: [
          { value: 'RAPIDO', label: 'Rápido', hint: 'Quero avançar logo', icon: 'Zap', color: 'yellow', order: 0 },
          { value: 'MEDIO', label: 'Médio', hint: 'Sem pressa', icon: 'Clock', color: 'blue', order: 1 },
          { value: 'LENTO', label: 'Lento', hint: 'Vou com calma', icon: 'Minus', color: 'gray', order: 2 }
        ]
      },
      {
        key: 'estagio',
        label: 'Em que estágio está?',
        type: 'CARD_SELECT',
        required: true,
        order: 3,
        weight: 60,
        autoAdvance: true,
        options: [
          { value: 'FIRST_CHAT', label: 'Primeira conversa', hint: 'Começamos agora', icon: 'MessageCircle', color: 'blue', order: 0 },
          { value: 'TALKING', label: 'Conversando', hint: 'Já temos rotina', icon: 'MessageCircle', color: 'green', order: 1 },
          { value: 'POST_DATE', label: 'Pós-encontro', hint: 'Já nos vimos', icon: 'Calendar', color: 'purple', order: 2 }
        ]
      },
      {
        key: 'iniciativa',
        label: 'Quem inicia as conversas?',
        type: 'CARD_SELECT',
        required: true,
        order: 4,
        weight: 85,
        autoAdvance: true,
        options: [
          { value: 'VOCE', label: 'Você sempre', hint: 'Você inicia', icon: 'TrendingUp', color: 'orange', order: 0 },
          { value: 'MATCH', label: 'Match sempre', hint: 'Eles iniciam', icon: 'TrendingDown', color: 'blue', order: 1 },
          { value: 'MEIO_A_MEIO', label: 'Equilibrado', hint: 'Ambos', icon: 'Minus', color: 'green', order: 2 }
        ]
      },
      {
        key: 'frequencia_contato',
        label: 'Frequência de contato?',
        type: 'CARD_SELECT',
        required: true,
        order: 5,
        weight: 90,
        autoAdvance: true,
        options: [
          { value: 'DIARIA', label: 'Diária', hint: 'Todo dia', icon: 'CheckCircle2', color: 'green', order: 0 },
          { value: 'ALTERNADA', label: 'Alternada', hint: 'Alguns dias', icon: 'Clock', color: 'yellow', order: 1 },
          { value: 'SOME', label: 'Raramente', hint: 'Pouco contato', icon: 'XCircle', color: 'red', order: 2 }
        ]
      },
      {
        key: 'tempo_resposta',
        label: 'Tempo de resposta?',
        type: 'CARD_SELECT',
        required: false,
        order: 6,
        weight: 75,
        autoAdvance: true,
        options: [
          { value: 'MINUTOS', label: 'Minutos', hint: 'Rápido', icon: 'Zap', color: 'green', order: 0 },
          { value: 'HORAS', label: 'Horas', hint: 'Mesmo dia', icon: 'Clock', color: 'yellow', order: 1 },
          { value: 'DIAS', label: 'Dias', hint: 'Demora', icon: 'XCircle', color: 'red', order: 2 }
        ]
      },
      {
        key: 'curiosidade_por_voce',
        label: 'Curiosidade por você?',
        type: 'CARD_SELECT',
        required: false,
        order: 7,
        weight: 80,
        autoAdvance: true,
        options: [
          { value: 'ALTA', label: 'Alta', hint: 'Faz perguntas', icon: 'TrendingUp', color: 'green', order: 0 },
          { value: 'MEDIA', label: 'Média', hint: 'Interesse moderado', icon: 'Minus', color: 'yellow', order: 1 },
          { value: 'BAIXA', label: 'Baixa', hint: 'Pouco interesse', icon: 'TrendingDown', color: 'red', order: 2 }
        ]
      },
      {
        key: 'respeito_limites',
        label: 'Respeita seus limites?',
        type: 'CARD_SELECT',
        required: false,
        order: 8,
        weight: 95,
        autoAdvance: true,
        options: [
          { value: 'RESPEITA', label: 'Respeita', hint: 'Aceita', icon: 'CheckCircle2', color: 'green', order: 0 },
          { value: 'NEGOCIA', label: 'Negocia', hint: 'Conversa', icon: 'Minus', color: 'yellow', order: 1 },
          { value: 'INSISTE', label: 'Insiste', hint: 'Pressiona', icon: 'AlertTriangle', color: 'orange', order: 2 },
          { value: 'DEBOCHA', label: 'Debocha', hint: 'Ridiculariza', icon: 'XCircle', color: 'red', order: 3 }
        ]
      },
      {
        key: 'fala_futuro',
        label: 'Fala sobre o futuro?',
        type: 'CARD_SELECT',
        required: false,
        order: 9,
        weight: 70,
        autoAdvance: true,
        options: [
          { value: 'NAO', label: 'Não fala', hint: 'Evita o assunto', icon: 'XCircle', color: 'red', order: 0 },
          { value: 'FALA', label: 'Fala', hint: 'Mas não age', icon: 'MessageCircle', color: 'yellow', order: 1 },
          { value: 'FALA_E_FAZ', label: 'Fala e faz', hint: 'Alinha com ações', icon: 'CheckCircle2', color: 'green', order: 2 }
        ]
      },
      {
        key: 'encontro_marcado',
        label: 'Já marcaram encontro?',
        type: 'CARD_SELECT',
        required: false,
        order: 10,
        weight: 85,
        autoAdvance: true,
        options: [
          { value: 'SIM', label: 'Sim', icon: 'CheckCircle2', color: 'green', order: 0 },
          { value: 'NAO', label: 'Não', icon: 'XCircle', color: 'red', order: 1 }
        ]
      },
      {
        key: 'cancelou_encontro',
        label: 'Já cancelou encontro?',
        type: 'CARD_SELECT',
        required: false,
        order: 11,
        weight: 75,
        autoAdvance: true,
        options: [
          { value: 'SIM', label: 'Sim', icon: 'XCircle', color: 'red', order: 0 },
          { value: 'NAO', label: 'Não', icon: 'CheckCircle2', color: 'green', order: 1 }
        ]
      },
      {
        key: 'remarcou_com_data',
        label: 'Remarcou com data definida?',
        type: 'CARD_SELECT',
        required: false,
        order: 12,
        weight: 70,
        autoAdvance: true,
        showIf: { field: 'cancelou_encontro', value: 'SIM' },
        options: [
          { value: 'NAO_SE_APLICA', label: 'Não se aplica', icon: 'Minus', color: 'gray', order: 0 },
          { value: 'SIM', label: 'Sim', icon: 'CheckCircle2', color: 'green', order: 1 },
          { value: 'NAO', label: 'Não', icon: 'XCircle', color: 'red', order: 2 }
        ]
      },
      {
        key: 'disponivel_so_madrugada',
        label: 'Disponível só de madrugada?',
        type: 'CARD_SELECT',
        required: false,
        order: 13,
        weight: 65,
        autoAdvance: true,
        options: [
          { value: 'SIM', label: 'Sim', icon: 'XCircle', color: 'red', order: 0 },
          { value: 'NAO', label: 'Não', icon: 'CheckCircle2', color: 'green', order: 1 }
        ]
      }
    ]

    for (const q of questions) {
      const { options, showIf, ...questionData } = q
      
      const question = await prisma.formQuestion.create({
        data: {
          ...questionData,
          themeId: theme.id,
          showIf: showIf || null,
          isFixed: false
        }
      })

      if (options) {
        await prisma.formQuestionOption.createMany({
          data: options.map((opt) => ({
            questionId: question.id,
            ...opt
          }))
        })
      }

      console.log(`  ✅ ${q.label}`)
    }

    // Criar pergunta fixa: nome do match
    console.log('\n📌 Criando perguntas fixas...')
    const fixedQuestion = await prisma.formQuestion.create({
      data: {
        key: 'nome_match',
        label: 'Como você chama seu match?',
        type: 'AVATAR_SELECT',
        required: false,
        order: 0,
        weight: 40,
        placeholder: 'Digite o apelido',
        isFixed: true,
        fixedPosition: 'AFTER'
      }
    })
    console.log(`  ✅ ${fixedQuestion.label}`)

    console.log('\n✨ Migração concluída com sucesso!')
    console.log(`\n📊 Resumo:`)
    console.log(`   - 1 tema criado`)
    console.log(`   - ${questions.length} perguntas do tema`)
    console.log(`   - 1 pergunta fixa`)
    console.log(`   - Total de opções: ${questions.reduce((acc, q) => acc + (q.options?.length || 0), 0)}`)
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
