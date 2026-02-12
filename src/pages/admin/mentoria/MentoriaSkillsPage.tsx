import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEquipesSkillsAdmin } from "@/hooks/admin/useEquipesSkillsAdmin";
import { adminTheme } from "@/components/admin/adminTheme";
import { Users, FileText, Brain, CalendarDays, Target, Package, BarChart3, FolderOpen, FileBarChart, ClipboardList } from "lucide-react";
import { ContratoSkillsManager } from "@/components/admin/skills/ContratoSkillsManager";
import DiagnosticosSkillsTab from "@/components/admin/skills/DiagnosticosSkillsTab";
import SecoesTrimestraisTab from "@/components/admin/skills/SecoesTrimestraisTab";
import ProjetosMapeadosTab from "@/components/admin/skills/ProjetosMapeadosTab";
import SkillsEntregasTab from "@/components/admin/skills/SkillsEntregasTab";
import SkillsMetricasTab from "@/components/admin/skills/SkillsMetricasTab";
import DocumentosSkillsManager from "@/components/admin/skills/DocumentosSkillsManager";
import ReportsSkillsManager from "@/components/admin/skills/ReportsSkillsManager";
import SkillsEntregasEquipeTab from "@/components/admin/skills/SkillsEntregasEquipeTab";

export default function MentoriaSkillsPage() {
  const { data: equipes, isLoading } = useEquipesSkillsAdmin();
  const [selectedEquipeId, setSelectedEquipeId] = useState<string | null>(null);

  const selectedEquipe = equipes?.find((e) => e.id === selectedEquipeId);

  return (
    <div className={adminTheme.page}>
      <div className={adminTheme.pageHeader}>
        <div className={adminTheme.pageTitleWrapper}>
          <Users className={adminTheme.pageIcon} />
          <div>
            <h1 className={adminTheme.pageTitle}>Mentoria Skills</h1>
            <p className={adminTheme.pageSubtitle}>Gestão completa do programa Skills por equipe</p>
          </div>
        </div>
      </div>

      {/* Seletor de equipe */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Equipe:</label>
        <Select value={selectedEquipeId ?? ""} onValueChange={(v) => setSelectedEquipeId(v || null)}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione uma equipe"} />
          </SelectTrigger>
          <SelectContent>
            {equipes?.map((eq) => (
              <SelectItem key={eq.id} value={eq.id}>
                {eq.nome} {eq.empresa_nome ? `— ${eq.empresa_nome}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedEquipeId ? (
        <Tabs defaultValue="contrato" className="mt-2">
          <TabsList className={adminTheme.tabsList}>
            <TabsTrigger value="contrato" className={adminTheme.tabsTrigger}>
              <FileText className={adminTheme.tabsIcon} /> Contrato
            </TabsTrigger>
            <TabsTrigger value="diagnosticos" className={adminTheme.tabsTrigger}>
              <Brain className={adminTheme.tabsIcon} /> Diagnósticos
            </TabsTrigger>
            <TabsTrigger value="secoes" className={adminTheme.tabsTrigger}>
              <CalendarDays className={adminTheme.tabsIcon} /> Seções
            </TabsTrigger>
            <TabsTrigger value="projetos" className={adminTheme.tabsTrigger}>
              <Target className={adminTheme.tabsIcon} /> Projetos
            </TabsTrigger>
            <TabsTrigger value="entregas" className={adminTheme.tabsTrigger}>
              <Package className={adminTheme.tabsIcon} /> Entregas
            </TabsTrigger>
            <TabsTrigger value="entregas_equipe" className={adminTheme.tabsTrigger}>
              <ClipboardList className={adminTheme.tabsIcon} /> Entregas Equipe
            </TabsTrigger>
            <TabsTrigger value="metricas" className={adminTheme.tabsTrigger}>
              <BarChart3 className={adminTheme.tabsIcon} /> Métricas
            </TabsTrigger>
            <TabsTrigger value="documentos" className={adminTheme.tabsTrigger}>
              <FolderOpen className={adminTheme.tabsIcon} /> Documentos
            </TabsTrigger>
            <TabsTrigger value="reports" className={adminTheme.tabsTrigger}>
              <FileBarChart className={adminTheme.tabsIcon} /> Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contrato" className={adminTheme.tabsContent}>
            <ContratoSkillsManager equipeId={selectedEquipeId} equipeName={selectedEquipe?.nome} />
          </TabsContent>
          <TabsContent value="diagnosticos" className={adminTheme.tabsContent}>
            <DiagnosticosSkillsTab equipeId={selectedEquipeId} />
          </TabsContent>
          <TabsContent value="secoes" className={adminTheme.tabsContent}>
            <SecoesTrimestraisTab equipeId={selectedEquipeId} />
          </TabsContent>
          <TabsContent value="projetos" className={adminTheme.tabsContent}>
            <ProjetosMapeadosTab equipeId={selectedEquipeId} />
          </TabsContent>
          <TabsContent value="entregas" className={adminTheme.tabsContent}>
            <SkillsEntregasTab equipeId={selectedEquipeId} />
          </TabsContent>
          <TabsContent value="entregas_equipe" className={adminTheme.tabsContent}>
            <SkillsEntregasEquipeTab equipeId={selectedEquipeId} />
          </TabsContent>
          <TabsContent value="metricas" className={adminTheme.tabsContent}>
            <SkillsMetricasTab equipeId={selectedEquipeId} />
          </TabsContent>
          <TabsContent value="documentos" className={adminTheme.tabsContent}>
            <DocumentosSkillsManager equipeId={selectedEquipeId} equipeName={selectedEquipe?.nome} />
          </TabsContent>
          <TabsContent value="reports" className={adminTheme.tabsContent}>
            <ReportsSkillsManager equipeId={selectedEquipeId} equipeName={selectedEquipe?.nome} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className={adminTheme.emptyState}>
          <Users className={adminTheme.emptyIcon} />
          <p className={adminTheme.emptyTitle}>Selecione uma equipe</p>
          <p className={adminTheme.emptyDescription}>
            Escolha uma equipe acima para gerenciar contrato, diagnósticos, projetos, documentos e reports.
          </p>
        </div>
      )}
    </div>
  );
}
