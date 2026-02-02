'use client'

import Link from 'next/link'
import { Logo } from '@/components/logo'
import { ArrowLeft, FileText, Scale, Shield, AlertCircle } from 'lucide-react'

export default function TermosPage() {
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
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4 text-gray-900 tracking-tight">
              Termos de{' '}
              <span className="text-gradient-primary">Uso</span>
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
                    <Scale className="w-6 h-6 text-purple-600" />
                    Bem-vindo ao Radar Match
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    Ao acessar e utilizar os serviços do Radar Match, você concorda com estes Termos de Uso. 
                    Se você não concordar com qualquer parte destes termos, não utilize nossos serviços.
                  </p>
                </section>

                {/* Descrição do Serviço */}
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Descrição do Serviço</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    O Radar Match é uma plataforma digital que oferece:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Análise de relacionamentos através de formulários e inteligência artificial</li>
                    <li>Identificação de sinais de alerta e padrões comportamentais</li>
                    <li>Conexão entre usuários e especialistas cadastrados (terapeutas, coaches, psicólogos, etc.)</li>
                    <li>Distribuição de leads para profissionais devidamente cadastrados</li>
                  </ul>
                </section>

                {/* Papel da Plataforma */}
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Natureza Intermediária da Plataforma</h3>
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-lg mb-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-900 mb-2">Importante:</p>
                        <p className="text-amber-800 text-sm leading-relaxed">
                          O Radar Match atua exclusivamente como uma ponte (intermediária) entre usuários 
                          e especialistas. Não somos responsáveis pelos serviços prestados pelos profissionais 
                          cadastrados nem pela forma como seus dados são utilizados por eles após o 
                          compartilhamento inicial.
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Os especialistas cadastrados são profissionais independentes que passam por um processo 
                    de aprovação. No entanto, a plataforma não se responsabiliza por:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
                    <li>Uso indevido ou inadequado dos dados compartilhados pelos especialistas</li>
                    <li>Qualidade, eficácia ou resultados dos atendimentos realizados</li>
                    <li>Condutas profissionais ou éticas dos especialistas após o primeiro contato</li>
                    <li>Danos diretos ou indiretos decorrentes dos serviços prestados pelos especialistas</li>
                  </ul>
                </section>

                {/* Cadastro e Acesso */}
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Cadastro e Acesso</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Para utilizar nossos serviços, você deve:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Ter pelo menos 18 anos de idade</li>
                    <li>Fornecer informações verdadeiras e atualizadas</li>
                    <li>Manter a confidencialidade de suas credenciais de acesso</li>
                    <li>Aceitar expressamente o compartilhamento de dados com especialistas cadastrados</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-3">
                    Ao fazer login com sua conta Google, você autoriza o acesso às informações básicas 
                    do seu perfil (nome e email) conforme nossa Política de Privacidade.
                  </p>
                </section>

                {/* Uso Aceitável */}
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Conduta do Usuário</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">Você concorda em não:</p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Fornecer informações falsas ou enganosas</li>
                    <li>Utilizar a plataforma para fins ilegais ou não autorizados</li>
                    <li>Tentar acessar áreas restritas do sistema</li>
                    <li>Reproduzir, distribuir ou modificar qualquer conteúdo da plataforma sem autorização</li>
                    <li>Usar bots, scrapers ou outras ferramentas automatizadas</li>
                    <li>Compartilhar suas credenciais de acesso com terceiros</li>
                  </ul>
                </section>

                {/* Compartilhamento de Dados */}
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Compartilhamento de Dados com Especialistas</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Ao utilizar nossos serviços, você consente expressamente que:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Seus dados pessoais (nome, email, telefone) sejam compartilhados com especialistas cadastrados</li>
                    <li>Dados resumidos de suas análises sejam enviados aos especialistas para melhor atendimento</li>
                    <li>Os especialistas possam entrar em contato com você através dos dados fornecidos</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-3">
                    Este compartilhamento é essencial para o funcionamento do serviço e permite que os 
                    especialistas ofereçam suporte adequado ao seu contexto.
                  </p>
                </section>

                {/* Propriedade Intelectual */}
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Propriedade Intelectual</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Todo o conteúdo da plataforma, incluindo textos, gráficos, logos, ícones, imagens, 
                    algoritmos e software, é de propriedade exclusiva do Radar Match ou de seus licenciadores 
                    e está protegido pelas leis de direitos autorais e propriedade intelectual aplicáveis.
                  </p>
                </section>

                {/* Limitação de Responsabilidade */}
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Limitação de Responsabilidade</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    O Radar Match não se responsabiliza por:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Interrupções temporárias ou permanentes do serviço</li>
                    <li>Perda de dados ou informações</li>
                    <li>Decisões tomadas com base nas análises fornecidas</li>
                    <li>Conteúdo fornecido por usuários ou especialistas terceiros</li>
                    <li>Incompatibilidade com dispositivos ou navegadores específicos</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-3">
                    As análises fornecidas têm caráter informativo e não substituem orientação profissional 
                    especializada quando necessário.
                  </p>
                </section>

                {/* Suspensão e Encerramento */}
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">8. Suspensão e Encerramento</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Reservamo-nos o direito de suspender ou encerrar sua conta, a qualquer momento, 
                    em caso de violação destes termos, suspeita de fraude ou uso inadequado da plataforma, 
                    sem necessidade de aviso prévio.
                  </p>
                </section>

                {/* Modificações */}
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">9. Modificações dos Termos</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Podemos modificar estes Termos de Uso a qualquer momento. Alterações significativas 
                    serão comunicadas por email ou através de avisos na plataforma. O uso continuado 
                    após as modificações constitui aceitação dos novos termos.
                  </p>
                </section>

                {/* Lei Aplicável */}
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">10. Lei Aplicável e Foro</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. 
                    Qualquer controvérsia decorrente destes termos será submetida ao foro da comarca 
                    de sua residência.
                  </p>
                </section>

                {/* Contato */}
                <section className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-purple-600" />
                    Contato
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Em caso de dúvidas sobre estes Termos de Uso, entre em contato através do email:{' '}
                    <a href="mailto:contato@radarmatch.com" className="text-purple-600 hover:underline font-medium">
                      contato@radarmatch.com
                    </a>
                  </p>
                </section>

                {/* Footer do documento */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <p className="text-sm text-gray-500 text-center">
                    Ao utilizar o Radar Match, você declara ter lido, compreendido e concordado com estes Termos de Uso.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Links */}
          <div className="mt-8 flex justify-center gap-4">
            <Link 
              href="/privacidade"
              className="text-purple-600 hover:text-purple-700 font-medium text-sm hover:underline"
            >
              Política de Privacidade
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
      `}</style>
    </div>
  )
}
