import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateLead, getTherapistForLead, canReceiveWhatsappDirect } from '@/lib/lead-rotation'
import { sendLeadSignupNotification, sendLeadCtaNotification } from '@/lib/email'
import { z } from 'zod'

const generateLeadSchema = z.object({
  type: z.enum(['SIGNUP', 'CTA']),
  userId: z.string().optional(),
  userName: z.string().optional(),
  userEmail: z.string().email(),
  userPhone: z.string().min(10),
  analysisId: z.string().optional(),
  matchName: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = generateLeadSchema.parse(body)
    
    // Verificar configuração do sistema
    const config = await prisma.systemConfig.findUnique({
      where: { id: 'default' }
    })
    
    // Verificar se geração de leads está habilitada
    if (validatedData.type === 'SIGNUP' && config && !config.enableLeadSignup) {
      return NextResponse.json({ 
        success: false, 
        message: 'Geração de leads de cadastro desabilitada' 
      })
    }
    
    if (validatedData.type === 'CTA' && config && !config.enableLeadCta) {
      return NextResponse.json({ 
        success: false, 
        message: 'Geração de leads CTA desabilitada' 
      })
    }
    
    // Se for CTA, buscar dados da análise
    let analysisData = null
    if (validatedData.type === 'CTA' && validatedData.analysisId) {
      const analysis = await prisma.analysis.findUnique({
        where: { id: validatedData.analysisId },
        select: {
          inputJson: true,
          resultJson: true,
        }
      })
      
      if (analysis) {
        const result = analysis.resultJson as any
        analysisData = {
          // Dados resumidos da análise
          redFlags: result?.red_flags || result?.redFlags || [],
          greenFlags: result?.green_flags || result?.greenFlags || [],
          hypothesis: result?.hypotheses_top3?.[0]?.key || result?.hypothesis,
          scores: result?.scores || {},
          input: analysis.inputJson,
        }
      }
    }
    
    // Gerar lead
    const result = await generateLead({
      type: validatedData.type,
      userId: validatedData.userId,
      userName: validatedData.userName,
      userEmail: validatedData.userEmail,
      userPhone: validatedData.userPhone,
      analysisId: validatedData.analysisId,
      matchName: validatedData.matchName,
      analysisData: analysisData,
    })
    
    if (!result) {
      return NextResponse.json({
        success: false,
        message: 'Nenhum terapeuta disponível no momento',
      })
    }
    
    // Buscar dados do terapeuta
    const therapist = await getTherapistForLead(result.therapistId)
    
    if (!therapist) {
      return NextResponse.json({
        success: false,
        message: 'Erro ao buscar terapeuta',
      })
    }
    
    // Enviar email para terapeuta
    try {
      if (validatedData.type === 'SIGNUP') {
        await sendLeadSignupNotification({
          therapist: {
            email: therapist.email,
            name: therapist.name,
          },
          lead: {
            userName: validatedData.userName,
            userEmail: validatedData.userEmail,
            userPhone: validatedData.userPhone,
          },
        })
      } else {
        await sendLeadCtaNotification({
          therapist: {
            email: therapist.email,
            name: therapist.name,
            plan: therapist.plan,
          },
          lead: {
            userName: validatedData.userName,
            userEmail: validatedData.userEmail,
            userPhone: validatedData.userPhone,
            matchName: validatedData.matchName,
            analysisData: analysisData,
          },
        })
      }
      
      // Marcar email como enviado
      await prisma.lead.update({
        where: { id: result.leadId },
        data: { emailSentAt: new Date() }
      })
    } catch (emailError) {
      console.error('Erro ao enviar email de notificação:', emailError)
      // Não falhar a requisição se o email falhar
    }
    
    // Preparar resposta
    const response: any = {
      success: true,
      leadId: result.leadId,
      therapistId: result.therapistId,
    }
    
    // Se for CTA e terapeuta é PRO, incluir WhatsApp para redirect
    if (validatedData.type === 'CTA' && canReceiveWhatsappDirect(therapist.plan)) {
      response.whatsapp = therapist.whatsapp
      response.whatsappUrl = `https://wa.me/55${therapist.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Vim do Radar Match e gostaria de conversar sobre minha análise.')}`
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Erro ao gerar lead:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
