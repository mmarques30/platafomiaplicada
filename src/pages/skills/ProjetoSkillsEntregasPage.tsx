import { useSkillsMembro } from "@/hooks/useSkillsMembro";
import ProjetoSkillsEntregas from "@/components/skills/ProjetoSkillsEntregas";
import { Package } from "lucide-react";

export default function ProjetoSkillsEntregasPage() {
  const { equipeId, isLoading } = useSkillsMembro();

  if (isLoading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  if (!equipeId) return (
    <div className="text-center py-16 text-muted-foreground">
      <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
      <p>Nenhuma equipe vinculada.</p>
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Entregas da Equipe</h1>
        <p className="text-muted-foreground text-sm">Gerencie entregas, prazos e arquivos do seu time.</p>
      </div>
      <ProjetoSkillsEntregas equipeId={equipeId} />
    </div>
  );
}
