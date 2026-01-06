import { AbaDuvidas } from "@/components/evolucao/AbaDuvidas";
import { PageTitle } from "@/components/shared/PageTitle";

export default function MinhasDuvidas() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageTitle primary="Minhas" secondary="Dúvidas" />
      
      <AbaDuvidas />
    </div>
  );
}
