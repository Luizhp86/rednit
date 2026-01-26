import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Radar Match <noreply@radarmatch.com.br>'

// ============================================
// EMAILS PARA TERAPEUTAS
// ============================================

/**
 * Email de boas-vindas para terapeuta (após cadastro)
 */
export async function sendTherapistWelcomeEmail(therapist: {
  email: string
  name: string
}) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: therapist.email,
      subject: '🎉 Bem-vindo ao Radar Match - Cadastro recebido!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7c3aed;">Olá, ${therapist.name}!</h1>
          
          <p style="font-size: 16px; color: #333;">
            Seu cadastro foi recebido com sucesso! 🎉
          </p>
          
          <p style="font-size: 16px; color: #333;">
            Nossa equipe está analisando seu perfil e você receberá um email assim que for aprovado.
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #7c3aed; margin-top: 0;">Próximos passos:</h3>
            <ol style="color: #555;">
              <li>Aguarde a aprovação do seu cadastro (geralmente em até 24h)</li>
              <li>Escolha seu plano de assinatura</li>
              <li>Comece a receber leads qualificados!</li>
            </ol>
          </div>
          
          <p style="font-size: 14px; color: #888;">
            Qualquer dúvida, responda este email.
          </p>
          
          <p style="font-size: 14px; color: #888;">
            Equipe Radar Match
          </p>
        </div>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error)
    return { success: false, error }
  }
}

/**
 * Email de aprovação para terapeuta
 */
export async function sendTherapistApprovalEmail(therapist: {
  email: string
  name: string
}) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: therapist.email,
      subject: '✅ Seu cadastro foi aprovado! - Radar Match',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #22c55e;">Parabéns, ${therapist.name}! 🎉</h1>
          
          <p style="font-size: 16px; color: #333;">
            Seu cadastro foi <strong>aprovado</strong> e você já pode começar a receber leads!
          </p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #22c55e;">
            <h3 style="color: #22c55e; margin-top: 0;">Próximo passo:</h3>
            <p style="color: #555; margin-bottom: 0;">
              Acesse seu dashboard e escolha um plano para ativar sua conta e começar a receber leads.
            </p>
          </div>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://radarmatch.com.br'}/terapeuta/login" 
             style="display: inline-block; background: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Acessar meu Dashboard
          </a>
          
          <p style="font-size: 14px; color: #888; margin-top: 30px;">
            Equipe Radar Match
          </p>
        </div>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Erro ao enviar email de aprovação:', error)
    return { success: false, error }
  }
}

/**
 * Email de notificação de novo lead (SIGNUP - básico)
 */
export async function sendLeadSignupNotification(params: {
  therapist: { email: string; name: string }
  lead: {
    userName?: string | null
    userEmail: string
    userPhone: string
  }
}) {
  const { therapist, lead } = params
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: therapist.email,
      subject: '📩 Novo lead recebido! - Radar Match',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7c3aed;">Novo Lead Recebido! 📩</h1>
          
          <p style="font-size: 16px; color: #333;">
            Olá ${therapist.name}, você recebeu um novo lead de cadastro.
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Dados do Lead:</h3>
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Nome:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${lead.userName || 'Não informado'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Email:</td>
                <td style="padding: 8px 0; color: #333;">${lead.userEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Telefone:</td>
                <td style="padding: 8px 0; color: #333;">
                  <a href="https://wa.me/55${lead.userPhone.replace(/\D/g, '')}" style="color: #22c55e; font-weight: bold;">
                    ${lead.userPhone}
                  </a>
                </td>
              </tr>
            </table>
          </div>
          
          <a href="https://wa.me/55${lead.userPhone.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Sou terapeuta parceiro do Radar Match. Vi que você se cadastrou e gostaria de me apresentar.')}" 
             style="display: inline-block; background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            💬 Entrar em contato via WhatsApp
          </a>
          
          <p style="font-size: 14px; color: #888; margin-top: 30px;">
            Este lead foi gerado automaticamente pelo Radar Match.<br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://radarmatch.com.br'}/terapeuta/dashboard">Acessar Dashboard</a>
          </p>
        </div>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Erro ao enviar notificação de lead SIGNUP:', error)
    return { success: false, error }
  }
}

/**
 * Email de notificação de lead ANALYSIS (morno - completou análise)
 */
export async function sendLeadAnalysisNotification(params: {
  therapist: { email: string; name: string; plan: string }
  lead: {
    userName?: string | null
    userEmail: string
    userPhone: string
    matchName?: string | null
    analysisData?: any
  }
}) {
  const { therapist, lead } = params
  
  // Extrair dados relevantes da análise
  const redFlags = lead.analysisData?.redFlags || []
  const greenFlags = lead.analysisData?.greenFlags || []
  const scores = lead.analysisData?.scores || {}
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: therapist.email,
      subject: '📊 Novo lead - Usuário completou análise! - Radar Match',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">📊 Lead de Análise</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Este usuário completou uma análise de match</p>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 12px 12px;">
            <h3 style="color: #333; margin-top: 0;">Dados do Lead:</h3>
            <table style="width: 100%; font-size: 14px; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Nome:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${lead.userName || 'Não informado'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Email:</td>
                <td style="padding: 8px 0; color: #333;">${lead.userEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Telefone:</td>
                <td style="padding: 8px 0; color: #333;">
                  <a href="https://wa.me/55${lead.userPhone.replace(/\D/g, '')}" style="color: #22c55e; font-weight: bold;">
                    ${lead.userPhone}
                  </a>
                </td>
              </tr>
              ${lead.matchName ? `
              <tr>
                <td style="padding: 8px 0; color: #666;">Match analisado:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${lead.matchName}</td>
              </tr>
              ` : ''}
            </table>
            
            <div style="background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 15px;">
              <h4 style="color: #333; margin: 0 0 10px;">📋 Resumo da Análise:</h4>
              <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                ${redFlags.length > 0 ? `
                <div>
                  <span style="color: #dc2626; font-weight: bold;">🚩 ${redFlags.length} red flag${redFlags.length > 1 ? 's' : ''}</span>
                </div>
                ` : ''}
                ${greenFlags.length > 0 ? `
                <div>
                  <span style="color: #22c55e; font-weight: bold;">✅ ${greenFlags.length} green flag${greenFlags.length > 1 ? 's' : ''}</span>
                </div>
                ` : ''}
              </div>
            </div>
            
            ${Object.keys(scores).length > 0 ? `
            <div style="background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h4 style="color: #333; margin: 0 0 10px;">📊 Scores:</h4>
              <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                ${Object.entries(scores).slice(0, 4).map(([key, value]) => `
                  <span style="background: #f3f4f6; padding: 5px 10px; border-radius: 20px; font-size: 12px;">
                    ${key}: <strong>${value}</strong>
                  </span>
                `).join('')}
              </div>
            </div>
            ` : ''}
          </div>
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="https://wa.me/55${lead.userPhone.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Vi que você fez uma análise no Radar Match. Se precisar de ajuda para entender melhor sua situação, estou à disposição!')}" 
               style="display: inline-block; background: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              💬 Entrar em contato via WhatsApp
            </a>
          </div>
          
          <p style="font-size: 12px; color: #888; margin-top: 30px; text-align: center;">
            Este usuário completou uma análise e pode estar precisando de orientação.<br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://radarmatch.com.br'}/terapeuta/dashboard">Acessar Dashboard</a>
          </p>
        </div>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Erro ao enviar notificação de lead ANALYSIS:', error)
    return { success: false, error }
  }
}

/**
 * Email de notificação de lead CTA (quente - com dados da análise)
 */
export async function sendLeadCtaNotification(params: {
  therapist: { email: string; name: string; plan: string }
  lead: {
    userName?: string | null
    userEmail: string
    userPhone: string
    matchName?: string | null
    analysisData?: any
  }
}) {
  const { therapist, lead } = params
  
  // Extrair dados relevantes da análise
  const redFlags = lead.analysisData?.redFlags || []
  const hypothesis = lead.analysisData?.hypothesis
  const scores = lead.analysisData?.scores || {}
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: therapist.email,
      subject: '🔥 Lead QUENTE! Usuário quer falar com especialista - Radar Match',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🔥 Lead Quente!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Este usuário clicou em "Falar com especialista"</p>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 12px 12px;">
            <h3 style="color: #333; margin-top: 0;">Dados do Lead:</h3>
            <table style="width: 100%; font-size: 14px; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Nome:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${lead.userName || 'Não informado'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Email:</td>
                <td style="padding: 8px 0; color: #333;">${lead.userEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Telefone:</td>
                <td style="padding: 8px 0; color: #333;">
                  <a href="https://wa.me/55${lead.userPhone.replace(/\D/g, '')}" style="color: #22c55e; font-weight: bold;">
                    ${lead.userPhone}
                  </a>
                </td>
              </tr>
              ${lead.matchName ? `
              <tr>
                <td style="padding: 8px 0; color: #666;">Match analisado:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${lead.matchName}</td>
              </tr>
              ` : ''}
            </table>
            
            ${redFlags.length > 0 ? `
            <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #ef4444;">
              <h4 style="color: #dc2626; margin: 0 0 10px;">🚩 Red Flags detectados:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #555;">
                ${redFlags.slice(0, 3).map((flag: any) => `<li>${typeof flag === 'string' ? flag : flag.title || flag.name}</li>`).join('')}
                ${redFlags.length > 3 ? `<li><em>+${redFlags.length - 3} outros</em></li>` : ''}
              </ul>
            </div>
            ` : ''}
            
            ${hypothesis ? `
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #3b82f6;">
              <h4 style="color: #1d4ed8; margin: 0 0 5px;">💡 Hipótese principal:</h4>
              <p style="margin: 0; color: #555;">${hypothesis}</p>
            </div>
            ` : ''}
            
            ${Object.keys(scores).length > 0 ? `
            <div style="background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h4 style="color: #333; margin: 0 0 10px;">📊 Scores:</h4>
              <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                ${Object.entries(scores).slice(0, 4).map(([key, value]) => `
                  <span style="background: #f3f4f6; padding: 5px 10px; border-radius: 20px; font-size: 12px;">
                    ${key}: <strong>${value}</strong>
                  </span>
                `).join('')}
              </div>
            </div>
            ` : ''}
          </div>
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="https://wa.me/55${lead.userPhone.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Vi sua análise no Radar Match e estou aqui para te ajudar a entender melhor sua situação. Podemos conversar?')}" 
               style="display: inline-block; background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              💬 Entrar em contato agora
            </a>
          </div>
          
          <p style="font-size: 12px; color: #888; margin-top: 30px; text-align: center;">
            ⚡ Lead quente! Entre em contato o mais rápido possível.<br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://radarmatch.com.br'}/terapeuta/dashboard">Acessar Dashboard</a>
          </p>
        </div>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Erro ao enviar notificação de lead CTA:', error)
    return { success: false, error }
  }
}

// ============================================
// EMAILS PARA USUÁRIOS
// ============================================

/**
 * Email de boas-vindas para usuário
 */
export async function sendUserWelcomeEmail(user: {
  email: string
  name?: string | null
}) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: '💜 Bem-vindo ao Radar Match!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7c3aed;">Bem-vindo ao Radar Match! 💜</h1>
          
          <p style="font-size: 16px; color: #333;">
            ${user.name ? `Olá ${user.name}!` : 'Olá!'} Sua conta foi criada com sucesso.
          </p>
          
          <p style="font-size: 16px; color: #333;">
            Agora você pode fazer análises de comportamento dos seus matches e descobrir 
            insights valiosos sobre seus relacionamentos.
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: #7c3aed; margin-top: 0;">O que você pode fazer:</h3>
            <ul style="color: #555;">
              <li>Analisar o comportamento do seu match</li>
              <li>Descobrir red flags e green flags</li>
              <li>Receber dicas personalizadas</li>
              <li>Conversar com especialistas se precisar</li>
            </ul>
          </div>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://radarmatch.com.br'}/dashboard" 
             style="display: inline-block; background: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Fazer minha primeira análise
          </a>
          
          <p style="font-size: 14px; color: #888; margin-top: 30px;">
            Equipe Radar Match
          </p>
        </div>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error)
    return { success: false, error }
  }
}
