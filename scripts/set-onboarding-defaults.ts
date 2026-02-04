import { prisma } from '../lib/prisma'

async function main() {
  console.log('Definindo valores padrão para configurações de onboarding...')

  const config = await prisma.systemConfig.upsert({
    where: { id: 'default' },
    update: {
      enableOnboardingInitial: true,
      enableOnboardingPostFirst: true,
    },
    create: {
      id: 'default',
      enableOnboardingInitial: true,
      enableOnboardingPostFirst: true,
    },
  })

  console.log('✅ Configurações atualizadas:', {
    enableOnboardingInitial: config.enableOnboardingInitial,
    enableOnboardingPostFirst: config.enableOnboardingPostFirst,
  })
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
