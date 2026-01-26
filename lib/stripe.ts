import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY não está definida nas variáveis de ambiente')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
})

// Helper para obter ou criar cliente Stripe
export async function getOrCreateStripeCustomer(
  email: string,
  name: string,
  userId: string
): Promise<string> {
  // Primeiro, busca se já existe um customerId salvo no banco
  const { prisma } = await import('./prisma')
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  })

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId
  }

  // Busca no Stripe por email
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (customers.data.length > 0) {
    const customerId = customers.data[0].id
    
    // Salva no banco para próximas consultas
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    })

    return customerId
  }

  // Cria novo cliente no Stripe
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  })

  // Salva no banco
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  })

  return customer.id
}
