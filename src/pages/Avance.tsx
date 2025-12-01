import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogosTicker } from "@/components/LogosTicker";
import { ArrowLeft, Check, Sparkles, TrendingUp, Zap, Target, Lightbulb, Table2, Workflow } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoCompleta from "@/assets/logo-aplicada-marca-completa.png";
import backgroundSymbol from "@/assets/logos/background-symbol.png";

export default function Avance() {
  const navigate = useNavigate();
  
  return (
    <div className="h-screen overflow-y-auto relative bg-background">
      {/* Background com logo 4 pétalas transparente */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url(${backgroundSymbol})`,
          backgroundSize: '900px 900px',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.05
        }}
      />
      
      {/* Botão Voltar */}
      <div className="absolute top-4 left-4 z-20">
        <Button 
          variant="ghost" 
          className="text-foreground hover:bg-muted"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </Button>
      </div>
      
      {/* Conteúdo centralizado */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="py-16 md:py-24 text-center px-4">
          {/* Logo IAplicada */}
          <img 
            src={logoCompleta} 
            alt="IAplicada" 
            className="h-12 md:h-16 mx-auto mb-12"
          />
          
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#2F302B] mb-6">
            Avance <span className="text-[#9EB038]">agora</span>,
            <br />
            acelere resultados.
          </h1>
          
          {/* Subtítulo */}
          <p className="text-[#2F302B]/80 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Você já conhece o poder da IA. Hora de multiplicar seus resultados
            <br />
            com mentoria ou transformação digital completa.
          </p>
          
          {/* CTA Button */}
          <Button 
            className="bg-[#C5D63D] hover:bg-[#B5C62D] text-zinc-900 font-bold text-sm uppercase tracking-wide rounded-full px-8 py-6"
            onClick={() => {
              document.getElementById('precos')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            ESCOLHER MEU UPGRADE
          </Button>
        </section>
        
        {/* Logos Ticker */}
        <section className="py-8">
          <LogosTicker />
        </section>
        
        {/* Pricing Cards */}
        <section id="precos" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Card Mentoria - Tema Claro */}
              <Card className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-lg flex flex-col">
                <h2 className="text-3xl font-bold text-zinc-900 mb-6">Mentoria</h2>
                
                <p className="text-4xl font-bold text-zinc-900 mb-8">
                  Investimento sob<br />consulta
                </p>
                
                <div className="space-y-4 text-zinc-600 text-sm mb-8">
                  <p className="font-semibold text-zinc-900">Tudo da Academy +</p>
                  <p>6 encontros/mês (2h), práticos e colaborativos.</p>
                  <p>3 a 6 projetos práticos (avalio e direciono sua jornada)</p>
                  <p>Comunidade premium (networking com os Aplicados)</p>
                  <p>Acesso antecipado (Beta) + materiais exclusivos + certificado premium.</p>
                </div>
                
                <Button 
                  className="w-full mt-auto bg-[#C5D63D] hover:bg-[#B5C62D] text-zinc-900 font-bold text-sm uppercase tracking-wide rounded-full py-6"
                  onClick={() => navigate('/candidatar-mentoria')}
                >
                  QUERO ME CANDIDATAR
                </Button>
              </Card>

              {/* Card Consult - Tema Escuro */}
              <Card className="bg-zinc-900 border border-[#C5D63D]/30 rounded-2xl p-8 shadow-lg flex flex-col">
                <h2 className="text-3xl font-bold text-white mb-6">Consult</h2>
                
                <p className="text-4xl font-bold text-white mb-2">R$ 15.000+</p>
                <p className="text-[#C5D63D] font-medium mb-8">
                  Projeto customizado
                </p>
                
                <div className="space-y-4 text-zinc-300 text-sm mb-8">
                  <p className="font-semibold text-white">Done For You:</p>
                  <p>Diagnóstico completo de maturidade digital</p>
                  <p>Implementação de automações e dashboards</p>
                  <p>Capacitação hands-on da equipe</p>
                  <p>1 ferramenta com IA personalizada para empresa</p>
                  <p>Acesso para o gestor e para equipe</p>
                  <p>Plano personalizado para sua equipe</p>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-auto border-2 border-[#C5D63D] bg-[#C5D63D]/10 hover:bg-[#C5D63D]/20 text-[#C5D63D] font-bold text-sm uppercase tracking-wide rounded-full py-6"
                  onClick={() => window.open('https://wa.me/5531999999999', '_blank')}
                >
                  FALAR COM ESPECIALISTA
                </Button>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Tabela Comparativa */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-[#2F302B]">
              Qual plano combina com você?
            </h2>
            
            <div className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="w-[40%] p-4 text-left"></th>
                    <th className="w-[30%] p-6 text-center">
                      <div className="text-xl font-bold text-[#2F302B] mb-1">Mentoria</div>
                      <div className="text-lg font-medium text-[#2F302B]">Sob consulta</div>
                    </th>
                    <th className="w-[30%] p-6 text-center">
                      <div className="text-xl font-bold text-[#9EB038] mb-1">Consult</div>
                      <div className="text-2xl font-bold text-[#9EB038]">R$ 15.000+</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* PARA QUEM É */}
                  <tr className="bg-[#9EB038]/10">
                    <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-[#9EB038] uppercase tracking-wide">
                      Para quem é
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Público-alvo</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">Profissionais individuais</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">Empresas e times</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Economia de tempo</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">6 a 10 horas/semana</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">15+ horas/semana</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Duração</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">6 meses (encontros mensais)</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">Projeto 3-6 meses + recorrência</td>
                  </tr>
                  
                  {/* FORMATO */}
                  <tr className="bg-[#9EB038]/10">
                    <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-[#9EB038] uppercase tracking-wide">
                      Formato
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Encontros práticos</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">6 encontros/mês (2h cada)</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">Cronograma personalizado</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Projetos práticos</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">3-6 projetos orientados</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">Implementamos com você</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Comunidade premium</td>
                    <td className="px-4 py-4 text-center border-l border-zinc-200">
                      <Check className="h-5 w-5 text-[#9EB038] mx-auto" />
                    </td>
                    <td className="px-4 py-4 text-center border-l border-zinc-200">
                      <Check className="h-5 w-5 text-[#9EB038] mx-auto" />
                    </td>
                  </tr>
                  
                  {/* SUPORTE E ACESSO */}
                  <tr className="bg-[#9EB038]/10">
                    <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-[#9EB038] uppercase tracking-wide">
                      Suporte e acesso
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Academy incluso</td>
                    <td className="px-4 py-4 text-center border-l border-zinc-200">
                      <Check className="h-5 w-5 text-[#9EB038] mx-auto" />
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">Gestor + equipe</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Plano para equipe</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-400 border-l border-zinc-200">–</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">Personalizado</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Acesso antecipado (Beta)</td>
                    <td className="px-4 py-4 text-center border-l border-zinc-200">
                      <Check className="h-5 w-5 text-[#9EB038] mx-auto" />
                    </td>
                    <td className="px-4 py-4 text-center border-l border-zinc-200">
                      <Check className="h-5 w-5 text-[#9EB038] mx-auto" />
                    </td>
                  </tr>
                  
                  {/* IMPLEMENTAÇÃO */}
                  <tr className="bg-[#9EB038]/10">
                    <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-[#9EB038] uppercase tracking-wide">
                      Implementação
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Diagnóstico de maturidade</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-400 border-l border-zinc-200">–</td>
                    <td className="px-4 py-4 text-center border-l border-zinc-200">
                      <Check className="h-5 w-5 text-[#9EB038] mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Automações e dashboards</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">Você aplica com suporte</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">Implementamos para você</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Capacitação hands-on</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-400 border-l border-zinc-200">–</td>
                    <td className="px-4 py-4 text-center border-l border-zinc-200">
                      <Check className="h-5 w-5 text-[#9EB038] mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Ferramenta IA personalizada</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-400 border-l border-zinc-200">–</td>
                    <td className="px-4 py-4 text-center border-l border-zinc-200">
                      <Check className="h-5 w-5 text-[#9EB038] mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 text-sm text-zinc-600">Modelo de entrega</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">DIY (com orientação)</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">Done For You</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
        
        {/* Featured Modules Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#2F302B]">
              O que você vai dominar
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Módulo 1 */}
              <Card className="bg-white border border-zinc-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#9EB038]/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-[#9EB038]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 mb-2">Prompts Avançados</h3>
                    <p className="text-sm text-zinc-600">
                      Economize 4h/semana em comunicação, reuniões e relatórios
                    </p>
                  </div>
                </div>
              </Card>

              {/* Módulo 2 */}
              <Card className="bg-white border border-zinc-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#9EB038]/10 flex items-center justify-center flex-shrink-0">
                    <Table2 className="h-6 w-6 text-[#9EB038]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 mb-2">Dashboards Inteligentes</h3>
                    <p className="text-sm text-zinc-600">
                      Economize 3h/semana em análise de dados e tomada de decisão
                    </p>
                  </div>
                </div>
              </Card>

              {/* Módulo 3 */}
              <Card className="bg-white border border-zinc-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#9EB038]/10 flex items-center justify-center flex-shrink-0">
                    <Workflow className="h-6 w-6 text-[#9EB038]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 mb-2">Automações Práticas</h3>
                    <p className="text-sm text-zinc-600">
                      Economize 5h/semana em tarefas operacionais e repetitivas
                    </p>
                  </div>
                </div>
              </Card>

              {/* Módulo 4 */}
              <Card className="bg-white border border-zinc-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#9EB038]/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-[#9EB038]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 mb-2">Estratégia com IA</h3>
                    <p className="text-sm text-zinc-600">
                      Economize 2h/semana em planejamento e análise estratégica
                    </p>
                  </div>
                </div>
              </Card>

              {/* Módulo 5 */}
              <Card className="bg-white border border-zinc-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#9EB038]/10 flex items-center justify-center flex-shrink-0">
                    <Target className="h-6 w-6 text-[#9EB038]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 mb-2">Projetos Reais</h3>
                    <p className="text-sm text-zinc-600">
                      Implemente cases que geram resultados mensuráveis
                    </p>
                  </div>
                </div>
              </Card>

              {/* Módulo 6 */}
              <Card className="bg-white border border-zinc-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#9EB038]/10 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-6 w-6 text-[#9EB038]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 mb-2">Inovação Contínua</h3>
                    <p className="text-sm text-zinc-600">
                      Acesso antecipado a ferramentas e metodologias Beta
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Final CTA */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Card className="bg-[#9EB038]/5 border-[#9EB038]/20 p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#2F302B]">
                Pronto para multiplicar seus resultados?
              </h2>
              <p className="text-zinc-600 mb-8 text-lg">
                Escolha o plano ideal e acelere sua transformação com IA
              </p>
              <Button 
                className="bg-[#C5D63D] hover:bg-[#B5C62D] text-zinc-900 font-bold text-sm uppercase tracking-wide rounded-full px-8 py-6"
                onClick={() => {
                  document.getElementById('precos')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                VER OPÇÕES DE UPGRADE
              </Button>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
