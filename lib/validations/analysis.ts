import { z } from 'zod'

export const analysisInputSchema = z.object({
  // Campos obrigatórios (passo 1)
  genero_match: z.enum(['ELE', 'ELA']),
  objetivo_usuario: z.enum(['CASUAL', 'CONHECER', 'NAMORO']),
  ritmo_usuario: z.enum(['RAPIDO', 'MEDIO', 'LENTO']),
  estagio: z.enum(['FIRST_CHAT', 'TALKING', 'POST_DATE']),
  iniciativa: z.enum(['VOCE', 'MATCH', 'MEIO_A_MEIO']),
  frequencia_contato: z.enum(['DIARIA', 'ALTERNADA', 'SOME']),
  // Campos opcionais (passos 2 e 3)
  tempo_resposta: z.enum(['MINUTOS', 'HORAS', 'DIAS']).optional(),
  encontro_marcado: z.enum(['SIM', 'NAO']).optional(),
  cancelou_encontro: z.enum(['SIM', 'NAO']).optional(),
  remarcou_com_data: z.enum(['SIM', 'NAO', 'NAO_SE_APLICA']).optional(),
  curiosidade_por_voce: z.enum(['ALTA', 'MEDIA', 'BAIXA']).optional(),
  respeito_limites: z.enum(['RESPEITA', 'NEGOCIA', 'INSISTE', 'DEBOCHA']).optional(),
  disponivel_so_madrugada: z.enum(['SIM', 'NAO']).optional(),
  fala_futuro: z.enum(['NAO', 'FALA', 'FALA_E_FAZ']).optional(),
  sinais_alerta: z.array(
    z.enum([
      'LOVE_BOMBING',
      'CIUME_CEDO',
      'VITIMISMO',
      'HOSTILIDADE',
      'CONTRADICOES',
      'SUMICO_POS_INTIMIDADE',
      'TRIANGULACAO',
    ])
  ).default([]),
  inegociaveis: z.array(z.string()).max(3).default([]),
  texto_bio_match: z.string().max(500).optional(),
  trecho_chat: z.string().max(1500).optional(),
  nome_match: z.string().max(100).optional(),
})

export type AnalysisInputSchema = z.infer<typeof analysisInputSchema>
