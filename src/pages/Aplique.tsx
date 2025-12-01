import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogosTicker } from "@/components/LogosTicker";
import { ArrowLeft, Sparkles, Check, Table2, Workflow, TrendingUp, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoCompleta from "@/assets/logo-aplicada-marca-completa.png";
import backgroundSymbol from "@/assets/logos/background-symbol.png";

export default function Aplique() {
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
            Aplique <span className="text-[#9EB038]">agora</span>,
            <br />
            não amanhã.
          </h1>
          
          {/* Subtítulo */}
          <p className="text-[#2F302B]/80 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Inteligência Artificial que você usa hoje, do raciocínio à ação.
            <br />
            Comece <span className="text-[#9EB038] font-semibold">agora</span> a aplicar e ter resultados reais.
          </p>
          
          {/* CTA Button */}
            <Button 
              className="bg-[#C5D63D] hover:bg-[#B5C62D] text-zinc-900 font-bold text-sm uppercase tracking-wide rounded-full px-8 py-6"
              onClick={() => {
                document.getElementById('precos')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              GARANTIR MEU ACESSO AGORA
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
              {/* Card Academy - Tema Claro */}
              <Card className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-lg flex flex-col">
                <h2 className="text-3xl font-bold text-zinc-900 mb-6">Academy</h2>
                
                <p className="text-5xl font-bold text-zinc-900 mb-2">R$ 1.497</p>
                <p className="text-[#9EB038] font-medium mb-8">
                  Pague em até 12x ou à vista
                </p>
                
                <div className="space-y-4 text-zinc-600 text-sm mb-8">
                  <p>Plataforma completa por 1 ano. Acesso as gravações das aulas semanais e trilhas (do iniciante ao avançado).</p>
                  <p>Liberação gradual: 4 vídeos/semana (progresso guiado, sem sobrecarga).</p>
                  <p>Q&A semanal (19h30).</p>
                  <p>Assistente IA 24/7 (Mari) para dúvidas de implementação.</p>
                  <p>Bibliotecas: 100+ prompts e 50+ avaliações de ferramentas.</p>
                  <p>Diagnóstico por IA + Dashboard com horas poupadas e ROI.</p>
                </div>
                
                <Button 
                  className="w-full mt-auto bg-[#C5D63D] hover:bg-[#B5C62D] text-zinc-900 font-bold text-sm uppercase tracking-wide rounded-full py-6"
                  onClick={() => window.open('https://pay.kiwify.com.br/yiGMp4m', '_blank')}
                >
                  QUERO APLICAR NA ACADEMY
                </Button>
              </Card>

              {/* Card Mentoria - Tema Escuro */}
            <Card className="bg-zinc-900 border border-[#C5D63D]/30 rounded-2xl p-8 shadow-lg flex flex-col">
                
                <h2 className="text-3xl font-bold text-white mb-6">Mentoria</h2>
                
                <p className="text-4xl font-bold text-white mb-8">
                  Investimento sob<br />consulta
                </p>
                
                <div className="space-y-4 text-zinc-300 text-sm mb-8">
                  <p className="font-semibold text-white">Tudo da Academy +</p>
                  <p>6 encontros/mês (2h), práticos e colaborativos.</p>
                  <p>3 a 6 projetos práticos (avalio e direciono sua jornada)</p>
                  <p>Comunidade premium (networking com os Aplicados das melhores empresas do BR)</p>
                  <p>Acesso antecipado (Beta) + materiais exclusivos + certificado premium.</p>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-auto border-2 border-[#C5D63D] bg-[#C5D63D]/10 hover:bg-[#C5D63D]/20 text-[#C5D63D] font-bold text-sm uppercase tracking-wide rounded-full py-6"
                  onClick={() => window.open('https://wa.me/5531973130846?text=Olá!%20Gostaria%20de%20me%20candidatar%20à%20Mentoria%20IAplicada', '_blank')}
                >
                  QUERO ME CANDIDATAR
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
                      <div className="text-xl font-bold text-[#2F302B] mb-1">Academy</div>
                      <div className="text-2xl font-bold text-[#2F302B]">R$ 1.497</div>
                    </th>
                    <th className="w-[30%] p-6 text-center">
                      <div className="text-xl font-bold text-[#9EB038] mb-1">Mentoria</div>
                      <div className="text-lg font-medium text-[#9EB038]">Sob consulta</div>
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
                    <td className="px-4 py-4 text-sm text-zinc-600">Economia de tempo</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">3 a 5 horas por semana</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">6 a 10 horas por semana</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Payback esperado</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">1,5 mês (economia + produtividade)</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">Menos de 1 mês (ganhos estratégicos)</td>
                  </tr>
                  
                  {/* ACESSO E CONTEÚDO */}
                  <tr className="bg-[#9EB038]/10">
                    <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-[#9EB038] uppercase tracking-wide">
                      Acesso e conteúdo
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Acesso por 1 ano</td>
                    <td className="px-4 py-4 text-center border-l border-zinc-200">
                      <Check className="h-5 w-5 text-[#9EB038] mx-auto" />
                    </td>
                    <td className="px-4 py-4 text-center border-l border-zinc-200">
                      <Check className="h-5 w-5 text-[#9EB038] mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Gravação das aulas ao vivo</td>
                    <td className="px-4 py-4 text-center border-l border-zinc-200">
                      <Check className="h-5 w-5 text-[#9EB038] mx-auto" />
                    </td>
                    <td className="px-4 py-4 text-center border-l border-zinc-200">
                      <Check className="h-5 w-5 text-[#9EB038] mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Trilhas de aprendizado</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">Iniciante, Intermediário, Avançado</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">Iniciante, Intermediário, Avançado</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Liberação de conteúdo</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">4 vídeos por semana (gradual)</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">Acesso completo imediato</td>
                  </tr>
                  
                  {/* SUPORTE */}
                  <tr className="bg-[#9EB038]/10">
                    <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-[#9EB038] uppercase tracking-wide">
                      Suporte
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Q&A ao vivo semanal (19h30)</td>
                    <td className="px-4 py-4 text-center border-l border-zinc-200">
                      <Check className="h-5 w-5 text-[#9EB038] mx-auto" />
                    </td>
                    <td className="px-4 py-4 text-center border-l border-zinc-200">
                      <Check className="h-5 w-5 text-[#9EB038] mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Assistente IA 24/7 (Mari)</td>
                    <td className="px-4 py-4 text-center border-l border-zinc-200">
                      <Check className="h-5 w-5 text-[#9EB038] mx-auto" />
                    </td>
                    <td className="px-4 py-4 text-center border-l border-zinc-200">
                      <Check className="h-5 w-5 text-[#9EB038] mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Encontros práticos e colaborativos</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-400 border-l border-zinc-200">–</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">6 encontros/mês (2h cada)</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Comunidade exclusiva</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-400 border-l border-zinc-200">–</td>
                    <td className="px-4 py-4 text-center border-l border-zinc-200">
                      <Check className="h-5 w-5 text-[#9EB038] mx-auto" />
                    </td>
                  </tr>
                  
                  {/* RECURSOS */}
                  <tr className="bg-[#9EB038]/10">
                    <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-[#9EB038] uppercase tracking-wide">
                      Recursos
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Biblioteca de prompts</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">100+ prompts</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">100+ prompts</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Avaliação de ferramentas IA</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">50+ ferramentas</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">50+ ferramentas</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Diagnóstico IA personalizado</td>
                    <td className="px-4 py-4 text-center border-l border-zinc-200">
                      <Check className="h-5 w-5 text-[#9EB038] mx-auto" />
                    </td>
                    <td className="px-4 py-4 text-center border-l border-zinc-200">
                      <Check className="h-5 w-5 text-[#9EB038] mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Dashboard com métricas</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">Horas economizadas + ROI</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">Horas economizadas + ROI</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Acesso antecipado (Beta)</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-400 border-l border-zinc-200">–</td>
                    <td className="px-4 py-4 text-center border-l border-zinc-200">
                      <Check className="h-5 w-5 text-[#9EB038] mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Materiais exclusivos</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-400 border-l border-zinc-200">–</td>
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
                    <td className="px-4 py-4 text-sm text-zinc-600">Projetos práticos</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">Autodirigidos</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">3 projetos orientados e avaliados</td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Feedback detalhado</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-400 border-l border-zinc-200">–</td>
                    <td className="px-4 py-4 text-center border-l border-zinc-200">
                      <Check className="h-5 w-5 text-[#9EB038] mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-200">
                    <td className="px-4 py-4 text-sm text-zinc-600">Acompanhamento de progresso</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">Dashboard automatizado</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">Dashboard + avaliações 1:1</td>
                  </tr>
                  
                  {/* CERTIFICAÇÃO */}
                  <tr className="bg-[#9EB038]/10">
                    <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-[#9EB038] uppercase tracking-wide">
                      Certificação
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 text-sm text-zinc-600">Certificado digital</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">Por trilha concluída</td>
                    <td className="px-4 py-4 text-center text-sm text-zinc-700 border-l border-zinc-200">Trilhas + Projetos (premium)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Seção Trilhas em Destaque */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            {/* Título */}
            <h2 className="text-3xl md:text-5xl font-bold text-[#2F302B] mb-4">
              Aprenda na prática.
              <br />
              <span className="text-[#9EB038]">4 módulos novos</span> por semana.
            </h2>
            
            {/* Subtítulo */}
            <p className="text-[#2F302B]/70 text-lg max-w-3xl mx-auto mb-12">
              Liberação progressiva para acompanhar atualizações de IA e tendências de mercado.
              Essas são as trilhas que mais economizam tempo e aceleram carreira:
            </p>
            
            {/* Grid de Cards - 3 colunas */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Card 1: Claude Avançado */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 text-left hover:shadow-lg transition-shadow">
                <div className="bg-[#9EB038]/10 rounded-xl h-48 flex items-center justify-center mb-6">
                  <Sparkles className="h-20 w-20 text-[#9EB038]" />
                </div>
                <h3 className="text-xl font-bold text-[#2F302B] mb-2">Claude Avançado</h3>
                <p className="text-[#2F302B]/70 text-sm mb-4">
                  Análise de documentos em 2 minutos
                </p>
                <div className="border-t border-zinc-200 pt-4">
                  <p className="text-[#9EB038] text-sm font-medium">Economiza 10h/semana</p>
                </div>
              </div>

              {/* Card 2: Planilhas e Dados */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 text-left hover:shadow-lg transition-shadow">
                <div className="bg-[#9EB038]/10 rounded-xl h-48 flex items-center justify-center mb-6">
                  <Table2 className="h-20 w-20 text-[#9EB038]" />
                </div>
                <h3 className="text-xl font-bold text-[#2F302B] mb-2">Planilhas e Dados</h3>
                <p className="text-[#2F302B]/70 text-sm mb-4">
                  Transforme caos em insights acionáveis
                </p>
                <div className="border-t border-zinc-200 pt-4">
                  <p className="text-[#9EB038] text-sm font-medium">Economiza 5-8h/semana</p>
                </div>
              </div>

              {/* Card 3: Make Automação */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 text-left hover:shadow-lg transition-shadow">
                <div className="bg-[#9EB038]/10 rounded-xl h-48 flex items-center justify-center mb-6">
                  <Workflow className="h-20 w-20 text-[#9EB038]" />
                </div>
                <h3 className="text-xl font-bold text-[#2F302B] mb-2">Make: Automação Avançada</h3>
                <p className="text-[#2F302B]/70 text-sm mb-4">
                  Workflows que Zapier não consegue fazer
                </p>
                <div className="border-t border-zinc-200 pt-4">
                  <p className="text-[#9EB038] text-sm font-medium">Economiza 12-15h/semana</p>
                </div>
              </div>
            </div>
            
            {/* Segunda linha - 2 cards centralizados */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Card 4: IA para Vendas */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 text-left hover:shadow-lg transition-shadow">
                <div className="bg-[#9EB038]/10 rounded-xl h-48 flex items-center justify-center mb-6">
                  <TrendingUp className="h-20 w-20 text-[#9EB038]" />
                </div>
                <h3 className="text-xl font-bold text-[#2F302B] mb-2">IA para Vendas</h3>
                <p className="text-[#2F302B]/70 text-sm mb-4">
                  Acelere seu pipeline de vendas
                </p>
                <div className="border-t border-zinc-200 pt-4">
                  <p className="text-[#9EB038] text-sm font-medium">Prospecção 3x mais rápida</p>
                </div>
              </div>

              {/* Card 5: Dashboard & BI */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 text-left hover:shadow-lg transition-shadow">
                <div className="bg-[#9EB038]/10 rounded-xl h-48 flex items-center justify-center mb-6">
                  <Lightbulb className="h-20 w-20 text-[#9EB038]" />
                </div>
                <h3 className="text-xl font-bold text-[#2F302B] mb-2">Dashboard & BI</h3>
                <p className="text-[#2F302B]/70 text-sm mb-4">
                  Decisões baseadas em dados reais
                </p>
                <div className="border-t border-zinc-200 pt-4">
                  <p className="text-[#9EB038] text-sm font-medium">Economiza 5-8h/semana</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="mt-12 flex justify-center">
            <Button 
              className="bg-[#2F302B] hover:bg-[#3D3E39] text-white font-bold text-sm uppercase tracking-wide rounded-full px-8 py-6 animate-glow-pulse hover:shadow-[0_0_30px_rgba(197,214,61,0.7)] transition-shadow duration-300"
              onClick={() => {
                document.getElementById('precos')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              QUERO SER UM APLICADO
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
