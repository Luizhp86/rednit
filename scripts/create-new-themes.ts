/**
 * Script para criar novos temas de formulário e migrar pergunta de gênero para fixa
 * 
 * Execute com: npx tsx scripts/create-new-themes.ts
 */

import { config } from 'dotenv'
config()

import { prisma } from '../lib/prisma'

async function main() {
  console.log('🚀 Iniciando criação de novos temas...\n')

  try {
    // ===== PASSO 1: Migrar pergunta de gênero para fixa =====
    console.log('📌 Migrando pergunta de gênero para pergunta fixa...')
    
    // Buscar pergunta de gênero existente no tema "Relacionamento Geral"
    const existingGenderQuestion = await prisma.formQuestion.findFirst({
      where: {
        key: 'genero_match',
        theme: {
          name: 'relacionamento-geral'
        }
      },
      include: {
        options: true
      }
    })

    if (existingGenderQuestion) {
      // Criar como pergunta fixa (BEFORE)
      const fixedGenderQuestion = await prisma.formQuestion.create({
        data: {
          key: 'genero_match',
          label: 'Este match é ele ou ela?',
          type: 'CARD_SELECT',
          required: true,
          order: 0,
          weight: 50,
          autoAdvance: true,
          isFixed: true,
          fixedPosition: 'BEFORE',
          themeId: null
        }
      })

      // Copiar as opções
      await prisma.formQuestionOption.createMany({
        data: existingGenderQuestion.options.map((opt) => ({
          questionId: fixedGenderQuestion.id,
          value: opt.value,
          label: opt.label,
          hint: opt.hint,
          icon: opt.icon,
          color: opt.color,
          order: opt.order
        }))
      })

      // Remover pergunta antiga do tema
      await prisma.formQuestionOption.deleteMany({
        where: { questionId: existingGenderQuestion.id }
      })
      await prisma.formQuestion.delete({
        where: { id: existingGenderQuestion.id }
      })

      console.log('  ✅ Pergunta de gênero agora é fixa (aparece em todos os temas)')
    } else {
      // Se não existir, criar do zero
      const fixedGenderQuestion = await prisma.formQuestion.create({
        data: {
          key: 'genero_match',
          label: 'Este match é ele ou ela?',
          type: 'CARD_SELECT',
          required: true,
          order: 0,
          weight: 50,
          autoAdvance: true,
          isFixed: true,
          fixedPosition: 'BEFORE',
          themeId: null
        }
      })

      await prisma.formQuestionOption.createMany({
        data: [
          { questionId: fixedGenderQuestion.id, value: 'ELE', label: 'Ele', hint: 'Match masculino', icon: 'User', color: 'blue', order: 0 },
          { questionId: fixedGenderQuestion.id, value: 'ELA', label: 'Ela', hint: 'Match feminino', icon: 'User', color: 'pink', order: 1 }
        ]
      })

      console.log('  ✅ Pergunta fixa de gênero criada')
    }

    // ===== PASSO 2: Criar novos temas =====
    console.log('\n📝 Criando novos temas...\n')

    // TEMA 1: Encontro de Carnaval (Sazonal)
    console.log('🎊 Tema: Encontro de Carnaval')
    const carnavalExists = await prisma.formTheme.findUnique({
      where: { name: 'encontro-carnaval' }
    })

    if (!carnavalExists) {
      const carnaval = await prisma.formTheme.create({
        data: {
          name: 'encontro-carnaval',
          displayName: 'Encontro de Carnaval',
          description: 'Avalie aquele match que conheceu no carnaval',
          icon: 'Sparkles',
          color: 'yellow',
          active: true,
          seasonal: true,
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-03-31'),
          order: 1
        }
      })

      const carnavalQuestions = [
        {
          key: 'onde_conheceram',
          label: 'Onde vocês se conheceram?',
          type: 'CARD_SELECT',
          required: true,
          order: 0,
          weight: 60,
          autoAdvance: true,
          options: [
            { value: 'BLOCO', label: 'Bloco de rua', icon: 'Music', color: 'yellow', order: 0 },
            { value: 'FESTA', label: 'Festa privada', icon: 'PartyPopper', color: 'purple', order: 1 },
            { value: 'BAILE', label: 'Baile', icon: 'Music2', color: 'pink', order: 2 },
            { value: 'APP', label: 'App durante carnaval', icon: 'Smartphone', color: 'blue', order: 3 }
          ]
        },
        {
          key: 'tinha_contato_antes',
          label: 'Já tinha contato antes do carnaval?',
          type: 'CARD_SELECT',
          required: true,
          order: 1,
          weight: 60,
          autoAdvance: true,
          options: [
            { value: 'SIM', label: 'Sim', icon: 'CheckCircle2', color: 'green', order: 0 },
            { value: 'NAO', label: 'Não', icon: 'XCircle', color: 'blue', order: 1 }
          ]
        },
        {
          key: 'como_despedida',
          label: 'Como foi a despedida?',
          type: 'CARD_SELECT',
          required: true,
          order: 2,
          weight: 75,
          autoAdvance: true,
          options: [
            { value: 'TROCARAM', label: 'Trocaram contato', icon: 'CheckCircle2', color: 'green', order: 0 },
            { value: 'VAGO', label: 'Ficou vago', icon: 'Minus', color: 'yellow', order: 1 },
            { value: 'NAO_FALARAM', label: 'Nem falaram', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'quem_mensagem_depois',
          label: 'Quem mandou mensagem primeiro depois?',
          type: 'CARD_SELECT',
          required: true,
          order: 3,
          weight: 85,
          autoAdvance: true,
          options: [
            { value: 'VOCE', label: 'Você', icon: 'User', color: 'blue', order: 0 },
            { value: 'ELE_ELA', label: 'Ele(a)', icon: 'UserCheck', color: 'green', order: 1 },
            { value: 'NINGUEM', label: 'Ninguém ainda', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'marcaram_ver_fora',
          label: 'Marcaram de se ver fora do carnaval?',
          type: 'CARD_SELECT',
          required: true,
          order: 4,
          weight: 85,
          autoAdvance: true,
          options: [
            { value: 'SIM_COM_DATA', label: 'Sim, com data', icon: 'Calendar', color: 'green', order: 0 },
            { value: 'SIM_SEM_DATA', label: 'Sim, sem data', icon: 'CalendarDays', color: 'yellow', order: 1 },
            { value: 'NAO', label: 'Não', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'nivel_embriaguez',
          label: 'Qual o nível de embriaguez quando se conheceram?',
          type: 'CARD_SELECT',
          required: false,
          order: 5,
          weight: 55,
          autoAdvance: true,
          options: [
            { value: 'SOBRIOS', label: 'Sóbrios', icon: 'CheckCircle2', color: 'green', order: 0 },
            { value: 'LEVEMENTE', label: 'Levemente', icon: 'Minus', color: 'yellow', order: 1 },
            { value: 'BASTANTE', label: 'Bastante', icon: 'AlertTriangle', color: 'orange', order: 2 }
          ]
        },
        {
          key: 'vibe_mensagens',
          label: 'Qual a vibe das mensagens agora?',
          type: 'CARD_SELECT',
          required: true,
          order: 6,
          weight: 70,
          autoAdvance: true,
          options: [
            { value: 'EMPOLGADO', label: 'Empolgado', icon: 'TrendingUp', color: 'green', order: 0 },
            { value: 'FRIO', label: 'Frio', icon: 'TrendingDown', color: 'yellow', order: 1 },
            { value: 'GHOSTEOU', label: 'Ghosteou', icon: 'XCircle', color: 'red', order: 2 }
          ]
        }
      ]

      for (const q of carnavalQuestions) {
        const { options, ...questionData } = q
        const question = await prisma.formQuestion.create({
          data: {
            ...questionData,
            themeId: carnaval.id,
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
      }

      console.log(`  ✅ Tema criado com ${carnavalQuestions.length} perguntas`)
    } else {
      console.log('  ⚠️  Tema já existe, pulando...')
    }

    // TEMA 2: Primeiro Date
    console.log('\n📅 Tema: Primeiro Date')
    const dateExists = await prisma.formTheme.findUnique({
      where: { name: 'primeiro-date' }
    })

    if (!dateExists) {
      const primeiroDate = await prisma.formTheme.create({
        data: {
          name: 'primeiro-date',
          displayName: 'Primeiro Date',
          description: 'Avalie as chances daquele primeiro encontro',
          icon: 'Calendar',
          color: 'pink',
          active: true,
          seasonal: false,
          order: 2
        }
      })

      const dateQuestions = [
        {
          key: 'quem_propos',
          label: 'Quem propôs o encontro?',
          type: 'CARD_SELECT',
          required: true,
          order: 0,
          weight: 80,
          autoAdvance: true,
          options: [
            { value: 'VOCE', label: 'Você', icon: 'User', color: 'blue', order: 0 },
            { value: 'ELE_ELA', label: 'Ele(a)', icon: 'UserCheck', color: 'green', order: 1 },
            { value: 'NATURAL', label: 'Foi natural', icon: 'Heart', color: 'pink', order: 2 }
          ]
        },
        {
          key: 'encontro_aconteceu',
          label: 'O encontro já aconteceu?',
          type: 'CARD_SELECT',
          required: true,
          order: 1,
          weight: 60,
          autoAdvance: true,
          options: [
            { value: 'SIM', label: 'Sim', icon: 'CheckCircle2', color: 'green', order: 0 },
            { value: 'NAO', label: 'Ainda não', icon: 'Clock', color: 'yellow', order: 1 }
          ]
        },
        {
          key: 'onde_encontro',
          label: 'Onde será/foi o encontro?',
          type: 'CARD_SELECT',
          required: true,
          order: 2,
          weight: 70,
          autoAdvance: true,
          options: [
            { value: 'PUBLICO', label: 'Lugar público', icon: 'MapPin', color: 'green', order: 0 },
            { value: 'CASA_DELE', label: 'Casa dele(a)', icon: 'Home', color: 'orange', order: 1 },
            { value: 'SUA_CASA', label: 'Sua casa', icon: 'Home', color: 'red', order: 2 }
          ]
        },
        {
          key: 'quem_escolheu_local',
          label: 'Quem escolheu o local?',
          type: 'CARD_SELECT',
          required: true,
          order: 3,
          weight: 65,
          autoAdvance: true,
          options: [
            { value: 'VOCE', label: 'Você', icon: 'User', color: 'blue', order: 0 },
            { value: 'ELE_ELA', label: 'Ele(a)', icon: 'UserCheck', color: 'green', order: 1 },
            { value: 'JUNTOS', label: 'Decidiram juntos', icon: 'Users', color: 'purple', order: 2 }
          ]
        },
        {
          key: 'horario_encontro',
          label: 'Qual o horário do encontro?',
          type: 'CARD_SELECT',
          required: true,
          order: 4,
          weight: 60,
          autoAdvance: true,
          options: [
            { value: 'DIA', label: 'Durante o dia', icon: 'Sun', color: 'yellow', order: 0 },
            { value: 'NOITE', label: 'Noite', icon: 'Moon', color: 'blue', order: 1 },
            { value: 'MADRUGADA', label: 'Madrugada', icon: 'CloudMoon', color: 'purple', order: 2 }
          ]
        },
        {
          key: 'tempo_depois_match',
          label: 'Quanto tempo depois do match?',
          type: 'CARD_SELECT',
          required: true,
          order: 5,
          weight: 70,
          autoAdvance: true,
          options: [
            { value: 'MENOS_1_SEMANA', label: 'Menos de 1 semana', icon: 'Zap', color: 'green', order: 0 },
            { value: '1_2_SEMANAS', label: '1-2 semanas', icon: 'Clock', color: 'yellow', order: 1 },
            { value: 'MAIS_2_SEMANAS', label: 'Mais de 2 semanas', icon: 'Calendar', color: 'orange', order: 2 }
          ]
        },
        {
          key: 'ja_remarcou',
          label: 'Já remarcou alguma vez?',
          type: 'CARD_SELECT',
          required: false,
          order: 6,
          weight: 75,
          autoAdvance: true,
          options: [
            { value: 'NAO', label: 'Não', icon: 'CheckCircle2', color: 'green', order: 0 },
            { value: 'SIM_COM_DATA', label: 'Sim, com data nova', icon: 'Calendar', color: 'yellow', order: 1 },
            { value: 'SIM_SEM_DATA', label: 'Sim, sem data nova', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'quem_cancelou',
          label: 'Quem cancelou (se cancelou)?',
          type: 'CARD_SELECT',
          required: false,
          order: 7,
          weight: 75,
          autoAdvance: true,
          options: [
            { value: 'NINGUEM', label: 'Ninguém cancelou', icon: 'CheckCircle2', color: 'green', order: 0 },
            { value: 'VOCE', label: 'Você', icon: 'User', color: 'blue', order: 1 },
            { value: 'ELE_ELA', label: 'Ele(a)', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'papo_pre_date',
          label: 'Como está o papo pré-date?',
          type: 'CARD_SELECT',
          required: true,
          order: 8,
          weight: 80,
          autoAdvance: true,
          options: [
            { value: 'ANIMADO', label: 'Animado', icon: 'TrendingUp', color: 'green', order: 0 },
            { value: 'NORMAL', label: 'Normal', icon: 'Minus', color: 'yellow', order: 1 },
            { value: 'FRIO', label: 'Frio', icon: 'TrendingDown', color: 'red', order: 2 }
          ]
        }
      ]

      for (const q of dateQuestions) {
        const { options, ...questionData } = q
        const question = await prisma.formQuestion.create({
          data: {
            ...questionData,
            themeId: primeiroDate.id,
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
      }

      console.log(`  ✅ Tema criado com ${dateQuestions.length} perguntas`)
    } else {
      console.log('  ⚠️  Tema já existe, pulando...')
    }

    // TEMA 3: Relacionamento Virtual
    console.log('\n📱 Tema: Relacionamento Virtual')
    const virtualExists = await prisma.formTheme.findUnique({
      where: { name: 'relacionamento-virtual' }
    })

    if (!virtualExists) {
      const virtual = await prisma.formTheme.create({
        data: {
          name: 'relacionamento-virtual',
          displayName: 'Relacionamento Virtual',
          description: 'Para matches que ainda são só online',
          icon: 'Smartphone',
          color: 'blue',
          active: true,
          seasonal: false,
          order: 3
        }
      })

      const virtualQuestions = [
        {
          key: 'quanto_tempo_conversam',
          label: 'Há quanto tempo conversam online?',
          type: 'CARD_SELECT',
          required: true,
          order: 0,
          weight: 60,
          autoAdvance: true,
          options: [
            { value: 'MENOS_1_SEMANA', label: 'Menos de 1 semana', icon: 'Clock', color: 'blue', order: 0 },
            { value: '1_4_SEMANAS', label: '1-4 semanas', icon: 'Calendar', color: 'yellow', order: 1 },
            { value: 'MAIS_1_MES', label: 'Mais de 1 mês', icon: 'CalendarCheck', color: 'orange', order: 2 }
          ]
        },
        {
          key: 'moram_perto',
          label: 'Vocês moram perto?',
          type: 'CARD_SELECT',
          required: true,
          order: 1,
          weight: 65,
          autoAdvance: true,
          options: [
            { value: 'MESMA_CIDADE', label: 'Mesma cidade', icon: 'MapPin', color: 'green', order: 0 },
            { value: 'CIDADES_DIFERENTES', label: 'Cidades diferentes', icon: 'Map', color: 'yellow', order: 1 },
            { value: 'PAISES_DIFERENTES', label: 'Países diferentes', icon: 'Globe', color: 'orange', order: 2 }
          ]
        },
        {
          key: 'videochamada',
          label: 'Já fizeram videochamada?',
          type: 'CARD_SELECT',
          required: true,
          order: 2,
          weight: 75,
          autoAdvance: true,
          options: [
            { value: 'SIM_VARIAS', label: 'Sim, várias', icon: 'Video', color: 'green', order: 0 },
            { value: 'APENAS_UMA', label: 'Apenas uma', icon: 'Video', color: 'yellow', order: 1 },
            { value: 'NUNCA', label: 'Nunca', icon: 'VideoOff', color: 'red', order: 2 }
          ]
        },
        {
          key: 'quem_puxa_assunto',
          label: 'Quem puxa assunto normalmente?',
          type: 'CARD_SELECT',
          required: true,
          order: 3,
          weight: 85,
          autoAdvance: true,
          options: [
            { value: 'VOCE', label: 'Você', icon: 'User', color: 'orange', order: 0 },
            { value: 'ELE_ELA', label: 'Ele(a)', icon: 'UserCheck', color: 'green', order: 1 },
            { value: 'EQUILIBRADO', label: 'Equilibrado', icon: 'Users', color: 'blue', order: 2 }
          ]
        },
        {
          key: 'profundidade_conversas',
          label: 'As conversas têm profundidade?',
          type: 'CARD_SELECT',
          required: true,
          order: 4,
          weight: 80,
          autoAdvance: true,
          options: [
            { value: 'MUITO', label: 'Muito', icon: 'Heart', color: 'green', order: 0 },
            { value: 'MAIS_OU_MENOS', label: 'Mais ou menos', icon: 'Minus', color: 'yellow', order: 1 },
            { value: 'SUPERFICIAIS', label: 'Superficiais', icon: 'MessageSquare', color: 'red', order: 2 }
          ]
        },
        {
          key: 'compartilha_rotina',
          label: 'Compartilha a rotina com você?',
          type: 'CARD_SELECT',
          required: true,
          order: 5,
          weight: 75,
          autoAdvance: true,
          options: [
            { value: 'SEMPRE', label: 'Sempre', icon: 'CheckCircle2', color: 'green', order: 0 },
            { value: 'AS_VEZES', label: 'Às vezes', icon: 'Minus', color: 'yellow', order: 1 },
            { value: 'RARAMENTE', label: 'Raramente', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'falou_encontrar',
          label: 'Já falou em se encontrar presencialmente?',
          type: 'CARD_SELECT',
          required: true,
          order: 6,
          weight: 85,
          autoAdvance: true,
          options: [
            { value: 'SIM_PLANOS', label: 'Sim, com planos', icon: 'Calendar', color: 'green', order: 0 },
            { value: 'SIM_VAGO', label: 'Sim, vagamente', icon: 'MessageCircle', color: 'yellow', order: 1 },
            { value: 'NUNCA', label: 'Nunca', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'responde_stories',
          label: 'Responde seus stories/posts?',
          type: 'CARD_SELECT',
          required: false,
          order: 7,
          weight: 70,
          autoAdvance: true,
          options: [
            { value: 'SEMPRE', label: 'Sempre', icon: 'CheckCircle2', color: 'green', order: 0 },
            { value: 'AS_VEZES', label: 'Às vezes', icon: 'Minus', color: 'yellow', order: 1 },
            { value: 'NUNCA', label: 'Nunca', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'conhece_amigos_familia',
          label: 'Você conhece amigos/família dele(a)?',
          type: 'CARD_SELECT',
          required: false,
          order: 8,
          weight: 65,
          autoAdvance: true,
          options: [
            { value: 'SIM_APRESENTOU', label: 'Sim, já apresentou', icon: 'Users', color: 'green', order: 0 },
            { value: 'SO_MENCIONOU', label: 'Só mencionou', icon: 'MessageCircle', color: 'yellow', order: 1 },
            { value: 'NAO', label: 'Não', icon: 'XCircle', color: 'gray', order: 2 }
          ]
        }
      ]

      for (const q of virtualQuestions) {
        const { options, ...questionData } = q
        const question = await prisma.formQuestion.create({
          data: {
            ...questionData,
            themeId: virtual.id,
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
      }

      console.log(`  ✅ Tema criado com ${virtualQuestions.length} perguntas`)
    } else {
      console.log('  ⚠️  Tema já existe, pulando...')
    }

    // TEMA 4: Recomeço
    console.log('\n🌅 Tema: Recomeço Amoroso')
    const recomecoExists = await prisma.formTheme.findUnique({
      where: { name: 'recomeco-amoroso' }
    })

    if (!recomecoExists) {
      const recomeco = await prisma.formTheme.create({
        data: {
          name: 'recomeco-amoroso',
          displayName: 'Recomeço',
          description: 'Para quem saiu de um relacionamento e está conhecendo alguém novo',
          icon: 'Sunrise',
          color: 'orange',
          active: true,
          seasonal: false,
          order: 4
        }
      })

      const recomecoQuestions = [
        {
          key: 'tempo_termino',
          label: 'Há quanto tempo terminou seu último relacionamento?',
          type: 'CARD_SELECT',
          required: true,
          order: 0,
          weight: 70,
          autoAdvance: true,
          options: [
            { value: 'MENOS_3_MESES', label: 'Menos de 3 meses', icon: 'Clock', color: 'red', order: 0 },
            { value: '3_6_MESES', label: '3-6 meses', icon: 'Calendar', color: 'yellow', order: 1 },
            { value: 'MAIS_6_MESES', label: 'Mais de 6 meses', icon: 'CalendarCheck', color: 'green', order: 2 }
          ]
        },
        {
          key: 'estado_emocional',
          label: 'Como você está emocionalmente?',
          type: 'CARD_SELECT',
          required: true,
          order: 1,
          weight: 80,
          autoAdvance: true,
          options: [
            { value: 'PRONTO', label: 'Pronto(a)', icon: 'CheckCircle2', color: 'green', order: 0 },
            { value: 'PROCESSANDO', label: 'Ainda processando', icon: 'Loader', color: 'yellow', order: 1 },
            { value: 'CONFUSO', label: 'Confuso(a)', icon: 'HelpCircle', color: 'orange', order: 2 }
          ]
        },
        {
          key: 'match_sabe_termino',
          label: 'Esse match sabe do seu término recente?',
          type: 'CARD_SELECT',
          required: true,
          order: 2,
          weight: 65,
          autoAdvance: true,
          options: [
            { value: 'SIM', label: 'Sim', icon: 'CheckCircle2', color: 'green', order: 0 },
            { value: 'NAO', label: 'Não', icon: 'XCircle', color: 'red', order: 1 },
            { value: 'PARCIALMENTE', label: 'Parcialmente', icon: 'Minus', color: 'yellow', order: 2 }
          ]
        },
        {
          key: 'compara_com_ex',
          label: 'Você compara esse match com o ex?',
          type: 'CARD_SELECT',
          required: true,
          order: 3,
          weight: 75,
          autoAdvance: true,
          options: [
            { value: 'NUNCA', label: 'Nunca', icon: 'CheckCircle2', color: 'green', order: 0 },
            { value: 'AS_VEZES', label: 'Às vezes', icon: 'Minus', color: 'yellow', order: 1 },
            { value: 'FREQUENTEMENTE', label: 'Frequentemente', icon: 'AlertTriangle', color: 'orange', order: 2 }
          ]
        },
        {
          key: 'objetivo_agora',
          label: 'Qual seu objetivo agora?',
          type: 'CARD_SELECT',
          required: true,
          order: 4,
          weight: 85,
          autoAdvance: true,
          options: [
            { value: 'SO_CURTIR', label: 'Só curtir', icon: 'Sparkles', color: 'purple', order: 0 },
            { value: 'VER_NO_QUE_DA', label: 'Ver no que dá', icon: 'Heart', color: 'pink', order: 1 },
            { value: 'ALGO_SERIO', label: 'Algo sério', icon: 'Heart', color: 'red', order: 2 }
          ]
        },
        {
          key: 'respeita_tempo',
          label: 'Esse match parece respeitar seu tempo?',
          type: 'CARD_SELECT',
          required: true,
          order: 5,
          weight: 85,
          autoAdvance: true,
          options: [
            { value: 'SIM', label: 'Sim', icon: 'CheckCircle2', color: 'green', order: 0 },
            { value: 'MAIS_OU_MENOS', label: 'Mais ou menos', icon: 'Minus', color: 'yellow', order: 1 },
            { value: 'NAO', label: 'Não', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'quem_demonstra_mais',
          label: 'Quem demonstra mais interesse?',
          type: 'CARD_SELECT',
          required: true,
          order: 6,
          weight: 80,
          autoAdvance: true,
          options: [
            { value: 'VOCE', label: 'Você', icon: 'User', color: 'blue', order: 0 },
            { value: 'ELE_ELA', label: 'Ele(a)', icon: 'UserCheck', color: 'green', order: 1 },
            { value: 'EQUILIBRADO', label: 'Equilibrado', icon: 'Users', color: 'purple', order: 2 }
          ]
        },
        {
          key: 'se_sente_pressionado',
          label: 'Você se sente pressionado(a)?',
          type: 'CARD_SELECT',
          required: false,
          order: 7,
          weight: 75,
          autoAdvance: true,
          options: [
            { value: 'NAO', label: 'Não', icon: 'CheckCircle2', color: 'green', order: 0 },
            { value: 'UM_POUCO', label: 'Um pouco', icon: 'Minus', color: 'yellow', order: 1 },
            { value: 'SIM', label: 'Sim', icon: 'AlertTriangle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'amigos_familia_aprovam',
          label: 'Amigos/família aprovam?',
          type: 'CARD_SELECT',
          required: false,
          order: 8,
          weight: 60,
          autoAdvance: true,
          options: [
            { value: 'SIM', label: 'Sim', icon: 'ThumbsUp', color: 'green', order: 0 },
            { value: 'NAO_OPINARAM', label: 'Não opinaram', icon: 'Minus', color: 'gray', order: 1 },
            { value: 'TEM_RESSALVAS', label: 'Têm ressalvas', icon: 'AlertTriangle', color: 'orange', order: 2 }
          ]
        }
      ]

      for (const q of recomecoQuestions) {
        const { options, ...questionData } = q
        const question = await prisma.formQuestion.create({
          data: {
            ...questionData,
            themeId: recomeco.id,
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
      }

      console.log(`  ✅ Tema criado com ${recomecoQuestions.length} perguntas`)
    } else {
      console.log('  ⚠️  Tema já existe, pulando...')
    }

    // TEMA 5: Crush de Trabalho
    console.log('\n💼 Tema: Crush de Trabalho')
    const trabalhoExists = await prisma.formTheme.findUnique({
      where: { name: 'crush-trabalho' }
    })

    if (!trabalhoExists) {
      const trabalho = await prisma.formTheme.create({
        data: {
          name: 'crush-trabalho',
          displayName: 'Crush de Trabalho',
          description: 'Para relacionamentos que começam no ambiente profissional',
          icon: 'Briefcase',
          color: 'slate',
          active: true,
          seasonal: false,
          order: 5
        }
      })

      const trabalhoQuestions = [
        {
          key: 'relacao_profissional',
          label: 'Qual a relação profissional de vocês?',
          type: 'CARD_SELECT',
          required: true,
          order: 0,
          weight: 70,
          autoAdvance: true,
          options: [
            { value: 'MESMO_NIVEL', label: 'Mesmo nível', icon: 'Users', color: 'green', order: 0 },
            { value: 'ELE_SUPERIOR', label: 'Ele(a) é superior', icon: 'TrendingUp', color: 'orange', order: 1 },
            { value: 'VOCE_SUPERIOR', label: 'Você é superior', icon: 'TrendingDown', color: 'orange', order: 2 }
          ]
        },
        {
          key: 'trabalham_mesmo_time',
          label: 'Trabalham no mesmo time?',
          type: 'CARD_SELECT',
          required: true,
          order: 1,
          weight: 65,
          autoAdvance: true,
          options: [
            { value: 'SIM', label: 'Sim', icon: 'Users', color: 'orange', order: 0 },
            { value: 'NAO_SE_VEEM', label: 'Não, mas se veem', icon: 'Eye', color: 'yellow', order: 1 },
            { value: 'RARAMENTE', label: 'Raramente se cruzam', icon: 'Minus', color: 'green', order: 2 }
          ]
        },
        {
          key: 'como_comecou',
          label: 'Como começou a interação?',
          type: 'CARD_SELECT',
          required: true,
          order: 2,
          weight: 70,
          autoAdvance: true,
          options: [
            { value: 'PROFISSIONAL', label: 'Profissional', icon: 'Briefcase', color: 'blue', order: 0 },
            { value: 'FLERTE', label: 'Flerte sutil', icon: 'Heart', color: 'pink', order: 1 },
            { value: 'AMIZADE', label: 'Amizade', icon: 'Users', color: 'purple', order: 2 }
          ]
        },
        {
          key: 'momento_a_sos',
          label: 'Já tiveram momento a sós?',
          type: 'CARD_SELECT',
          required: true,
          order: 3,
          weight: 75,
          autoAdvance: true,
          options: [
            { value: 'SIM_NATURAL', label: 'Sim, natural', icon: 'CheckCircle2', color: 'green', order: 0 },
            { value: 'FORCARAM', label: 'Forçaram situação', icon: 'Zap', color: 'yellow', order: 1 },
            { value: 'NUNCA', label: 'Nunca', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'interesse_explicito',
          label: 'O interesse é explícito ou implícito?',
          type: 'CARD_SELECT',
          required: true,
          order: 4,
          weight: 80,
          autoAdvance: true,
          options: [
            { value: 'EXPLICITO', label: 'Explícito', icon: 'Heart', color: 'red', order: 0 },
            { value: 'IMPLICITO', label: 'Implícito', icon: 'Eye', color: 'yellow', order: 1 },
            { value: 'SO_SEU', label: 'Só da sua parte', icon: 'User', color: 'blue', order: 2 }
          ]
        },
        {
          key: 'conversam_fora',
          label: 'Conversam fora do trabalho?',
          type: 'CARD_SELECT',
          required: true,
          order: 5,
          weight: 85,
          autoAdvance: true,
          options: [
            { value: 'SIM_FREQUENTE', label: 'Sim, frequente', icon: 'MessageCircle', color: 'green', order: 0 },
            { value: 'AS_VEZES', label: 'Às vezes', icon: 'Minus', color: 'yellow', order: 1 },
            { value: 'NUNCA', label: 'Nunca', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'risco_carreira',
          label: 'Há risco para sua carreira?',
          type: 'CARD_SELECT',
          required: true,
          order: 6,
          weight: 90,
          autoAdvance: true,
          options: [
            { value: 'NAO', label: 'Não vejo risco', icon: 'CheckCircle2', color: 'green', order: 0 },
            { value: 'MEDIO', label: 'Médio', icon: 'AlertTriangle', color: 'yellow', order: 1 },
            { value: 'SIM_ALTO', label: 'Sim, alto', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'colegas_sabem',
          label: 'Colegas sabem/desconfiam?',
          type: 'CARD_SELECT',
          required: false,
          order: 7,
          weight: 60,
          autoAdvance: true,
          options: [
            { value: 'SIM', label: 'Sim', icon: 'Eye', color: 'orange', order: 0 },
            { value: 'NAO', label: 'Não', icon: 'EyeOff', color: 'green', order: 1 },
            { value: 'NAO_SEI', label: 'Não sei', icon: 'HelpCircle', color: 'gray', order: 2 }
          ]
        },
        {
          key: 'mudaria_emprego',
          label: 'Você está disposto(a) a mudar de emprego se der certo?',
          type: 'CARD_SELECT',
          required: false,
          order: 8,
          weight: 70,
          autoAdvance: true,
          options: [
            { value: 'SIM', label: 'Sim', icon: 'CheckCircle2', color: 'green', order: 0 },
            { value: 'TALVEZ', label: 'Talvez', icon: 'HelpCircle', color: 'yellow', order: 1 },
            { value: 'NAO', label: 'Não', icon: 'XCircle', color: 'red', order: 2 }
          ]
        }
      ]

      for (const q of trabalhoQuestions) {
        const { options, ...questionData } = q
        const question = await prisma.formQuestion.create({
          data: {
            ...questionData,
            themeId: trabalho.id,
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
      }

      console.log(`  ✅ Tema criado com ${trabalhoQuestions.length} perguntas`)
    } else {
      console.log('  ⚠️  Tema já existe, pulando...')
    }

    // TEMA 6: Ficou na Festa
    console.log('\n🎉 Tema: Ficou na Festa')
    const festaExists = await prisma.formTheme.findUnique({
      where: { name: 'ficou-festa' }
    })

    if (!festaExists) {
      const festa = await prisma.formTheme.create({
        data: {
          name: 'ficou-festa',
          displayName: 'Ficou na Festa',
          description: 'Para avaliar aquele match de uma noite/festa',
          icon: 'PartyPopper',
          color: 'purple',
          active: true,
          seasonal: false,
          order: 6
        }
      })

      const festaQuestions = [
        {
          key: 'tipo_festa',
          label: 'Que tipo de festa?',
          type: 'CARD_SELECT',
          required: true,
          order: 0,
          weight: 55,
          autoAdvance: true,
          options: [
            { value: 'BALADA', label: 'Balada', icon: 'Music', color: 'purple', order: 0 },
            { value: 'ANIVERSARIO', label: 'Aniversário', icon: 'Cake', color: 'pink', order: 1 },
            { value: 'CASAMENTO', label: 'Casamento', icon: 'Heart', color: 'red', order: 2 },
            { value: 'BAR', label: 'Bar', icon: 'Beer', color: 'yellow', order: 3 },
            { value: 'OUTRO', label: 'Outro', icon: 'PartyPopper', color: 'blue', order: 4 }
          ]
        },
        {
          key: 'amigos_comum',
          label: 'Tinha amigos em comum?',
          type: 'CARD_SELECT',
          required: true,
          order: 1,
          weight: 65,
          autoAdvance: true,
          options: [
            { value: 'SIM', label: 'Sim', icon: 'Users', color: 'green', order: 0 },
            { value: 'NAO', label: 'Não', icon: 'UserX', color: 'red', order: 1 },
            { value: 'NAO_SEI', label: 'Não sei', icon: 'HelpCircle', color: 'gray', order: 2 }
          ]
        },
        {
          key: 'quem_chegou',
          label: 'Quem chegou em quem?',
          type: 'CARD_SELECT',
          required: true,
          order: 2,
          weight: 70,
          autoAdvance: true,
          options: [
            { value: 'VOCE', label: 'Você', icon: 'User', color: 'blue', order: 0 },
            { value: 'ELE_ELA', label: 'Ele(a)', icon: 'UserCheck', color: 'green', order: 1 },
            { value: 'MUTUO', label: 'Foi mútuo', icon: 'Heart', color: 'pink', order: 2 }
          ]
        },
        {
          key: 'trocaram_contato',
          label: 'Trocaram contato?',
          type: 'CARD_SELECT',
          required: true,
          order: 3,
          weight: 80,
          autoAdvance: true,
          options: [
            { value: 'SIM_MOMENTO', label: 'Sim, no momento', icon: 'CheckCircle2', color: 'green', order: 0 },
            { value: 'DEPOIS_REDES', label: 'Depois pelas redes', icon: 'Smartphone', color: 'blue', order: 1 },
            { value: 'NAO', label: 'Não', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'quem_mensagem',
          label: 'Quem mandou mensagem depois?',
          type: 'CARD_SELECT',
          required: true,
          order: 4,
          weight: 85,
          autoAdvance: true,
          options: [
            { value: 'VOCE', label: 'Você', icon: 'User', color: 'blue', order: 0 },
            { value: 'ELE_ELA', label: 'Ele(a)', icon: 'UserCheck', color: 'green', order: 1 },
            { value: 'NINGUEM', label: 'Ninguém', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'vibe_ficada',
          label: 'Qual foi a vibe da ficada?',
          type: 'CARD_SELECT',
          required: true,
          order: 5,
          weight: 70,
          autoAdvance: true,
          options: [
            { value: 'INTENSA', label: 'Intensa', icon: 'Flame', color: 'red', order: 0 },
            { value: 'LEVE', label: 'Leve', icon: 'Heart', color: 'pink', order: 1 },
            { value: 'FRIA', label: 'Fria', icon: 'Minus', color: 'blue', order: 2 }
          ]
        },
        {
          key: 'alem_beijo',
          label: 'Rolou algo além de beijo?',
          type: 'CARD_SELECT',
          required: false,
          order: 6,
          weight: 60,
          autoAdvance: true,
          options: [
            { value: 'SIM', label: 'Sim', icon: 'CheckCircle2', color: 'orange', order: 0 },
            { value: 'NAO', label: 'Não', icon: 'XCircle', color: 'blue', order: 1 }
          ]
        },
        {
          key: 'quer_ver_de_novo',
          label: 'Quer ver de novo?',
          type: 'CARD_SELECT',
          required: true,
          order: 7,
          weight: 75,
          autoAdvance: true,
          options: [
            { value: 'MUITO', label: 'Muito', icon: 'Heart', color: 'red', order: 0 },
            { value: 'TALVEZ', label: 'Talvez', icon: 'HelpCircle', color: 'yellow', order: 1 },
            { value: 'NAO', label: 'Não', icon: 'XCircle', color: 'gray', order: 2 }
          ]
        }
      ]

      for (const q of festaQuestions) {
        const { options, ...questionData } = q
        const question = await prisma.formQuestion.create({
          data: {
            ...questionData,
            themeId: festa.id,
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
      }

      console.log(`  ✅ Tema criado com ${festaQuestions.length} perguntas`)
    } else {
      console.log('  ⚠️  Tema já existe, pulando...')
    }

    // TEMA 7: Dia dos Namorados (Sazonal)
    console.log('\n💕 Tema: Dia dos Namorados')
    const namoradosExists = await prisma.formTheme.findUnique({
      where: { name: 'dia-dos-namorados' }
    })

    if (!namoradosExists) {
      const namorados = await prisma.formTheme.create({
        data: {
          name: 'dia-dos-namorados',
          displayName: 'Dia dos Namorados',
          description: 'Para quem está conhecendo alguém próximo ao dia dos namorados',
          icon: 'Heart',
          color: 'red',
          active: true,
          seasonal: true,
          startDate: new Date('2026-06-01'),
          endDate: new Date('2026-06-15'),
          order: 7
        }
      })

      const namoradosQuestions = [
        {
          key: 'tempo_conhecem',
          label: 'Há quanto tempo vocês se conhecem?',
          type: 'CARD_SELECT',
          required: true,
          order: 0,
          weight: 70,
          autoAdvance: true,
          options: [
            { value: 'MENOS_1_MES', label: 'Menos de 1 mês', icon: 'Clock', color: 'orange', order: 0 },
            { value: '1_3_MESES', label: '1-3 meses', icon: 'Calendar', color: 'yellow', order: 1 },
            { value: 'MAIS_3_MESES', label: 'Mais de 3 meses', icon: 'CalendarCheck', color: 'green', order: 2 }
          ]
        },
        {
          key: 'expectativa_data',
          label: 'Você espera que ele(a) faça algo especial?',
          type: 'CARD_SELECT',
          required: true,
          order: 1,
          weight: 75,
          autoAdvance: true,
          options: [
            { value: 'SIM_MUITO', label: 'Sim, muito', icon: 'Heart', color: 'red', order: 0 },
            { value: 'UM_POUCO', label: 'Um pouco', icon: 'Heart', color: 'pink', order: 1 },
            { value: 'NAO', label: 'Não espero nada', icon: 'Minus', color: 'gray', order: 2 }
          ]
        },
        {
          key: 'ja_falaram_data',
          label: 'Vocês já falaram sobre a data?',
          type: 'CARD_SELECT',
          required: true,
          order: 2,
          weight: 80,
          autoAdvance: true,
          options: [
            { value: 'SIM_PLANOS', label: 'Sim, com planos', icon: 'Calendar', color: 'green', order: 0 },
            { value: 'COMENTARAM', label: 'Só comentaram', icon: 'MessageCircle', color: 'yellow', order: 1 },
            { value: 'NADA', label: 'Nada ainda', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'quem_trouxe_assunto',
          label: 'Quem trouxe o assunto da data?',
          type: 'CARD_SELECT',
          required: true,
          order: 3,
          weight: 70,
          autoAdvance: true,
          options: [
            { value: 'VOCE', label: 'Você', icon: 'User', color: 'blue', order: 0 },
            { value: 'ELE_ELA', label: 'Ele(a)', icon: 'UserCheck', color: 'green', order: 1 },
            { value: 'NINGUEM', label: 'Ninguém', icon: 'XCircle', color: 'gray', order: 2 }
          ]
        },
        {
          key: 'definicao_relacao',
          label: 'Vocês definiram o que são?',
          type: 'CARD_SELECT',
          required: true,
          order: 4,
          weight: 85,
          autoAdvance: true,
          options: [
            { value: 'SIM_NAMORANDO', label: 'Sim, namorando', icon: 'Heart', color: 'red', order: 0 },
            { value: 'FICANDO', label: 'Só ficando', icon: 'Heart', color: 'pink', order: 1 },
            { value: 'INDEFINIDO', label: 'Indefinido', icon: 'HelpCircle', color: 'yellow', order: 2 }
          ]
        },
        {
          key: 'presente_expectativa',
          label: 'Você vai dar presente?',
          type: 'CARD_SELECT',
          required: false,
          order: 5,
          weight: 60,
          autoAdvance: true,
          options: [
            { value: 'SIM', label: 'Sim', icon: 'Gift', color: 'green', order: 0 },
            { value: 'TALVEZ', label: 'Talvez', icon: 'HelpCircle', color: 'yellow', order: 1 },
            { value: 'NAO', label: 'Não', icon: 'XCircle', color: 'gray', order: 2 }
          ]
        },
        {
          key: 'pressao_data',
          label: 'Você se sente pressionado(a) pela data?',
          type: 'CARD_SELECT',
          required: false,
          order: 6,
          weight: 65,
          autoAdvance: true,
          options: [
            { value: 'NAO', label: 'Não', icon: 'CheckCircle2', color: 'green', order: 0 },
            { value: 'UM_POUCO', label: 'Um pouco', icon: 'Minus', color: 'yellow', order: 1 },
            { value: 'SIM', label: 'Sim', icon: 'AlertTriangle', color: 'red', order: 2 }
          ]
        }
      ]

      for (const q of namoradosQuestions) {
        const { options, ...questionData } = q
        const question = await prisma.formQuestion.create({
          data: {
            ...questionData,
            themeId: namorados.id,
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
      }

      console.log(`  ✅ Tema criado com ${namoradosQuestions.length} perguntas`)
    } else {
      console.log('  ⚠️  Tema já existe, pulando...')
    }

    // TEMA 8: Festas Juninas (Sazonal)
    console.log('\n🌽 Tema: Festas Juninas')
    const juninasExists = await prisma.formTheme.findUnique({
      where: { name: 'festas-juninas' }
    })

    if (!juninasExists) {
      const juninas = await prisma.formTheme.create({
        data: {
          name: 'festas-juninas',
          displayName: 'Festas Juninas',
          description: 'Match que conheceu em festa junina/arraiá',
          icon: 'Flame',
          color: 'orange',
          active: true,
          seasonal: true,
          startDate: new Date('2026-06-01'),
          endDate: new Date('2026-07-31'),
          order: 8
        }
      })

      const juninasQuestions = [
        {
          key: 'onde_conheceu',
          label: 'Onde vocês se conheceram?',
          type: 'CARD_SELECT',
          required: true,
          order: 0,
          weight: 60,
          autoAdvance: true,
          options: [
            { value: 'ARRAIA', label: 'Arraiá/Quadrilha', icon: 'Music', color: 'orange', order: 0 },
            { value: 'FESTA_PARTICULAR', label: 'Festa particular', icon: 'Home', color: 'yellow', order: 1 },
            { value: 'FOGUEIRA', label: 'Fogueira/Rua', icon: 'Flame', color: 'red', order: 2 },
            { value: 'BAR_TEMATICO', label: 'Bar temático', icon: 'Beer', color: 'purple', order: 3 }
          ]
        },
        {
          key: 'dancaram_juntos',
          label: 'Vocês dançaram juntos?',
          type: 'CARD_SELECT',
          required: true,
          order: 1,
          weight: 70,
          autoAdvance: true,
          options: [
            { value: 'SIM_MUITO', label: 'Sim, muito', icon: 'Music', color: 'green', order: 0 },
            { value: 'UM_POUCO', label: 'Um pouco', icon: 'Music2', color: 'yellow', order: 1 },
            { value: 'NAO', label: 'Não', icon: 'XCircle', color: 'gray', order: 2 }
          ]
        },
        {
          key: 'tinha_conhecido_antes',
          label: 'Já tinha visto essa pessoa antes?',
          type: 'CARD_SELECT',
          required: true,
          order: 2,
          weight: 65,
          autoAdvance: true,
          options: [
            { value: 'SIM', label: 'Sim', icon: 'CheckCircle2', color: 'yellow', order: 0 },
            { value: 'NAO', label: 'Não', icon: 'XCircle', color: 'blue', order: 1 }
          ]
        },
        {
          key: 'como_despedida',
          label: 'Como foi a despedida?',
          type: 'CARD_SELECT',
          required: true,
          order: 3,
          weight: 75,
          autoAdvance: true,
          options: [
            { value: 'TROCARAM_CONTATO', label: 'Trocaram contato', icon: 'Smartphone', color: 'green', order: 0 },
            { value: 'FICOU_VAGO', label: 'Ficou vago', icon: 'Minus', color: 'yellow', order: 1 },
            { value: 'NAO_FALARAM', label: 'Nem falaram nisso', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'quem_mensagem_depois',
          label: 'Quem mandou mensagem depois?',
          type: 'CARD_SELECT',
          required: true,
          order: 4,
          weight: 85,
          autoAdvance: true,
          options: [
            { value: 'VOCE', label: 'Você', icon: 'User', color: 'blue', order: 0 },
            { value: 'ELE_ELA', label: 'Ele(a)', icon: 'UserCheck', color: 'green', order: 1 },
            { value: 'NINGUEM', label: 'Ninguém ainda', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'vibe_conversa',
          label: 'Qual a vibe da conversa agora?',
          type: 'CARD_SELECT',
          required: true,
          order: 5,
          weight: 80,
          autoAdvance: true,
          options: [
            { value: 'EMPOLGADA', label: 'Empolgada', icon: 'TrendingUp', color: 'green', order: 0 },
            { value: 'NORMAL', label: 'Normal', icon: 'Minus', color: 'yellow', order: 1 },
            { value: 'FRIA', label: 'Fria', icon: 'TrendingDown', color: 'blue', order: 2 }
          ]
        },
        {
          key: 'marcaram_encontro',
          label: 'Já marcaram de se ver de novo?',
          type: 'CARD_SELECT',
          required: false,
          order: 6,
          weight: 85,
          autoAdvance: true,
          options: [
            { value: 'SIM_COM_DATA', label: 'Sim, com data', icon: 'Calendar', color: 'green', order: 0 },
            { value: 'SIM_SEM_DATA', label: 'Sim, sem data', icon: 'CalendarDays', color: 'yellow', order: 1 },
            { value: 'NAO', label: 'Não', icon: 'XCircle', color: 'red', order: 2 }
          ]
        }
      ]

      for (const q of juninasQuestions) {
        const { options, ...questionData } = q
        const question = await prisma.formQuestion.create({
          data: {
            ...questionData,
            themeId: juninas.id,
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
      }

      console.log(`  ✅ Tema criado com ${juninasQuestions.length} perguntas`)
    } else {
      console.log('  ⚠️  Tema já existe, pulando...')
    }

    // TEMA 9: Verão na Praia (Sazonal)
    console.log('\n🏖️ Tema: Verão na Praia')
    const veraoExists = await prisma.formTheme.findUnique({
      where: { name: 'verao-praia' }
    })

    if (!veraoExists) {
      const verao = await prisma.formTheme.create({
        data: {
          name: 'verao-praia',
          displayName: 'Verão na Praia',
          description: 'Match de férias/praia/viagem',
          icon: 'Palmtree',
          color: 'cyan',
          active: true,
          seasonal: true,
          startDate: new Date('2025-12-01'),
          endDate: new Date('2026-02-28'),
          order: 9
        }
      })

      const veraoQuestions = [
        {
          key: 'onde_conheceu',
          label: 'Onde vocês se conheceram?',
          type: 'CARD_SELECT',
          required: true,
          order: 0,
          weight: 60,
          autoAdvance: true,
          options: [
            { value: 'PRAIA', label: 'Na praia', icon: 'Waves', color: 'blue', order: 0 },
            { value: 'PISCINA_RESORT', label: 'Piscina/Resort', icon: 'Palmtree', color: 'green', order: 1 },
            { value: 'BALADA_PRAIA', label: 'Balada de praia', icon: 'Music', color: 'purple', order: 2 },
            { value: 'HOSTEL_HOTEL', label: 'Hostel/Hotel', icon: 'Hotel', color: 'orange', order: 3 }
          ]
        },
        {
          key: 'tipo_viagem',
          label: 'Que tipo de viagem?',
          type: 'CARD_SELECT',
          required: true,
          order: 1,
          weight: 65,
          autoAdvance: true,
          options: [
            { value: 'SOZINHO', label: 'Viajando sozinho(a)', icon: 'User', color: 'blue', order: 0 },
            { value: 'COM_AMIGOS', label: 'Com amigos', icon: 'Users', color: 'green', order: 1 },
            { value: 'LOCAL', label: 'Você é local', icon: 'MapPin', color: 'yellow', order: 2 }
          ]
        },
        {
          key: 'match_local_turista',
          label: 'Esse match é:',
          type: 'CARD_SELECT',
          required: true,
          order: 2,
          weight: 70,
          autoAdvance: true,
          options: [
            { value: 'TURISTA', label: 'Turista', icon: 'Plane', color: 'blue', order: 0 },
            { value: 'LOCAL', label: 'Local', icon: 'Home', color: 'green', order: 1 },
            { value: 'NAO_SEI', label: 'Não sei', icon: 'HelpCircle', color: 'gray', order: 2 }
          ]
        },
        {
          key: 'quanto_tempo_lugar',
          label: 'Quanto tempo você fica no lugar?',
          type: 'CARD_SELECT',
          required: true,
          order: 3,
          weight: 80,
          autoAdvance: true,
          options: [
            { value: 'MENOS_1_SEMANA', label: 'Menos de 1 semana', icon: 'Clock', color: 'red', order: 0 },
            { value: '1_2_SEMANAS', label: '1-2 semanas', icon: 'Calendar', color: 'yellow', order: 1 },
            { value: 'MAIS_2_SEMANAS', label: 'Mais de 2 semanas', icon: 'CalendarCheck', color: 'green', order: 2 },
            { value: 'MORO_AQUI', label: 'Moro aqui', icon: 'Home', color: 'blue', order: 3 }
          ]
        },
        {
          key: 'distancia_casas',
          label: 'Onde vocês moram?',
          type: 'CARD_SELECT',
          required: true,
          order: 4,
          weight: 85,
          autoAdvance: true,
          options: [
            { value: 'MESMA_CIDADE', label: 'Mesma cidade', icon: 'MapPin', color: 'green', order: 0 },
            { value: 'CIDADES_PROXIMAS', label: 'Cidades próximas', icon: 'Map', color: 'yellow', order: 1 },
            { value: 'MUITO_LONGE', label: 'Muito longe', icon: 'Globe', color: 'red', order: 2 }
          ]
        },
        {
          key: 'verao_conversa',
          label: 'Como está a comunicação?',
          type: 'CARD_SELECT',
          required: true,
          order: 5,
          weight: 80,
          autoAdvance: true,
          options: [
            { value: 'CONSTANTE', label: 'Constante', icon: 'MessageCircle', color: 'green', order: 0 },
            { value: 'CASUAL', label: 'Casual', icon: 'Minus', color: 'yellow', order: 1 },
            { value: 'RARA', label: 'Rara', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'planos_pos_ferias',
          label: 'Falaram em se ver depois das férias?',
          type: 'CARD_SELECT',
          required: true,
          order: 6,
          weight: 90,
          autoAdvance: true,
          options: [
            { value: 'SIM_PLANOS', label: 'Sim, com planos', icon: 'Calendar', color: 'green', order: 0 },
            { value: 'SIM_VAGO', label: 'Sim, vagamente', icon: 'MessageCircle', color: 'yellow', order: 1 },
            { value: 'NAO', label: 'Não', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'objetivo_match',
          label: 'O que você busca com esse match?',
          type: 'CARD_SELECT',
          required: false,
          order: 7,
          weight: 75,
          autoAdvance: true,
          options: [
            { value: 'CURTIR_FERIAS', label: 'Só curtir as férias', icon: 'Sparkles', color: 'purple', order: 0 },
            { value: 'VER_NO_QUE_DA', label: 'Ver no que dá', icon: 'Heart', color: 'pink', order: 1 },
            { value: 'ALGO_SERIO', label: 'Algo sério', icon: 'Heart', color: 'red', order: 2 }
          ]
        }
      ]

      for (const q of veraoQuestions) {
        const { options, ...questionData } = q
        const question = await prisma.formQuestion.create({
          data: {
            ...questionData,
            themeId: verao.id,
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
      }

      console.log(`  ✅ Tema criado com ${veraoQuestions.length} perguntas`)
    } else {
      console.log('  ⚠️  Tema já existe, pulando...')
    }

    // TEMA 10: Reveillon (Sazonal)
    console.log('\n🎆 Tema: Reveillon')
    const reveillonExists = await prisma.formTheme.findUnique({
      where: { name: 'reveillon' }
    })

    if (!reveillonExists) {
      const reveillon = await prisma.formTheme.create({
        data: {
          name: 'reveillon',
          displayName: 'Reveillon',
          description: 'Match de fim de ano',
          icon: 'Sparkles',
          color: 'yellow',
          active: true,
          seasonal: true,
          startDate: new Date('2025-12-15'),
          endDate: new Date('2026-01-15'),
          order: 10
        }
      })

      const reveillonQuestions = [
        {
          key: 'onde_conheceu',
          label: 'Onde vocês se conheceram?',
          type: 'CARD_SELECT',
          required: true,
          order: 0,
          weight: 60,
          autoAdvance: true,
          options: [
            { value: 'FESTA_REVEILLON', label: 'Festa de Reveillon', icon: 'PartyPopper', color: 'yellow', order: 0 },
            { value: 'PRAIA', label: 'Praia/Orla', icon: 'Waves', color: 'blue', order: 1 },
            { value: 'VIRADA_RUA', label: 'Virada na rua', icon: 'Music', color: 'purple', order: 2 },
            { value: 'APP_FIM_ANO', label: 'App no fim de ano', icon: 'Smartphone', color: 'pink', order: 3 }
          ]
        },
        {
          key: 'beijo_meia_noite',
          label: 'Rolou beijo na virada?',
          type: 'CARD_SELECT',
          required: true,
          order: 1,
          weight: 75,
          autoAdvance: true,
          options: [
            { value: 'SIM', label: 'Sim', icon: 'Heart', color: 'red', order: 0 },
            { value: 'NAO', label: 'Não', icon: 'XCircle', color: 'blue', order: 1 }
          ]
        },
        {
          key: 'tinha_conhecido_antes',
          label: 'Já conhecia essa pessoa antes?',
          type: 'CARD_SELECT',
          required: true,
          order: 2,
          weight: 65,
          autoAdvance: true,
          options: [
            { value: 'SIM', label: 'Sim', icon: 'CheckCircle2', color: 'yellow', order: 0 },
            { value: 'NAO', label: 'Não', icon: 'XCircle', color: 'blue', order: 1 }
          ]
        },
        {
          key: 'como_despedida',
          label: 'Como foi a despedida?',
          type: 'CARD_SELECT',
          required: true,
          order: 3,
          weight: 80,
          autoAdvance: true,
          options: [
            { value: 'TROCARAM_CONTATO', label: 'Trocaram contato', icon: 'Smartphone', color: 'green', order: 0 },
            { value: 'FICOU_VAGO', label: 'Ficou vago', icon: 'Minus', color: 'yellow', order: 1 },
            { value: 'NAO_FALARAM', label: 'Nem falaram', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'quem_mensagem',
          label: 'Quem mandou mensagem depois?',
          type: 'CARD_SELECT',
          required: true,
          order: 4,
          weight: 85,
          autoAdvance: true,
          options: [
            { value: 'VOCE', label: 'Você', icon: 'User', color: 'blue', order: 0 },
            { value: 'ELE_ELA', label: 'Ele(a)', icon: 'UserCheck', color: 'green', order: 1 },
            { value: 'NINGUEM', label: 'Ninguém ainda', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'falaram_ano_novo',
          label: 'Falaram sobre planos para o ano novo?',
          type: 'CARD_SELECT',
          required: true,
          order: 5,
          weight: 70,
          autoAdvance: true,
          options: [
            { value: 'SIM_INCLUIU_VOCE', label: 'Sim, incluiu você', icon: 'Heart', color: 'green', order: 0 },
            { value: 'SIM_SO_CONTOU', label: 'Sim, só contou', icon: 'MessageCircle', color: 'yellow', order: 1 },
            { value: 'NAO', label: 'Não', icon: 'XCircle', color: 'gray', order: 2 }
          ]
        },
        {
          key: 'vibe_conversa',
          label: 'Qual a vibe da conversa agora?',
          type: 'CARD_SELECT',
          required: true,
          order: 6,
          weight: 80,
          autoAdvance: true,
          options: [
            { value: 'EMPOLGADA', label: 'Empolgada', icon: 'TrendingUp', color: 'green', order: 0 },
            { value: 'NORMAL', label: 'Normal', icon: 'Minus', color: 'yellow', order: 1 },
            { value: 'FRIA', label: 'Fria', icon: 'TrendingDown', color: 'blue', order: 2 }
          ]
        },
        {
          key: 'marcaram_ver',
          label: 'Já marcaram de se ver?',
          type: 'CARD_SELECT',
          required: false,
          order: 7,
          weight: 85,
          autoAdvance: true,
          options: [
            { value: 'SIM_COM_DATA', label: 'Sim, com data', icon: 'Calendar', color: 'green', order: 0 },
            { value: 'SIM_SEM_DATA', label: 'Sim, sem data', icon: 'CalendarDays', color: 'yellow', order: 1 },
            { value: 'NAO', label: 'Não', icon: 'XCircle', color: 'red', order: 2 }
          ]
        }
      ]

      for (const q of reveillonQuestions) {
        const { options, ...questionData } = q
        const question = await prisma.formQuestion.create({
          data: {
            ...questionData,
            themeId: reveillon.id,
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
      }

      console.log(`  ✅ Tema criado com ${reveillonQuestions.length} perguntas`)
    } else {
      console.log('  ⚠️  Tema já existe, pulando...')
    }

    // TEMA 11: Ex que Voltou (Permanente)
    console.log('\n🔄 Tema: Ex que Voltou')
    const exVoltouExists = await prisma.formTheme.findUnique({
      where: { name: 'ex-voltou' }
    })

    if (!exVoltouExists) {
      const exVoltou = await prisma.formTheme.create({
        data: {
          name: 'ex-voltou',
          displayName: 'Ex que Voltou',
          description: 'Para quando um ex volta a dar sinais',
          icon: 'RefreshCw',
          color: 'blue',
          active: true,
          seasonal: false,
          order: 11
        }
      })

      const exVoltouQuestions = [
        {
          key: 'tempo_termino',
          label: 'Há quanto tempo terminaram?',
          type: 'CARD_SELECT',
          required: true,
          order: 0,
          weight: 75,
          autoAdvance: true,
          options: [
            { value: 'MENOS_1_MES', label: 'Menos de 1 mês', icon: 'Clock', color: 'red', order: 0 },
            { value: '1_6_MESES', label: '1-6 meses', icon: 'Calendar', color: 'yellow', order: 1 },
            { value: 'MAIS_6_MESES', label: 'Mais de 6 meses', icon: 'CalendarCheck', color: 'green', order: 2 }
          ]
        },
        {
          key: 'quem_terminou',
          label: 'Quem terminou na época?',
          type: 'CARD_SELECT',
          required: true,
          order: 1,
          weight: 80,
          autoAdvance: true,
          options: [
            { value: 'VOCE', label: 'Você', icon: 'User', color: 'blue', order: 0 },
            { value: 'ELE_ELA', label: 'Ele(a)', icon: 'UserX', color: 'orange', order: 1 },
            { value: 'MUTUO', label: 'Mútuo', icon: 'Users', color: 'gray', order: 2 }
          ]
        },
        {
          key: 'motivo_termino',
          label: 'Qual foi o motivo do término?',
          type: 'CARD_SELECT',
          required: true,
          order: 2,
          weight: 85,
          autoAdvance: true,
          options: [
            { value: 'TRAICAO', label: 'Traição', icon: 'XCircle', color: 'red', order: 0 },
            { value: 'DISTANCIA', label: 'Distância', icon: 'MapPin', color: 'blue', order: 1 },
            { value: 'BRIGAS', label: 'Brigas constantes', icon: 'AlertTriangle', color: 'orange', order: 2 },
            { value: 'FALTA_SENTIMENTO', label: 'Falta de sentimento', icon: 'Heart', color: 'gray', order: 3 },
            { value: 'OUTRO', label: 'Outro motivo', icon: 'HelpCircle', color: 'purple', order: 4 }
          ]
        },
        {
          key: 'como_voltou',
          label: 'Como ele(a) voltou a dar sinais?',
          type: 'CARD_SELECT',
          required: true,
          order: 3,
          weight: 80,
          autoAdvance: true,
          options: [
            { value: 'MENSAGEM_DIRETA', label: 'Mensagem direta', icon: 'MessageCircle', color: 'green', order: 0 },
            { value: 'CURTIU_STORIES', label: 'Curtindo stories', icon: 'Heart', color: 'pink', order: 1 },
            { value: 'AMIGOS_COMUM', label: 'Via amigos em comum', icon: 'Users', color: 'yellow', order: 2 },
            { value: 'LIGOU', label: 'Ligou', icon: 'Phone', color: 'blue', order: 3 }
          ]
        },
        {
          key: 'oque_disse',
          label: 'O que ele(a) disse?',
          type: 'CARD_SELECT',
          required: true,
          order: 4,
          weight: 85,
          autoAdvance: true,
          options: [
            { value: 'QUER_VOLTAR', label: 'Quer voltar', icon: 'Heart', color: 'red', order: 0 },
            { value: 'SAUDADE', label: 'Disse ter saudade', icon: 'Heart', color: 'pink', order: 1 },
            { value: 'CONVERSAR', label: 'Só quer conversar', icon: 'MessageCircle', color: 'blue', order: 2 },
            { value: 'NADA_CLARO', label: 'Nada muito claro', icon: 'HelpCircle', color: 'gray', order: 3 }
          ]
        },
        {
          key: 'voce_sentindo',
          label: 'Como você está se sentindo?',
          type: 'CARD_SELECT',
          required: true,
          order: 5,
          weight: 75,
          autoAdvance: true,
          options: [
            { value: 'QUERO_VOLTAR', label: 'Quero voltar', icon: 'Heart', color: 'red', order: 0 },
            { value: 'CONFUSO', label: 'Confuso(a)', icon: 'HelpCircle', color: 'yellow', order: 1 },
            { value: 'NAO_QUERO', label: 'Não quero voltar', icon: 'XCircle', color: 'gray', order: 2 }
          ]
        },
        {
          key: 'mudou_algo',
          label: 'Ele(a) mudou algo que causou o término?',
          type: 'CARD_SELECT',
          required: true,
          order: 6,
          weight: 90,
          autoAdvance: true,
          options: [
            { value: 'SIM_VISIVELMENTE', label: 'Sim, visivelmente', icon: 'CheckCircle2', color: 'green', order: 0 },
            { value: 'DIZ_QUE_SIM', label: 'Diz que sim', icon: 'MessageCircle', color: 'yellow', order: 1 },
            { value: 'NAO', label: 'Não', icon: 'XCircle', color: 'red', order: 2 },
            { value: 'NAO_SEI', label: 'Não sei ainda', icon: 'HelpCircle', color: 'gray', order: 3 }
          ]
        },
        {
          key: 'amigos_familia_opiniao',
          label: 'Amigos/família aprovam?',
          type: 'CARD_SELECT',
          required: false,
          order: 7,
          weight: 65,
          autoAdvance: true,
          options: [
            { value: 'SIM', label: 'Sim', icon: 'ThumbsUp', color: 'green', order: 0 },
            { value: 'NAO', label: 'Não', icon: 'ThumbsDown', color: 'red', order: 1 },
            { value: 'NAO_SABEM', label: 'Não sabem', icon: 'EyeOff', color: 'gray', order: 2 }
          ]
        },
        {
          key: 'ja_conversaram_motivo',
          label: 'Já conversaram sobre o motivo do término?',
          type: 'CARD_SELECT',
          required: false,
          order: 8,
          weight: 80,
          autoAdvance: true,
          options: [
            { value: 'SIM_PROFUNDO', label: 'Sim, profundamente', icon: 'MessageCircle', color: 'green', order: 0 },
            { value: 'SUPERFICIALMENTE', label: 'Superficialmente', icon: 'Minus', color: 'yellow', order: 1 },
            { value: 'NAO', label: 'Não', icon: 'XCircle', color: 'red', order: 2 }
          ]
        }
      ]

      for (const q of exVoltouQuestions) {
        const { options, ...questionData } = q
        const question = await prisma.formQuestion.create({
          data: {
            ...questionData,
            themeId: exVoltou.id,
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
      }

      console.log(`  ✅ Tema criado com ${exVoltouQuestions.length} perguntas`)
    } else {
      console.log('  ⚠️  Tema já existe, pulando...')
    }

    // TEMA 12: Match de App (Permanente)
    console.log('\n📱 Tema: Match de App')
    const matchAppExists = await prisma.formTheme.findUnique({
      where: { name: 'match-app' }
    })

    if (!matchAppExists) {
      const matchApp = await prisma.formTheme.create({
        data: {
          name: 'match-app',
          displayName: 'Match de App',
          description: 'Específico para Tinder, Bumble, etc.',
          icon: 'Smartphone',
          color: 'pink',
          active: true,
          seasonal: false,
          order: 12
        }
      })

      const matchAppQuestions = [
        {
          key: 'qual_app',
          label: 'Qual app vocês deram match?',
          type: 'CARD_SELECT',
          required: true,
          order: 0,
          weight: 55,
          autoAdvance: true,
          options: [
            { value: 'TINDER', label: 'Tinder', icon: 'Flame', color: 'red', order: 0 },
            { value: 'BUMBLE', label: 'Bumble', icon: 'Heart', color: 'yellow', order: 1 },
            { value: 'HINGE', label: 'Hinge', icon: 'Heart', color: 'purple', order: 2 },
            { value: 'INSTAGRAM', label: 'Instagram', icon: 'Instagram', color: 'pink', order: 3 },
            { value: 'OUTRO', label: 'Outro', icon: 'Smartphone', color: 'blue', order: 4 }
          ]
        },
        {
          key: 'ha_quanto_tempo',
          label: 'Há quanto tempo deram match?',
          type: 'CARD_SELECT',
          required: true,
          order: 1,
          weight: 65,
          autoAdvance: true,
          options: [
            { value: 'MENOS_1_SEMANA', label: 'Menos de 1 semana', icon: 'Clock', color: 'blue', order: 0 },
            { value: '1_4_SEMANAS', label: '1-4 semanas', icon: 'Calendar', color: 'yellow', order: 1 },
            { value: 'MAIS_1_MES', label: 'Mais de 1 mês', icon: 'CalendarCheck', color: 'orange', order: 2 }
          ]
        },
        {
          key: 'quem_primeira_mensagem',
          label: 'Quem mandou a primeira mensagem?',
          type: 'CARD_SELECT',
          required: true,
          order: 2,
          weight: 75,
          autoAdvance: true,
          options: [
            { value: 'VOCE', label: 'Você', icon: 'User', color: 'blue', order: 0 },
            { value: 'ELE_ELA', label: 'Ele(a)', icon: 'UserCheck', color: 'green', order: 1 }
          ]
        },
        {
          key: 'qualidade_conversa',
          label: 'Como é a conversa no app?',
          type: 'CARD_SELECT',
          required: true,
          order: 3,
          weight: 80,
          autoAdvance: true,
          options: [
            { value: 'ENGAJADA', label: 'Engajada', icon: 'TrendingUp', color: 'green', order: 0 },
            { value: 'NORMAL', label: 'Normal', icon: 'Minus', color: 'yellow', order: 1 },
            { value: 'MONOSSILABICA', label: 'Monossilábica', icon: 'TrendingDown', color: 'red', order: 2 }
          ]
        },
        {
          key: 'perfil_completo',
          label: 'O perfil dele(a) é completo?',
          type: 'CARD_SELECT',
          required: true,
          order: 4,
          weight: 60,
          autoAdvance: true,
          options: [
            { value: 'SIM_BIO_FOTOS', label: 'Sim, bio e fotos', icon: 'CheckCircle2', color: 'green', order: 0 },
            { value: 'SO_FOTOS', label: 'Só fotos', icon: 'Image', color: 'yellow', order: 1 },
            { value: 'VAZIO', label: 'Bem vazio', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'fotos_parecem',
          label: 'As fotos parecem:',
          type: 'CARD_SELECT',
          required: true,
          order: 5,
          weight: 65,
          autoAdvance: true,
          options: [
            { value: 'RECENTES_NATURAIS', label: 'Recentes e naturais', icon: 'CheckCircle2', color: 'green', order: 0 },
            { value: 'ANTIGAS_EDITADAS', label: 'Antigas ou editadas', icon: 'AlertTriangle', color: 'yellow', order: 1 },
            { value: 'SUSPEITAS', label: 'Suspeitas', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'trocaram_rede_social',
          label: 'Já trocaram rede social/número?',
          type: 'CARD_SELECT',
          required: true,
          order: 6,
          weight: 85,
          autoAdvance: true,
          options: [
            { value: 'SIM_AMBOS', label: 'Sim, os dois', icon: 'CheckCircle2', color: 'green', order: 0 },
            { value: 'SIM_REDE', label: 'Só Instagram', icon: 'Instagram', color: 'pink', order: 1 },
            { value: 'NAO', label: 'Ainda não', icon: 'XCircle', color: 'gray', order: 2 }
          ]
        },
        {
          key: 'falaram_encontrar',
          label: 'Já falaram em se encontrar?',
          type: 'CARD_SELECT',
          required: true,
          order: 7,
          weight: 90,
          autoAdvance: true,
          options: [
            { value: 'SIM_MARCADO', label: 'Sim, já marcaram', icon: 'Calendar', color: 'green', order: 0 },
            { value: 'SIM_VAGO', label: 'Sim, vagamente', icon: 'MessageCircle', color: 'yellow', order: 1 },
            { value: 'NAO', label: 'Não', icon: 'XCircle', color: 'red', order: 2 }
          ]
        },
        {
          key: 'red_flags_perfil',
          label: 'Notou alguma red flag no perfil?',
          type: 'CARD_SELECT',
          required: false,
          order: 8,
          weight: 70,
          autoAdvance: true,
          options: [
            { value: 'NAO', label: 'Não', icon: 'CheckCircle2', color: 'green', order: 0 },
            { value: 'ALGUMAS', label: 'Algumas coisas', icon: 'AlertTriangle', color: 'yellow', order: 1 },
            { value: 'SIM', label: 'Sim, várias', icon: 'XCircle', color: 'red', order: 2 }
          ]
        }
      ]

      for (const q of matchAppQuestions) {
        const { options, ...questionData } = q
        const question = await prisma.formQuestion.create({
          data: {
            ...questionData,
            themeId: matchApp.id,
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
      }

      console.log(`  ✅ Tema criado com ${matchAppQuestions.length} perguntas`)
    } else {
      console.log('  ⚠️  Tema já existe, pulando...')
    }

    console.log('\n✨ Script concluído com sucesso!')
    console.log('\n📊 Resumo:')
    console.log('   - Pergunta de gênero migrada para pergunta fixa (BEFORE)')
    console.log('   - 12 temas criados')
    console.log('   - 5 temas sazonais (Carnaval, Namorados, Juninas, Verão, Reveillon)')
    console.log('   - 7 temas permanentes')
    console.log('   - Total de ~100 perguntas')
    console.log('\n💡 Próximos passos:')
    console.log('   - Acesse /admin para gerenciar os temas')
    console.log('   - Os usuários verão os temas em /dashboard/new')

  } catch (error) {
    console.error('\n❌ Erro ao criar temas:', error)
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
