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

            {/* CTA Button */}
            <div className="mt-12">
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
