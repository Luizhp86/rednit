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
          endDate: new Date('2026-02-28'),
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

    console.log('\n✨ Script concluído com sucesso!')
    console.log('\n📊 Resumo:')
    console.log('   - Pergunta de gênero migrada para pergunta fixa (BEFORE)')
    console.log('   - 6 novos temas criados')
    console.log('   - 1 tema sazonal (Carnaval: 01-28/02/2026)')
    console.log('   - Total de 51 novas perguntas')
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
