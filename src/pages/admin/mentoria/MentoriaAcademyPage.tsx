import { Component, ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUsers } from "@/hooks/admin/useUsers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, ExternalLink, Eye, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { adminTheme } from "@/components/admin/adminTheme";
import { DiagnosticoAcademyPanel } from "@/components/mentoria/DiagnosticoAcademyPanel";
import { DiagnosticoAdmin } from "@/components/admin/mentoria/DiagnosticoAdmin";

// Boundary local — pega erro do DiagnosticoAcademyPanel pra que o admin
// veja a causa em vez de uma tela em branco. Mari reportou "seleciono a
// Ariane mas não aparece nada"; o suspeito principal é o painel quebrar
// por insight_ia com shape inesperado.
class PanelErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error("[DiagnosticoAcademyPanel] crash:", error);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm">
          <p className="font-semibold text-red-900">Erro ao renderizar o painel do aluno</p>
          <p className="mt-1 text-red-900/80">{this.state.error.message}</p>
          <p className="mt-2 text-xs text-red-900/60">
            Provavelmente o `insight_ia` está com um campo faltando ou em formato
            inesperado. Tente regerar o insight pelo botão acima.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function MentoriaAcademyPage() {
  const navigate = useNavigate();
  const { data: allUsers = [] } = useUsers();
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Filtrar apenas usuários Academy
  const users = allUsers.filter(u => u.plano_mentoria === "academy");

  // Busca o diagnóstico do mentorado selecionado (mesma estrutura do PreviewPaineisPage)
  const { data: diagnosticoUsuario, isLoading: loadingDiagnostico, error: diagnosticoError } = useQuery({
    queryKey: ["diagnostico-usuario-academy", selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return null;
      const { data, error } = await supabase
        .from("formulario_diagnostico")
        .select("*")
        .eq("user_id", selectedUserId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedUserId,
  });

  return (
    <div className={adminTheme.page}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className={adminTheme.buttonIcon} onClick={() => navigate("/admin/mentoria")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className={adminTheme.pageTitle}>Aluno Academy</h1>
          <p className={adminTheme.pageSubtitle}>Gerenciar mentorados do plano Academy</p>
        </div>
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 text-xs">
          {users.length} mentorados
        </Badge>
      </div>

      {/* Card de seleção compacto */}
      <Card className={adminTheme.card}>
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-4">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className={adminTheme.select}>
                  <SelectValue placeholder="Selecione um mentorado Academy" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedUserId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(`/mentoria/painel-diagnostico/${selectedUserId}`)
                }
                className="gap-1.5 whitespace-nowrap"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Ver como o aluno vê
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {users.length === 0 && (
        <div className={adminTheme.emptyState}>
          <Users className={adminTheme.emptyIcon} />
          <p className={adminTheme.emptyTitle}>Nenhum mentorado Academy</p>
          <p className={adminTheme.emptyDescription}>
            Não há mentorados com plano Academy cadastrados
          </p>
        </div>
      )}

      {/* Painel consolidado: mesmo layout que o aluno vê (DiagnosticoAcademyPanel)
          + bloco de ações admin (forçar finalização, editar etc) no topo. */}
      {selectedUserId && (
        <div className="space-y-6">
          {/* Ações administrativas (Forçar finalização, status, etc) */}
          <DiagnosticoAdmin userId={selectedUserId} allowManualInput={false} />

          {/* Preview no mesmo layout do aluno. Wrap em ErrorBoundary pra
              que erro de render do DiagnosticoAcademyPanel (campo faltando
              no insight_ia, payload inesperado etc) não derrube a página
              inteira e Mari saiba o que está acontecendo. */}
          {diagnosticoError ? (
            <Card className="border-red-300 bg-red-50">
              <CardContent className="py-6 space-y-2 text-sm">
                <p className="font-semibold text-red-900">Erro ao buscar diagnóstico</p>
                <p className="text-red-900/80">{(diagnosticoError as any)?.message ?? String(diagnosticoError)}</p>
              </CardContent>
            </Card>
          ) : loadingDiagnostico ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Carregando diagnóstico…</CardContent></Card>
          ) : diagnosticoUsuario ? (
            <div className="relative">
              <div className="absolute -top-3 left-4 z-10">
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                  <Eye className="h-3 w-3 mr-1" />
                  VISÃO DO ALUNO
                </Badge>
              </div>
              <div className="border-2 border-dashed border-amber-500/30 rounded-xl p-4 pt-6 bg-card/50">
                <PanelErrorBoundary>
                  <DiagnosticoAcademyPanel diagnostico={diagnosticoUsuario} />
                </PanelErrorBoundary>
              </div>
              <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Você está vendo exatamente o que o aluno vê no painel dele.</span>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Este mentorado ainda não preencheu o diagnóstico.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
