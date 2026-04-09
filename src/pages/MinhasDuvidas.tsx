import { PageTitle } from "@/components/shared/PageTitle";
import { PainelEstrategico } from "@/components/academy/PainelEstrategico";

export default function MinhasDuvidas() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <PageTitle primary="Meu" secondary="Plano" />
        <p className="text-sm text-muted-foreground mt-1">
          Acompanhe seu progresso estratégico baseado no diagnóstico
        </p>
      </div>
      <PainelEstrategico />
    </div>
  );
}
