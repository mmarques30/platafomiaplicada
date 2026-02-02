import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ClipboardList, BookOpen, Map, Brain } from "lucide-react";
import EquipesSkillsTab from "@/components/admin/skills/EquipesSkillsTab";
import DiagnosticosSkillsTab from "@/components/admin/skills/DiagnosticosSkillsTab";
import ConteudosSkillsTab from "@/components/admin/skills/ConteudosSkillsTab";
import RoadmapSkillsTab from "@/components/admin/skills/RoadmapSkillsTab";
import AnalisesIASkillsTab from "@/components/admin/skills/AnalisesIASkillsTab";

export default function MentoriaSkillsPage() {
  const [selectedEquipeId, setSelectedEquipeId] = useState<string | null>(null);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestão Skills</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie equipes, diagnósticos e conteúdos do programa Skills
        </p>
      </div>

      <Tabs defaultValue="equipes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="equipes" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Equipes</span>
          </TabsTrigger>
          <TabsTrigger value="diagnosticos" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Diagnósticos</span>
          </TabsTrigger>
          <TabsTrigger value="conteudos" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Conteúdos</span>
          </TabsTrigger>
          <TabsTrigger value="roadmap" className="gap-2">
            <Map className="h-4 w-4" />
            <span className="hidden sm:inline">Roadmap</span>
          </TabsTrigger>
          <TabsTrigger value="analises" className="gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Análises IA</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equipes">
          <EquipesSkillsTab
            selectedEquipeId={selectedEquipeId}
            onSelectEquipe={setSelectedEquipeId}
          />
        </TabsContent>

        <TabsContent value="diagnosticos">
          <DiagnosticosSkillsTab equipeId={selectedEquipeId} />
        </TabsContent>

        <TabsContent value="conteudos">
          <ConteudosSkillsTab equipeId={selectedEquipeId} />
        </TabsContent>

        <TabsContent value="roadmap">
          <RoadmapSkillsTab equipeId={selectedEquipeId} />
        </TabsContent>

        <TabsContent value="analises">
          <AnalisesIASkillsTab equipeId={selectedEquipeId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
