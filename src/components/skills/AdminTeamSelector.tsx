import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSkillsAdminTeam } from "@/contexts/SkillsAdminTeamContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";

export default function AdminTeamSelector() {
  const { selectedEquipeId, setSelectedEquipeId } = useSkillsAdminTeam();

  const { data: equipes, isLoading } = useQuery({
    queryKey: ["equipes-skills-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipes_skills")
        .select("id, nome, empresa_nome")
        .order("empresa_nome");
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return null;

  if (!equipes?.length) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-muted-foreground">
        Nenhuma equipe cadastrada.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <Building2 className="h-10 w-10 text-muted-foreground" />
      <h2 className="text-lg font-semibold">Selecione a equipe para visualizar</h2>
      <p className="text-sm text-muted-foreground max-w-md text-center">
        Como administrador, escolha qual equipe/empresa deseja acompanhar.
      </p>
      <Select value={selectedEquipeId ?? ""} onValueChange={setSelectedEquipeId}>
        <SelectTrigger className="w-72">
          <SelectValue placeholder="Escolha uma equipe" />
        </SelectTrigger>
        <SelectContent>
          {equipes.map((eq) => (
            <SelectItem key={eq.id} value={eq.id}>
              {eq.empresa_nome ? `${eq.empresa_nome} — ${eq.nome}` : eq.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
