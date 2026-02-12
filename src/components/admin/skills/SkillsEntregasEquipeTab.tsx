import { useEntregasEquipe } from "@/hooks/useEntregasEquipe";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Package, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import SkillsTabActions from "./SkillsTabActions";

const statusLabels: Record<string, string> = {
  pendente: "Pendente", em_andamento: "Em Andamento", concluido: "Concluído", bloqueado: "Bloqueado",
};
const statusColors: Record<string, string> = {
  pendente: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30",
  em_andamento: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  concluido: "bg-green-500/10 text-green-700 border-green-500/30",
  bloqueado: "bg-red-500/10 text-red-700 border-red-500/30",
};

export default function SkillsEntregasEquipeTab({ equipeId }: { equipeId: string }) {
  const { entregas, isLoading } = useEntregasEquipe(equipeId);
  const queryClient = useQueryClient();

  if (isLoading) return <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" /></div>;

  if (!entregas.length) return (
    <div className="text-center py-12 text-muted-foreground">
      <div className="flex justify-end mb-2">
        <SkillsTabActions
          onClear={async () => {
            const { error } = await supabase.from("entregas_equipe_skills").delete().eq("equipe_id", equipeId);
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ["entregas-equipe", equipeId] });
          }}
          hasData={false}
          clearDescription="Todas as entregas da equipe serão removidas."
        />
      </div>
      <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
      <p>Nenhuma entrega registrada pela equipe ainda.</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-end mb-2">
        <SkillsTabActions
          onClear={async () => {
            const { error } = await supabase.from("entregas_equipe_skills").delete().eq("equipe_id", equipeId);
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ["entregas-equipe", equipeId] });
          }}
          hasData={entregas.length > 0}
          clearDescription="Todas as entregas da equipe serão removidas."
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead>Arquivos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entregas.map(e => (
            <TableRow key={e.id}>
              <TableCell>
                <div>
                  <span className="font-medium">{e.titulo_equipe}</span>
                  {e.notas && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{e.notas}</p>}
                </div>
              </TableCell>
              <TableCell><Badge variant="outline" className={statusColors[e.status_equipe]}>{statusLabels[e.status_equipe] || e.status_equipe}</Badge></TableCell>
              <TableCell>{e.prioridade_equipe || "-"}</TableCell>
              <TableCell>{e.responsavel?.nome_completo || "-"}</TableCell>
              <TableCell>{e.prazo_equipe ? format(new Date(e.prazo_equipe), "dd/MM/yyyy") : "-"}</TableCell>
              <TableCell><div className="flex items-center gap-2 min-w-[80px]"><Progress value={e.progresso} className="h-2 flex-1" /><span className="text-xs">{e.progresso}%</span></div></TableCell>
              <TableCell>
                {e.arquivos.length > 0 ? (
                  <div className="flex flex-col gap-0.5">
                    {e.arquivos.map((a, i) => (
                      <a key={i} href={a.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />{a.nome}
                      </a>
                    ))}
                  </div>
                ) : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
