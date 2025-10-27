import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { StatusDiagnostico } from "@/components/mentoria/StatusDiagnostico";
import { ProximaSessao } from "@/components/mentoria/ProximaSessao";
import { TarefasUrgentes } from "@/components/mentoria/TarefasUrgentes";
import { NavegacaoRapida } from "@/components/mentoria/NavegacaoRapida";
import { ResumoProgresso } from "@/components/mentoria/ResumoProgresso";
import { PendenciasUrgentes } from "@/components/mentoria/PendenciasUrgentes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Mentoria() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Olá, {user?.user_metadata?.nome_completo?.split(' ')[0] || 'Mentorado'}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Bem-vindo ao seu painel de mentoria personalizado
        </p>
      </div>

      {/* Seção de Alertas/Pendências Urgentes */}
      <div className="mb-8">
        <PendenciasUrgentes />
      </div>

      {/* Grid Principal - Cards de Destaque */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Coluna 1: Diagnóstico */}
        <div>
          <StatusDiagnostico />
        </div>

        {/* Coluna 2: Próxima Sessão */}
        <div>
          <ProximaSessao />
        </div>

        {/* Coluna 3: Tarefas Urgentes */}
        <div>
          <TarefasUrgentes />
        </div>
      </div>

      {/* Resumo de Progresso */}
      <div className="mb-8">
        <ResumoProgresso />
      </div>

      {/* Navegação Rápida */}
      <NavegacaoRapida />
    </div>
  );
}
