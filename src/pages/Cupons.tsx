import { Check, Minus, Copy, ExternalLink, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/shared/PageTitle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import mariAvatar from "@/assets/mariana-avatar.png";
import { useVisitorExpiration } from "@/hooks/useVisitorExpiration";
import { useUserRole } from "@/hooks/useUserRole";

const features = [
  { name: "Resultados reais em 30 dias", iaplicada: true, adapta: false, viverIA: false, asimov: false },
  { name: "Comunidade ativa com cases", iaplicada: true, adapta: false, viverIA: false, asimov: false },
  { name: "Certificação por trilha", iaplicada: true, adapta: false, viverIA: false, asimov: true },
  { name: "Trilhas por objetivo específico", iaplicada: true, adapta: false, viverIA: false, asimov: false },
  { name: "Templates e prompts testados", iaplicada: true, adapta: false, viverIA: false, asimov: true },
  { name: "Formação teórica + foco prático", iaplicada: true, adapta: false, viverIA: false, asimov: false },
  { name: "Escala para times e empresas", iaplicada: true, adapta: false, viverIA: false, asimov: false },
  { name: "Atualização constante 2026", iaplicada: true, adapta: false, viverIA: false, asimov: false },
  { name: "+15 LLMs integradas", iaplicada: false, adapta: true, viverIA: false, asimov: false },
  { name: "Cursos genéricos por área", iaplicada: false, adapta: true, viverIA: true, asimov: true },
  { name: "Foco em freelance/side hustle", iaplicada: false, adapta: false, viverIA: true, asimov: false },
];

const PURCHASE_LINK = "https://clkdmg.site/pay/iaplicadaacademy";

export default function Cupons() {
  const { isVisitante } = useUserRole();
  const { data: expirationData } = useVisitorExpiration();
  
  // Cupom dinâmico: usa o cupom especial do visitante ou padrão
  const couponCode = isVisitante && expirationData?.cupomEspecial 
    ? expirationData.cupomEspecial 
    : "Academy12";
  
  const desconto = couponCode === "Academy15" ? "15%" : "12%";

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(couponCode);
    toast.success("Cupom copiado!", {
      description: "Cole no checkout para aplicar o desconto.",
    });
  };

  const handlePurchase = () => {
    window.open(PURCHASE_LINK, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 px-4 space-y-6">
        {/* Header - Sem ícone */}
        <PageTitle 
          primary="Descontos" 
          secondary="IAplicada"
        />

        {/* Sistema de Abas */}
        <Tabs defaultValue="academy" className="w-full">
          <TabsList className="bg-muted/50 rounded-full p-1">
            <TabsTrigger 
              value="academy" 
              className="rounded-full px-6 data-[state=active]:bg-aplicada-green-100 data-[state=active]:text-aplicada-green-700 data-[state=active]:shadow-sm"
            >
              Academy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="academy" className="space-y-6 mt-4">
            {/* Descrição introdutória */}
            <p className="text-muted-foreground text-base">
              O Academy é o primeiro passo da sua jornada na IAplicada. Aqui você começa sua trilha de aprendizado em Inteligência Artificial aplicada ao seu dia a dia profissional.
              {isVisitante && expirationData?.diasRestantes != null && expirationData.diasRestantes <= 7 && (
                <span className="block mt-2 text-sm font-medium text-primary">
                  🎁 Você tem um cupom especial de {desconto} de desconto!
                </span>
              )}
            </p>

            {/* Card de Cupom Compacto */}
            <div className="bg-aplicada-green-600/90 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-white text-sm font-medium">Cupom ({desconto} off):</span>
                <code className="text-white font-bold text-lg tracking-wider">
                  {couponCode}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCoupon}
                  className="text-white hover:text-white hover:bg-white/20"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
                <Button 
                  onClick={handlePurchase}
                  size="sm"
                  className="bg-white text-aplicada-green-700 hover:bg-white/90 font-semibold"
                >
                  Comprar Agora
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Tabela Comparativa */}
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-center mb-4">
                Compare e escolha a melhor opção
              </h2>
              
              <div className="overflow-x-auto rounded-xl border border-aplicada-green-400/30 bg-gradient-to-br from-aplicada-cream/60 via-aplicada-green-100/40 to-aplicada-green-200/30">
                <div className="min-w-[700px]">
                  {/* Header da Tabela */}
                  <div className="grid grid-cols-5 gap-0">
                    <div className="p-4 flex items-end">
                      <span className="text-sm font-semibold text-aplicada-green-600">
                        Características
                      </span>
                    </div>
                    
                    {/* IAplicada - Destacado */}
                    <div className="p-4 rounded-t-xl bg-primary text-center">
                      <Badge className="mb-2 bg-white text-primary font-semibold">
                        Recomendado
                      </Badge>
                      <h3 className="font-bold text-lg text-white">IAplicada</h3>
                    </div>
                    
                    {/* Concorrentes */}
                    <div className="p-4 text-center flex items-end justify-center">
                      <h3 className="font-medium text-foreground/70">Adapta</h3>
                    </div>
                    <div className="p-4 text-center flex items-end justify-center">
                      <h3 className="font-medium text-foreground/70">Viver IA</h3>
                    </div>
                    <div className="p-4 text-center flex items-end justify-center">
                      <h3 className="font-medium text-foreground/70">Asimov</h3>
                    </div>
                  </div>

                  {/* Linhas de Features */}
                  {features.map((feature, index) => (
                    <div 
                      key={feature.name}
                      className={`grid grid-cols-5 gap-0 ${
                        index % 2 === 0 ? "bg-aplicada-green-200/20" : "bg-white/30"
                      }`}
                    >
                      <div className="p-3 flex items-center border-b border-aplicada-green-400/20">
                        <span className="text-sm font-medium text-foreground">{feature.name}</span>
                      </div>
                      
                      {/* IAplicada */}
                      <div className="p-3 bg-primary/10 border-x-2 border-primary border-b border-aplicada-green-400/20 flex items-center justify-center">
                        {feature.iaplicada ? (
                          <Check className="h-5 w-5 text-primary font-bold" strokeWidth={3} />
                        ) : (
                          <Minus className="h-5 w-5 text-muted-foreground/40" />
                        )}
                      </div>
                      
                      {/* Adapta */}
                      <div className="p-3 flex items-center justify-center border-b border-aplicada-green-400/20">
                        {feature.adapta ? (
                          <Check className="h-5 w-5 text-foreground/50" />
                        ) : (
                          <Minus className="h-5 w-5 text-foreground/30" />
                        )}
                      </div>
                      
                      {/* Viver IA */}
                      <div className="p-3 flex items-center justify-center border-b border-aplicada-green-400/20">
                        {feature.viverIA ? (
                          <Check className="h-5 w-5 text-foreground/50" />
                        ) : (
                          <Minus className="h-5 w-5 text-foreground/30" />
                        )}
                      </div>
                      
                      {/* Asimov */}
                      <div className="p-3 flex items-center justify-center border-b border-aplicada-green-400/20">
                        {feature.asimov ? (
                          <Check className="h-5 w-5 text-foreground/50" />
                        ) : (
                          <Minus className="h-5 w-5 text-foreground/30" />
                        )}
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            </section>

            {/* CTA Final com foto da Mari */}
            <section className="flex flex-col md:flex-row items-center gap-6 py-6">
              {/* Foto da Mari */}
              <div className="flex-shrink-0">
                <img 
                  src={mariAvatar} 
                  alt="Mariana - Mentora IAplicada" 
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-primary shadow-lg"
                />
              </div>
              
              {/* Texto */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <h3 className="text-xl md:text-2xl font-bold text-foreground">
                  A escola de IA prática com aplicação real que você precisa
                </h3>
                <p className="text-muted-foreground text-sm md:text-base">
                  Na IAplicada Academy, você não aprende só teoria — você implementa IA no seu trabalho desde a primeira semana. 
                  Trilhas focadas em resultados, comunidade ativa e suporte para transformar seu dia a dia profissional.
                </p>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
