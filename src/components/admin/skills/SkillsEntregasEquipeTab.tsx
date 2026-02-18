import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Package, ExternalLink, ChevronDown, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  const queryClient = useQueryClient();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { data: entregas = [], isLoading, isError } = useQuery({
    queryKey: ["entregas-equipe-skills-admin", equipeId],
    queryFn: async () => {
      if (!equipeId) return [];
      const { data, error } = await supabase
        .from("entregas_equipe_skills")
        .select(`
          *,
          entregas_skills:entrega_id (titulo, descricao, status, prioridade),
          backlog_skills:projeto_id (titulo),
          profiles:responsavel_id (nome_completo, avatar_url),
          subtarefas_entregas_skills (*)
        `)
        .eq("equipe_id", equipeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        arquivos: d.arquivos || [],
        entrega_original: d.entregas_skills || null,
        projeto: d.backlog_skills || null,
        responsavel: d.profiles || null,
        subtarefas: d.subtarefas_entregas_skills || [],
      }));
    },
    enabled: !!equipeId,
  });

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (isLoading) return <div className="flex justify-center py-8"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" /></div>;

  if (isError) return (
    <div className="text-center py-12 text-muted-foreground">
      <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
      <p>Erro ao carregar entregas da equipe.</p>
      <p className="text-xs mt-1">Tente recarregar a página.</p>
    </div>
  );

  if (!entregas.length) return (
    <div className="text-center py-12 text-muted-foreground">
      <div className="flex justify-end mb-2">
        <SkillsTabActions
          onClear={async () => {
            const { error } = await supabase.from("entregas_equipe_skills").delete().eq("equipe_id", equipeId);
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ["entregas-equipe-skills-admin", equipeId] });
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
            queryClient.invalidateQueries({ queryKey: ["entregas-equipe-skills-admin", equipeId] });
          }}
          hasData={entregas.length > 0}
          clearDescription="Todas as entregas da equipe serão removidas."
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Projeto</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead>Subtarefas</TableHead>
            <TableHead>Arquivos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entregas.map((e: any) => {
            const subtarefas = e.subtarefas || [];
            const concluidas = subtarefas.filter((s: any) => s.concluida).length;
            const hasSubtarefas = subtarefas.length > 0;
            const isExpanded = expandedRows.has(e.id);

            return (
              <>
                <TableRow key={e.id} className={hasSubtarefas ? "cursor-pointer hover:bg-muted/50" : ""} onClick={() => hasSubtarefas && toggleRow(e.id)}>
                  <TableCell className="w-8 px-2">
                    {hasSubtarefas && (isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{e.titulo_equipe}</span>
                      {e.notas && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{e.notas}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {e.projeto?.titulo ? (
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{e.projeto.titulo}</Badge>
                    ) : "-"}
                  </TableCell>
                  <TableCell><Badge variant="outline" className={statusColors[e.status_equipe]}>{statusLabels[e.status_equipe] || e.status_equipe}</Badge></TableCell>
                  <TableCell>{e.prioridade_equipe || "-"}</TableCell>
                  <TableCell>{e.responsavel?.nome_completo || "-"}</TableCell>
                  <TableCell>{e.prazo_equipe ? format(new Date(e.prazo_equipe), "dd/MM/yyyy") : "-"}</TableCell>
                  <TableCell><div className="flex items-center gap-2 min-w-[80px]"><Progress value={e.progresso} className="h-2 flex-1" /><span className="text-xs">{e.progresso}%</span></div></TableCell>
                  <TableCell>
                    {hasSubtarefas ? (
                      <Badge variant="outline" className={concluidas === subtarefas.length ? "bg-green-500/10 text-green-700 border-green-500/30" : "bg-blue-500/10 text-blue-700 border-blue-500/30"}>
                        {concluidas}/{subtarefas.length}
                      </Badge>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell>
                    {e.arquivos.length > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        {e.arquivos.map((a: any, i: number) => (
                          <a key={i} href={a.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1" onClick={(ev) => ev.stopPropagation()}>
                            <ExternalLink className="h-3 w-3" />{a.nome}
                          </a>
                        ))}
                      </div>
                    ) : "-"}
                  </TableCell>
                </TableRow>
                {isExpanded && subtarefas.map((s: any) => (
                  <TableRow key={s.id} className="bg-muted/30">
                    <TableCell />
                    <TableCell colSpan={8} className="pl-10">
                      <div className="flex items-center gap-2 text-sm">
                        {s.concluida ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                        <span className={s.concluida ? "line-through text-muted-foreground" : ""}>{s.titulo}</span>
                      </div>
                    </TableCell>
                    <TableCell />
                  </TableRow>
                ))}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
