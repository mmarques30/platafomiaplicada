import { AbaDuvidas } from "@/components/evolucao/AbaDuvidas";

export default function MinhasDuvidas() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        Minhas <span className="text-primary">Dúvidas</span>
      </h1>
      
      <AbaDuvidas />
    </div>
  );
}
