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
                  <p>3 projetos práticos (avalio e direciono sua execução).</p>
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
        <section className="py-16 px-4 bg-zinc-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2F302B] text-center mb-12">
              Compare os planos
            </h2>
            
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="text-left p-6 text-zinc-600 font-medium">Recursos</th>
                    <th className="text-center p-6 text-[#2F302B] font-bold">Academy</th>
                    <th className="text-center p-6 text-[#2F302B] font-bold">Mentoria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr>
                    <td className="p-4 text-zinc-700">Acesso à Plataforma (1 ano)</td>
                    <td className="text-center p-4"><Check className="h-5 w-5 text-[#9EB038] mx-auto" /></td>
                    <td className="text-center p-4"><Check className="h-5 w-5 text-[#9EB038] mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 text-zinc-700">Trilhas do Iniciante ao Avançado</td>
                    <td className="text-center p-4"><Check className="h-5 w-5 text-[#9EB038] mx-auto" /></td>
                    <td className="text-center p-4"><Check className="h-5 w-5 text-[#9EB038] mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 text-zinc-700">4 vídeos novos/semana</td>
                    <td className="text-center p-4"><Check className="h-5 w-5 text-[#9EB038] mx-auto" /></td>
                    <td className="text-center p-4"><Check className="h-5 w-5 text-[#9EB038] mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 text-zinc-700">Q&A Semanal (19h30)</td>
                    <td className="text-center p-4"><Check className="h-5 w-5 text-[#9EB038] mx-auto" /></td>
                    <td className="text-center p-4"><Check className="h-5 w-5 text-[#9EB038] mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 text-zinc-700">Assistente IA 24/7 (Mari)</td>
                    <td className="text-center p-4"><Check className="h-5 w-5 text-[#9EB038] mx-auto" /></td>
                    <td className="text-center p-4"><Check className="h-5 w-5 text-[#9EB038] mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 text-zinc-700">Bibliotecas (100+ prompts)</td>
                    <td className="text-center p-4"><Check className="h-5 w-5 text-[#9EB038] mx-auto" /></td>
                    <td className="text-center p-4"><Check className="h-5 w-5 text-[#9EB038] mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 text-zinc-700">Diagnóstico + Dashboard ROI</td>
                    <td className="text-center p-4"><Check className="h-5 w-5 text-[#9EB038] mx-auto" /></td>
                    <td className="text-center p-4"><Check className="h-5 w-5 text-[#9EB038] mx-auto" /></td>
                  </tr>
                  <tr className="bg-zinc-50">
                    <td className="p-4 text-zinc-700 font-medium">6 encontros/mês (2h)</td>
                    <td className="text-center p-4 text-zinc-300">—</td>
                    <td className="text-center p-4"><Check className="h-5 w-5 text-[#9EB038] mx-auto" /></td>
                  </tr>
                  <tr className="bg-zinc-50">
                    <td className="p-4 text-zinc-700 font-medium">3 projetos práticos com feedback</td>
                    <td className="text-center p-4 text-zinc-300">—</td>
                    <td className="text-center p-4"><Check className="h-5 w-5 text-[#9EB038] mx-auto" /></td>
                  </tr>
                  <tr className="bg-zinc-50">
                    <td className="p-4 text-zinc-700 font-medium">Comunidade Premium</td>
                    <td className="text-center p-4 text-zinc-300">—</td>
                    <td className="text-center p-4"><Check className="h-5 w-5 text-[#9EB038] mx-auto" /></td>
                  </tr>
                  <tr className="bg-zinc-50">
                    <td className="p-4 text-zinc-700 font-medium">Acesso antecipado (Beta)</td>
                    <td className="text-center p-4 text-zinc-300">—</td>
                    <td className="text-center p-4"><Check className="h-5 w-5 text-[#9EB038] mx-auto" /></td>
                  </tr>
                  <tr className="bg-zinc-50">
                    <td className="p-4 text-zinc-700 font-medium">Certificado Premium</td>
                    <td className="text-center p-4 text-zinc-300">—</td>
                    <td className="text-center p-4"><Check className="h-5 w-5 text-[#9EB038] mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
        
        {/* Seção Aprenda na Prática */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Título e Subtítulo */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-[#2F302B] mb-4">
                Aprenda na prática.
                <br />
                <span className="text-[#9EB038]">4 módulos novos</span> por semana.
              </h2>
              
              <p className="text-[#2F302B]/70 text-lg max-w-3xl mx-auto">
                Liberação progressiva para acompanhar atualizações de IA e tendências de mercado.
                <br />
                Essas são as trilhas que mais economizam tempo e aceleram carreira:
              </p>
            </div>
            
            {/* Grid 3 colunas - primeira linha */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Card Claude Avançado */}
              <Card className="bg-white border-zinc-200 p-6">
                <Sparkles className="h-8 w-8 text-[#9EB038] mb-4" />
                <h3 className="text-xl font-bold text-[#2F302B] mb-2">Claude Avançado</h3>
                <p className="text-zinc-600 mb-4">Análise de documentos em 2 minutos</p>
                <p className="text-[#9EB038] font-semibold">Economiza 10h/semana</p>
              </Card>
              
              {/* Card Planilhas e Dados */}
              <Card className="bg-white border-zinc-200 p-6">
                <Table2 className="h-8 w-8 text-[#9EB038] mb-4" />
                <h3 className="text-xl font-bold text-[#2F302B] mb-2">Planilhas e Dados</h3>
                <p className="text-zinc-600 mb-4">Transforme caos em insights acionáveis</p>
                <p className="text-[#9EB038] font-semibold">Economiza 5-8h/semana</p>
              </Card>
              
              {/* Card Make: Automação */}
              <Card className="bg-white border-zinc-200 p-6">
                <Workflow className="h-8 w-8 text-[#9EB038] mb-4" />
                <h3 className="text-xl font-bold text-[#2F302B] mb-2">Make: Automação</h3>
                <p className="text-zinc-600 mb-4">Workflows que Zapier não consegue fazer</p>
                <p className="text-[#9EB038] font-semibold">Economiza 12-15h/semana</p>
              </Card>
            </div>
            
            {/* Grid 2 colunas centralizadas - segunda linha */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Card IA para Vendas */}
              <Card className="bg-white border-zinc-200 p-6">
                <TrendingUp className="h-8 w-8 text-[#9EB038] mb-4" />
                <h3 className="text-xl font-bold text-[#2F302B] mb-2">IA para Vendas</h3>
                <p className="text-zinc-600 mb-4">Acelere seu pipeline de vendas</p>
                <p className="text-[#9EB038] font-semibold">Prospecção 3x mais rápida</p>
              </Card>
              
              {/* Card Dashboard & BI */}
              <Card className="bg-white border-zinc-200 p-6">
                <Lightbulb className="h-8 w-8 text-[#9EB038] mb-4" />
                <h3 className="text-xl font-bold text-[#2F302B] mb-2">Dashboard & BI</h3>
                <p className="text-zinc-600 mb-4">Decisões baseadas em dados reais</p>
                <p className="text-[#9EB038] font-semibold">Economiza 5-8h/semana</p>
              </Card>
            </div>
            
            {/* CTA Button */}
            <div className="text-center mt-12">
              <Button 
                className="bg-[#C5D63D] hover:bg-[#B5C62D] text-zinc-900 font-bold text-sm uppercase tracking-wide rounded-full px-8 py-6"
                onClick={() => {
                  document.getElementById('precos')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                QUERO SER UM APLICADO
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
