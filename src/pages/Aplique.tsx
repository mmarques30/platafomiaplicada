import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Aplique() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Card Academy - Tema Claro */}
        <Card className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-lg">
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
            className="w-full bg-[#C5D63D] hover:bg-[#B5C62D] text-zinc-900 font-bold text-sm uppercase tracking-wide rounded-full py-6"
            onClick={() => window.open('https://pay.kiwify.com.br/yiGMp4m', '_blank')}
          >
            QUERO APLICAR NA ACADEMY
          </Button>
        </Card>

        {/* Card Mentoria - Tema Escuro */}
        <Card className="bg-zinc-900 border border-[#C5D63D]/30 rounded-2xl p-8 shadow-lg relative">
          <span className="absolute top-6 right-6 bg-[#C5D63D] text-zinc-900 text-xs font-bold px-3 py-1 rounded-full">
            Apenas 30 vagas
          </span>
          
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
            className="w-full border-2 border-[#C5D63D] bg-[#C5D63D]/10 hover:bg-[#C5D63D]/20 text-[#C5D63D] font-bold text-sm uppercase tracking-wide rounded-full py-6"
            onClick={() => window.open('https://wa.me/5531973130846?text=Olá!%20Gostaria%20de%20me%20candidatar%20à%20Mentoria%20IAplicada', '_blank')}
          >
            QUERO ME CANDIDATAR
          </Button>
        </Card>
      </div>
    </div>
  );
}
