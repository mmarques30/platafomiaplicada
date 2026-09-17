import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, ExternalLink, ImageIcon, LayoutGrid, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConteudosCurados, ConteudoDashboard } from "@/hooks/useConteudosDashboard";
import { useCapasConteudo } from "@/hooks/useCapasConteudo";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PageTitle } from "@/components/shared/PageTitle";
import { PageContainer } from "@/components/shared/PageContainer";
import { ConteudoCard } from "@/components/dashboard/ConteudoCard";
import { GRUPOS, tipoInfo, tempoLeitura } from "@/lib/conteudoTipos";

const tabs = [
  { value: "todos", label: "Todos", icon: LayoutGrid },
  ...GRUPOS.map((g) => ({ value: g.value, label: g.label, icon: tipoInfo(g.tipos[0]).icon })),
];

const validTabs = tabs.map((t) => t.value);

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
          <Skeleton key={i} className="h-[260px] rounded-2xl" />
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
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>(
    tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "todos"
  );
  const [selectedConteudo, setSelectedConteudo] = useState<ConteudoDashboard | null>(null);

  useEffect(() => {
    if (tabFromUrl && validTabs.includes(tabFromUrl)) setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const handleTabChange = (v: string) => {
    setActiveTab(v);
    if (v === "todos") searchParams.delete("tab");
    else searchParams.set("tab", v);
    setSearchParams(searchParams, { replace: true });
  };

  const { data: conteudos, isLoading } = useConteudosCurados();
  useCapasConteudo(conteudos);

  const todos = useMemo(() => conteudos || [], [conteudos]);

  const porGrupo = useMemo(() => {
    const mapa: Record<string, ConteudoDashboard[]> = {};
    for (const grupo of GRUPOS) {
      mapa[grupo.value] = todos.filter((c) => grupo.tipos.includes(c.tipo));
    }
    return mapa;
  }, [todos]);

  const selecionadoInfo = selectedConteudo ? tipoInfo(selectedConteudo.tipo) : null;
  const minutos = tempoLeitura(selectedConteudo?.conteudo);

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
            itens={todos}
            isLoading={isLoading}
            vazio="Nenhum conteúdo disponível"
            onSelect={setSelectedConteudo}
          />
        </TabsContent>

        {GRUPOS.map((grupo) => (
          <TabsContent key={grupo.value} value={grupo.value} className="mt-6">
            <GradeConteudos
              itens={porGrupo[grupo.value] || []}
              isLoading={isLoading}
              vazio={`Nada em ${grupo.label.toLowerCase()} por enquanto`}
              onSelect={setSelectedConteudo}
            />
          </TabsContent>
        ))}

      </Tabs>

      {/* Detalhe do conteúdo */}
      <Dialog open={!!selectedConteudo} onOpenChange={() => setSelectedConteudo(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          {selectedConteudo && selecionadoInfo && (
            <div className="space-y-4">
              {selectedConteudo.imagem_url && (
                <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted">
                  <img
                    src={selectedConteudo.imagem_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="gap-1.5">
                    <selecionadoInfo.icon className="h-3 w-3" />
                    {selecionadoInfo.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedConteudo.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  {minutos && (
                    <span className="text-sm text-muted-foreground">· {minutos} min de leitura</span>
                  )}
                </div>
                <h2 className="font-serif-display text-2xl text-foreground md:text-3xl">
                  {selectedConteudo.titulo}
                </h2>
                {selectedConteudo.resumo && (
                  <p className="mt-2 text-muted-foreground">{selectedConteudo.resumo}</p>
                )}
              </div>

              {selectedConteudo.conteudo && (
                <div
                  className="prose prose-sm max-w-none"
                  style={{
                    fontSize: selectedConteudo.estilo_texto?.fontSize || 16,
                    lineHeight: selectedConteudo.estilo_texto?.lineHeight || 1.5,
                    fontWeight: selectedConteudo.estilo_texto?.fontWeight || "normal",
                    textAlign: (selectedConteudo.estilo_texto?.textAlign as React.CSSProperties["textAlign"]) || "left",
                  }}
                >
                  <p className="whitespace-pre-wrap">{selectedConteudo.conteudo}</p>
                </div>
              )}

              {!!selectedConteudo.galeria_imagens?.length && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <ImageIcon className="h-4 w-4" />
                    Galeria
                  </h3>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {selectedConteudo.galeria_imagens.map((url, index) => (
                      <div key={index} className="aspect-video overflow-hidden rounded-lg bg-muted">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(selectedConteudo.arquivo_pdf_url || selectedConteudo.link_externo) && (
                <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                  {selectedConteudo.arquivo_pdf_url && (
                    <Button size="pill" asChild>
                      <a
                        href={selectedConteudo.arquivo_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar material
                      </a>
                    </Button>
                  )}
                  {selectedConteudo.link_externo && (
                    <Button variant="outline" size="pill" asChild>
                      <a href={selectedConteudo.link_externo} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Abrir na fonte
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
