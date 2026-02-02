import { Check, Minus, Ticket, Copy, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTitle } from "@/components/shared/PageTitle";
import { toast } from "sonner";

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

const COUPON_CODE = "ComunidadeIAplicada";
const PURCHASE_LINK = "https://clkdmg.site/pay/iaplicadaacademy";

export default function Cupons() {
  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(COUPON_CODE);
    toast.success("Cupom copiado!", {
      description: "Cole no checkout para aplicar o desconto.",
    });
  };

  const handlePurchase = () => {
    window.open(PURCHASE_LINK, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 px-4 space-y-8">
        {/* Header */}
        <PageTitle 
          primary="Cupons" 
          secondary="exclusivos"
          icon={<Ticket className="h-7 w-7 text-emerald-500" />}
        />

        {/* Card CTA com Cupom */}
        <Card className="border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl text-emerald-700 dark:text-emerald-400">
              Cupom de Desconto
            </CardTitle>
            <CardDescription className="text-base">
              Use o cupom abaixo no checkout para garantir seu desconto exclusivo
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 bg-white dark:bg-background rounded-lg border-2 border-dashed border-emerald-400 px-6 py-3">
              <code className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                {COUPON_CODE}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyCoupon}
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              onClick={handlePurchase}
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold gap-2"
            >
              Comprar Agora
              <ExternalLink className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Tabela Comparativa */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-center">
            Compare e escolha a melhor opção
          </h2>
          
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Header da Tabela */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                <div className="p-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    Características
                  </span>
                </div>
                
                {/* IAplicada - Destacado */}
                <div className="p-4 rounded-t-xl bg-primary/10 border-2 border-primary border-b-0 text-center">
                  <Badge className="mb-2 bg-primary text-primary-foreground">
                    Recomendado
                  </Badge>
                  <h3 className="font-bold text-lg text-primary">IAplicada</h3>
                </div>
                
                {/* Concorrentes */}
                <div className="p-4 rounded-t-xl bg-muted/50 text-center">
                  <h3 className="font-medium text-muted-foreground mt-6">Adapta</h3>
                </div>
                <div className="p-4 rounded-t-xl bg-muted/50 text-center">
                  <h3 className="font-medium text-muted-foreground mt-6">Viver IA</h3>
                </div>
                <div className="p-4 rounded-t-xl bg-muted/50 text-center">
                  <h3 className="font-medium text-muted-foreground mt-6">Asimov</h3>
                </div>
              </div>

              {/* Linhas de Features */}
              {features.map((feature, index) => (
                <div 
                  key={feature.name}
                  className={`grid grid-cols-5 gap-2 ${
                    index % 2 === 0 ? "bg-muted/30" : ""
                  }`}
                >
                  <div className="p-4 flex items-center">
                    <span className="text-sm font-medium">{feature.name}</span>
                  </div>
                  
                  {/* IAplicada */}
                  <div className="p-4 bg-primary/5 border-x-2 border-primary flex items-center justify-center">
                    {feature.iaplicada ? (
                      <Check className="h-5 w-5 text-primary" />
                    ) : (
                      <Minus className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </div>
                  
                  {/* Adapta */}
                  <div className="p-4 flex items-center justify-center">
                    {feature.adapta ? (
                      <Check className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Minus className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </div>
                  
                  {/* Viver IA */}
                  <div className="p-4 flex items-center justify-center">
                    {feature.viverIA ? (
                      <Check className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Minus className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </div>
                  
                  {/* Asimov */}
                  <div className="p-4 flex items-center justify-center">
                    {feature.asimov ? (
                      <Check className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Minus className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </div>
                </div>
              ))}

              {/* Footer da coluna IAplicada */}
              <div className="grid grid-cols-5 gap-2">
                <div className="p-4" />
                <div className="p-4 rounded-b-xl bg-primary/10 border-2 border-primary border-t-0 flex justify-center">
                  <Button 
                    onClick={handlePurchase}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2"
                  >
                    Começar Agora
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4 rounded-b-xl bg-muted/50" />
                <div className="p-4 rounded-b-xl bg-muted/50" />
                <div className="p-4 rounded-b-xl bg-muted/50" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
