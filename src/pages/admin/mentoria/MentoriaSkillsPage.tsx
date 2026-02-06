import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEquipesSkillsAdmin } from "@/hooks/admin/useEquipesSkillsAdmin";
import { adminTheme } from "@/components/admin/adminTheme";
import { Users, Package, BarChart3, Map } from "lucide-react";
import SkillsEquipesTab from "@/components/admin/skills/SkillsEquipesTab";
import SkillsEntregasTab from "@/components/admin/skills/SkillsEntregasTab";
import SkillsMetricasTab from "@/components/admin/skills/SkillsMetricasTab";
import SkillsRoadmapTab from "@/components/admin/skills/SkillsRoadmapTab";

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
            <h1 className={adminTheme.pageTitle}>Skills — Performance</h1>
            <p className={adminTheme.pageSubtitle}>Gerencie equipes, entregas, métricas e roadmap</p>
          </div>
        </div>
      </div>

      {/* Seletor de equipe global */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Equipe:</label>
        <Select
          value={selectedEquipeId ?? ""}
          onValueChange={(v) => setSelectedEquipeId(v || null)}
        >
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
        <Tabs defaultValue="equipe" className="mt-2">
          <TabsList className={adminTheme.tabsList}>
            <TabsTrigger value="equipe" className={adminTheme.tabsTrigger}>
              <Users className={adminTheme.tabsIcon} /> Equipe
            </TabsTrigger>
            <TabsTrigger value="entregas" className={adminTheme.tabsTrigger}>
              <Package className={adminTheme.tabsIcon} /> Entregas
            </TabsTrigger>
            <TabsTrigger value="metricas" className={adminTheme.tabsTrigger}>
              <BarChart3 className={adminTheme.tabsIcon} /> Métricas
            </TabsTrigger>
            <TabsTrigger value="roadmap" className={adminTheme.tabsTrigger}>
              <Map className={adminTheme.tabsIcon} /> Roadmap
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equipe" className={adminTheme.tabsContent}>
            <SkillsEquipesTab equipeId={selectedEquipeId} />
          </TabsContent>
          <TabsContent value="entregas" className={adminTheme.tabsContent}>
            <SkillsEntregasTab equipeId={selectedEquipeId} />
          </TabsContent>
          <TabsContent value="metricas" className={adminTheme.tabsContent}>
            <SkillsMetricasTab equipeId={selectedEquipeId} />
          </TabsContent>
          <TabsContent value="roadmap" className={adminTheme.tabsContent}>
            <SkillsRoadmapTab equipeId={selectedEquipeId} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className={adminTheme.emptyState}>
          <Users className={adminTheme.emptyIcon} />
          <p className={adminTheme.emptyTitle}>Selecione uma equipe</p>
          <p className={adminTheme.emptyDescription}>
            Escolha uma equipe acima para gerenciar entregas, métricas e roadmap.
          </p>
        </div>
      )}
    </div>
  );
}
