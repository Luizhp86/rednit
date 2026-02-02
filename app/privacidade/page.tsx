'use client'

import Link from 'next/link'
import { Logo } from '@/components/logo'
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react'

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden grain-overlay flex flex-col">
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-purple-200/50 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] bg-pink-200/40 rounded-full blur-[100px] animate-float-delayed" />
        <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-orange-200/30 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <header className="relative z-40 bg-white/70 backdrop-blur-2xl border-b border-purple-100/50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2.5 text-gray-600 hover:text-purple-600 transition-all hover:bg-purple-50 px-3 py-2 rounded-xl -ml-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium text-sm">Voltar</span>
            </Link>
            <Logo size="sm" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-4 sm:px-6 py-10">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          {/* Title Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4 text-gray-900 tracking-tight">
              Política de{' '}
              <span className="text-gradient-primary">Privacidade</span>
            </h1>
            <p className="text-gray-600 text-lg">
              Última atualização: 02 de fevereiro de 2026
            </p>
          </div>

          {/* Content Card */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-[2.5rem] blur-2xl" />
            
            <div className="relative bg-white/90 backdrop-blur-xl p-8 sm:p-12 rounded-[2rem] shadow-2xl border border-purple-100">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
              
              <div className="prose prose-lg max-w-none">
                {/* Introdução */}
                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <Lock className="w-6 h-6 text-purple-600" />
                    Compromisso com sua Privacidade
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    Esta Política de Privacidade descreve como o Radar Match coleta, usa, armazena e 
                    compartilha suas informações pessoais. Estamos comprometidos com a proteção dos 
                    seus dados e em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
                  </p>
                </section>

                {/* Dados Coletados */}
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                    <Database className="w-6 h-6 text-purple-600" />
                    1. Dados Coletados
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">1.1. Dados de Identificação</h4>
                      <p className="text-gray-700 leading-relaxed mb-2">Coletamos as seguintes informações pessoais:</p>
                      <ul className="list-disc pl-6 space-y-1 text-gray-700">
                        <li><strong>Email:</strong> fornecido através do login com Google</li>
                        <li><strong>Nome completo:</strong> obtido do seu perfil Google</li>
                        <li><strong>Telefone/WhatsApp:</strong> fornecido voluntariamente para contato com especialistas</li>
                        <li><strong>Instagram e Facebook:</strong> informações opcionais fornecidas por você</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">1.2. Dados de Análise de Relacionamento</h4>
                      <p className="text-gray-700 leading-relaxed mb-2">
                        Ao utilizar nosso serviço de análise, coletamos informações sensíveis sobre seu relacionamento:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 text-gray-700">
                        <li>Gênero do match e objetivo do relacionamento</li>
                        <li>Estágio e ritmo do relacionamento</li>
                        <li>Padrões de comunicação e comportamento</li>
                        <li>Sinais de alerta identificados</li>
                        <li>Trechos de conversas (fornecidos voluntariamente)</li>
                        <li>Nome e bio do match</li>
                        <li>Seus inegociáveis e preferências</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">1.3. Dados de Navegação e Uso</h4>
                      <ul className="list-disc pl-6 space-y-1 text-gray-700">
                        <li>Endereço IP e informações de dispositivo</li>
                        <li>Tipo de navegador e sistema operacional</li>
                        <li>Páginas visitadas e tempo de permanência</li>
                        <li>Origem do acesso (referrer)</li>
                        <li>Cookies de sessão e identificadores únicos</li>
                        <li>Eventos de interação (cliques, scrolls, etc.)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">1.4. Dados de Pagamento</h4>
                      <p className="text-gray-700 leading-relaxed">
                        Não armazenamos diretamente informações de cartão de crédito. Os pagamentos são 
                        processados por meio de provedores seguros (Stripe/Asaas) que mantêm os dados 
                        financeiros criptografados e em conformidade com PCI-DSS.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Finalidade */}
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-3">
                    <Eye className="w-6 h-6 text-purple-600" />
                    2. Finalidade da Coleta
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-3">Utilizamos seus dados para:</p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li><strong>Análise de relacionamentos:</strong> processar suas respostas e gerar insights personalizados usando regras e inteligência artificial</li>
                    <li><strong>Conexão com especialistas:</strong> compartilhar seus dados com profissionais cadastrados que possam oferecer suporte</li>
                    <li><strong>Comunicação:</strong> enviar notificações sobre análises, leads e atualizações do serviço</li>
                    <li><strong>Melhorias do serviço:</strong> analisar padrões de uso para aprimorar a plataforma</li>
                    <li><strong>Gestão de conta:</strong> autenticar, gerenciar assinaturas e processar pagamentos</li>
                    <li><strong>Conformidade legal:</strong> cumprir obrigações legais e regulatórias</li>
                  </ul>
                </section>

                {/* Compartilhamento */}
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-3">
                    <UserCheck className="w-6 h-6 text-purple-600" />
                    3. Compartilhamento com Especialistas
                  </h3>
                  
                  <div className="bg-purple-50 border-l-4 border-purple-400 p-6 rounded-lg mb-4">
                    <p className="font-semibold text-purple-900 mb-2">Consentimento Expresso</p>
                    <p className="text-purple-800 text-sm leading-relaxed">
                      Ao criar uma conta e utilizar nossos serviços, você consente expressamente com o 
                      compartilhamento de seus dados pessoais com especialistas cadastrados, aprovados 
                      e ativos na plataforma.
                    </p>
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-3">
                    <strong>Dados compartilhados com especialistas:</strong>
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li><strong>Dados básicos:</strong> nome, email e telefone</li>
                    <li><strong>Nome do match:</strong> para contextualização</li>
                    <li><strong>Resumo da análise:</strong> sinais de alerta identificados, pontos positivos, hipótese principal e scores</li>
                    <li><strong>Dados completos (apenas em CTAs):</strong> em casos onde você solicita ativamente falar com um especialista, compartilhamos o formulário completo</li>
                  </ul>

                  <p className="text-gray-700 leading-relaxed mt-4">
                    <strong>Importante:</strong> Os especialistas são profissionais independentes. Após o compartilhamento 
                    inicial dos dados, o Radar Match não controla nem se responsabiliza pela forma como esses 
                    profissionais utilizam ou armazenam suas informações.
                  </p>
                </section>

                {/* Base Legal LGPD */}
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Base Legal (LGPD)</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    O tratamento dos seus dados pessoais é fundamentado nas seguintes bases legais:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li><strong>Consentimento (Art. 7º, I):</strong> você autoriza expressamente a coleta e compartilhamento ao aceitar nossos termos e utilizar os serviços</li>
                    <li><strong>Execução de contrato (Art. 7º, V):</strong> os dados são necessários para prestar os serviços contratados</li>
                    <li><strong>Legítimo interesse (Art. 7º, IX):</strong> para melhorias da plataforma e análises estatísticas</li>
                    <li><strong>Proteção ao crédito (Art. 7º, X):</strong> para processar pagamentos e gerenciar assinaturas</li>
                  </ul>
                </section>

                {/* Segurança */}
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Segurança dos Dados</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Implementamos medidas técnicas e organizacionais para proteger seus dados:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Criptografia SSL/TLS em todas as transmissões</li>
                    <li>Senhas armazenadas com hash bcrypt</li>
                    <li>Controle de acesso baseado em permissões</li>
                    <li>Backup regular dos dados</li>
                    <li>Monitoramento de atividades suspeitas</li>
                    <li>Infraestrutura hospedada em provedores confiáveis (Vercel, Supabase)</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-3">
                    Apesar dos nossos esforços, nenhum sistema é 100% seguro. Recomendamos que você 
                    também tome precauções ao compartilhar informações online.
                  </p>
                </section>

                {/* Cookies */}
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Cookies e Tecnologias Similares</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Utilizamos cookies e tecnologias similares para:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li><strong>Cookies essenciais:</strong> necessários para funcionamento básico (autenticação, sessão)</li>
                    <li><strong>Cookies de desempenho:</strong> para entender como você usa a plataforma</li>
                    <li><strong>Cookies funcionais:</strong> para lembrar suas preferências</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-3">
                    Você pode configurar seu navegador para recusar cookies, mas isso pode afetar 
                    funcionalidades da plataforma.
                  </p>
                </section>

                {/* Retenção */}
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Retenção de Dados</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Mantemos seus dados pessoais pelo tempo necessário para cumprir as finalidades 
                    descritas nesta política, salvo se um período maior for exigido ou permitido por lei:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                    <li><strong>Conta ativa:</strong> enquanto você utilizar nossos serviços</li>
                    <li><strong>Análises:</strong> armazenadas enquanto a conta estiver ativa</li>
                    <li><strong>Logs de acesso:</strong> até 6 meses</li>
                    <li><strong>Dados de pagamento:</strong> conforme exigências fiscais (geralmente 5 anos)</li>
                    <li><strong>Conta excluída:</strong> dados anonimizados ou deletados em até 30 dias, exceto quando houver obrigação legal de retenção</li>
                  </ul>
                </section>

                {/* Direitos do Titular */}
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">8. Seus Direitos (LGPD)</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Você tem os seguintes direitos em relação aos seus dados pessoais:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li><strong>Confirmação e acesso:</strong> saber se tratamos seus dados e acessá-los</li>
                    <li><strong>Correção:</strong> atualizar dados incompletos, inexatos ou desatualizados</li>
                    <li><strong>Anonimização ou exclusão:</strong> solicitar remoção de dados desnecessários ou tratados sem consentimento</li>
                    <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado e legível</li>
                    <li><strong>Revogação do consentimento:</strong> retirar autorização a qualquer momento</li>
                    <li><strong>Informação sobre compartilhamento:</strong> saber com quem compartilhamos seus dados</li>
                    <li><strong>Oposição:</strong> opor-se ao tratamento em determinadas situações</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-3">
                    Para exercer seus direitos, entre em contato através do email:{' '}
                    <a href="mailto:privacidade@radarmatch.com" className="text-purple-600 hover:underline font-medium">
                      privacidade@radarmatch.com
                    </a>
                  </p>
                </section>

                {/* Crianças */}
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">9. Menores de Idade</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Nossos serviços são destinados exclusivamente a pessoas maiores de 18 anos. 
                    Não coletamos intencionalmente dados de menores de idade. Se você tiver conhecimento 
                    de que uma criança forneceu dados pessoais, entre em contato conosco imediatamente.
                  </p>
                </section>

                {/* Transferência Internacional */}
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">10. Transferência Internacional</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Seus dados podem ser armazenados e processados em servidores localizados fora do Brasil, 
                    através de provedores que seguem padrões internacionais de segurança (como Vercel e Supabase). 
                    Tomamos medidas para garantir que esses dados recebam proteção adequada conforme a LGPD.
                  </p>
                </section>

                {/* Alterações */}
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">11. Alterações na Política</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Podemos atualizar esta Política de Privacidade periodicamente. Alterações significativas 
                    serão comunicadas por email ou através de avisos na plataforma. Recomendamos que você 
                    revise esta política regularmente.
                  </p>
                </section>

                {/* Controlador */}
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-purple-600" />
                    12. Controlador e Contato
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-gray-700 leading-relaxed mb-3">
                      <strong>Controlador de Dados:</strong> Radar Match
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      Para questões relacionadas à privacidade e proteção de dados:
                    </p>
                    <ul className="space-y-1 text-gray-700">
                      <li><strong>Email:</strong>{' '}
                        <a href="mailto:privacidade@radarmatch.com" className="text-purple-600 hover:underline">
                          privacidade@radarmatch.com
                        </a>
                      </li>
                      <li><strong>Contato geral:</strong>{' '}
                        <a href="mailto:contato@radarmatch.com" className="text-purple-600 hover:underline">
                          contato@radarmatch.com
                        </a>
                      </li>
                    </ul>
                  </div>
                </section>

                {/* Footer do documento */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <p className="text-sm text-gray-500 text-center">
                    Ao utilizar o Radar Match, você declara ter lido, compreendido e concordado com esta Política de Privacidade.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Links */}
          <div className="mt-8 flex justify-center gap-4">
            <Link 
              href="/termos"
              className="text-purple-600 hover:text-purple-700 font-medium text-sm hover:underline"
            >
              Termos de Uso
            </Link>
          </div>
        </div>
      </main>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 8s ease-in-out infinite;
          animation-delay: -2s;
        }
        
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(24px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        
        .text-gradient-primary {
          background: linear-gradient(135deg, #9333EA 0%, #EC4899 50%, #F97316 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .grain-overlay::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
          mix-blend-mode: overlay;
        }

        .prose h2 {
          margin-top: 0;
        }
        
        .prose h3 {
          margin-top: 0;
        }

        .prose h4 {
          margin-top: 0;
        }
      `}</style>
    </div>
  )
}
