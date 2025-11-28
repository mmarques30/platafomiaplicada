import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriasTab } from "@/components/admin/comunidade/CategoriasTab";
import { CursosClassroomTab } from "@/components/admin/comunidade/CursosClassroomTab";
import { ModeracaoTab } from "@/components/admin/comunidade/ModeracaoTab";
import { EstatisticasComunidadeTab } from "@/components/admin/comunidade/EstatisticasComunidadeTab";

export default function GerenciarComunidade() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Gerenciar Comunidade
        </h1>
        <p className="text-zinc-400">
          Configure categorias, cursos do Classroom e modere posts
        </p>
      </div>

      <Tabs defaultValue="categorias" className="space-y-6">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger
            value="categorias"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Categorias
          </TabsTrigger>
          <TabsTrigger
            value="classroom"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Classroom
          </TabsTrigger>
          <TabsTrigger
            value="moderacao"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Moderação
          </TabsTrigger>
          <TabsTrigger
            value="estatisticas"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Estatísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categorias">
          <CategoriasTab />
        </TabsContent>

        <TabsContent value="classroom">
          <CursosClassroomTab />
        </TabsContent>

        <TabsContent value="moderacao">
          <ModeracaoTab />
        </TabsContent>

        <TabsContent value="estatisticas">
          <EstatisticasComunidadeTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
