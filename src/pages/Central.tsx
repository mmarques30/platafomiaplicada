import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Newspaper, Globe, Lightbulb, FileText, ExternalLink, ImageIcon, Users, LayoutGrid } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConteudosDashboard, TipoConteudo, ConteudoDashboard } from "@/hooks/useConteudosDashboard";
import { useCapasConteudo } from "@/hooks/useCapasConteudo";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PageTitle } from "@/components/shared/PageTitle";
import { PageContainer } from "@/components/shared/PageContainer";
import { ConteudoCard } from "@/components/dashboard/ConteudoCard";
import { CriadoresComunidadeTab } from "@/components/comunidade/CriadoresComunidadeTab";

type TabValue = TipoConteudo | "todos" | "criadores";

const tabs = [
  { value: "todos" as const, label: "Todos", icon: LayoutGrid },
  { value: "noticia" as TipoConteudo, label: "Notícias IA", icon: Globe },
  { value: "dica" as TipoConteudo, label: "Dicas práticas", icon: Lightbulb },
  { value: "newsletter" as TipoConteudo, label: "Newsletter", icon: Newspaper },
  { value: "criadores" as const, label: "Criadores", icon: Users },
];

const TIPO_LABEL: Record<string, string> = {
  newsletter: "Newsletter",
  noticia: "Notícia",
  dica: "Dica prática",
};

const validTabs: TabValue[] = ["todos", "noticia", "dica", "newsletter", "criadores"];

function GradeConteudos({
  itens,
  isLoading,
  vazio,
  onSelect,
}: {
  itens: ConteudoDashboard[];
  isLoading: boolean;
  vazio: string;
  onSelect: (c: ConteudoDashboard) => void;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-[240px] rounded-2xl" />
        ))}
      </div>
    );
  }
  if (itens.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-16 text-center">
        <p className="text-sm text-muted-foreground">{vazio}</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {itens.map((c) => (
        <ConteudoCard key={c.id} conteudo={c} onClick={() => onSelect(c)} />
      ))}
    </div>
  );
}

export default function Central() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as TabValue | null;
  const [activeTab, setActiveTab] = useState<TabValue>(
    tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "todos"
  );
  const [selectedConteudo, setSelectedConteudo] = useState<ConteudoDashboard | null>(null);

  useEffect(() => {
    if (tabFromUrl && validTabs.includes(tabFromUrl)) setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const handleTabChange = (v: string) => {
    setActiveTab(v as TabValue);
    if (v === "todos") searchParams.delete("tab");
    else searchParams.set("tab", v);
    setSearchParams(searchParams, { replace: true });
  };

  const { data: newsletters, isLoading: loadingNewsletter } = useConteudosDashboard("newsletter");
  const { data: noticias, isLoading: loadingNoticia } = useConteudosDashboard("noticia");
  const { data: dicas, isLoading: loadingDica } = useConteudosDashboard("dica");

  const isLoading = loadingNewsletter || loadingNoticia || loadingDica;

  const allConteudos = useMemo(
    () =>
      [...(newsletters || []), ...(noticias || []), ...(dicas || [])].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [newsletters, noticias, dicas]
  );
  useCapasConteudo(allConteudos);

  return (
    <PageContainer>
      <PageTitle primary="Explorar" secondary="conteúdos" />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="flex w-full flex-wrap justify-start sm:inline-flex sm:w-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 px-3 text-xs sm:px-4 sm:text-sm">
              <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="todos" className="mt-6">
          <GradeConteudos
            itens={allConteudos}
            isLoading={isLoading}
            vazio="Nenhum conteúdo disponível"
            onSelect={setSelectedConteudo}
          />
        </TabsContent>
        <TabsContent value="noticia" className="mt-6">
          <GradeConteudos
            itens={noticias || []}
            isLoading={loadingNoticia}
            vazio="Nenhuma notícia disponível"
            onSelect={setSelectedConteudo}
          />
        </TabsContent>
        <TabsContent value="dica" className="mt-6">
          <GradeConteudos
            itens={dicas || []}
            isLoading={loadingDica}
            vazio="Nenhuma dica disponível"
            onSelect={setSelectedConteudo}
          />
        </TabsContent>
        <TabsContent value="newsletter" className="mt-6">
          <GradeConteudos
            itens={newsletters || []}
            isLoading={loadingNewsletter}
            vazio="Nenhuma newsletter disponível"
            onSelect={setSelectedConteudo}
          />
        </TabsContent>
        <TabsContent value="criadores" className="mt-6">
          <CriadoresComunidadeTab />
        </TabsContent>
      </Tabs>

      {/* Modal de detalhes */}
      <Dialog open={!!selectedConteudo} onOpenChange={() => setSelectedConteudo(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          {selectedConteudo && (
            <div className="space-y-4">
              {selectedConteudo.imagem_url && (
                <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted">
                  <img src={selectedConteudo.imagem_url} alt={selectedConteudo.titulo} className="h-full w-full object-cover" />
                </div>
              )}

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">{TIPO_LABEL[selectedConteudo.tipo] ?? selectedConteudo.tipo}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedConteudo.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <h2 className="font-serif-display text-2xl text-foreground md:text-3xl">{selectedConteudo.titulo}</h2>
                {selectedConteudo.resumo && <p className="mt-2 text-muted-foreground">{selectedConteudo.resumo}</p>}
              </div>

              {selectedConteudo.conteudo && (
                <div
                  className="prose prose-sm max-w-none"
                  style={{
                    fontSize: (selectedConteudo as any).estilo_texto?.fontSize || 16,
                    lineHeight: (selectedConteudo as any).estilo_texto?.lineHeight || 1.5,
                    fontWeight: (selectedConteudo as any).estilo_texto?.fontWeight || "normal",
                    textAlign: (selectedConteudo as any).estilo_texto?.textAlign || "left",
                  }}
                >
                  <p className="whitespace-pre-wrap">{selectedConteudo.conteudo}</p>
                </div>
              )}

              {(selectedConteudo as any).galeria_imagens?.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <ImageIcon className="h-4 w-4" />
                    Galeria
                  </h3>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {(selectedConteudo as any).galeria_imagens.map((url: string, index: number) => (
                      <div key={index} className="aspect-video overflow-hidden rounded-lg bg-muted">
                        <img src={url} alt={`Imagem ${index + 1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 border-t border-border pt-4">
                {(selectedConteudo as any).arquivo_pdf_url && (
                  <Button variant="outline" size="pill" asChild>
                    <a href={(selectedConteudo as any).arquivo_pdf_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      Ver PDF
                    </a>
                  </Button>
                )}
                {selectedConteudo.link_externo && (
                  <Button size="pill" asChild>
                    <a href={selectedConteudo.link_externo} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Acessar link
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
