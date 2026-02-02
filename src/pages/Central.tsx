import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Newspaper, Globe, Lightbulb, FileText, ExternalLink, ImageIcon, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConteudosDashboard, TipoConteudo } from "@/hooks/useConteudosDashboard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PageTitle } from "@/components/shared/PageTitle";
import { CriadoresComunidadeTab } from "@/components/comunidade/CriadoresComunidadeTab";
import { useUserRole } from "@/hooks/useUserRole";
import logo3d from "@/assets/logo-3d.png";

type TabValue = TipoConteudo | "todos" | "criadores";

const allTabs = [
  { value: "todos" as const, label: "Todos", icon: FileText },
  { value: "noticia" as TipoConteudo, label: "Notícias IA", icon: Globe },
  { value: "dica" as TipoConteudo, label: "Dicas Práticas", icon: Lightbulb },
  { value: "newsletter" as TipoConteudo, label: "Newsletter", icon: Newspaper },
  { value: "criadores" as const, label: "Criadores", icon: Users, hiddenForVisitors: true },
];

const tipoIcons = {
  newsletter: Newspaper,
  noticia: Globe,
  dica: Lightbulb,
};

const tipoBadgeColors = {
  newsletter: "bg-aplicada-green-700/10 text-aplicada-green-700 border-aplicada-green-700/30",
  noticia: "bg-aplicada-green-600/10 text-aplicada-green-600 border-aplicada-green-600/30",
  dica: "bg-aplicada-green-800/10 text-aplicada-green-800 border-aplicada-green-800/30",
};

export default function Central() {
  const [searchParams] = useSearchParams();
  const { isVisitante } = useUserRole();
  const tabFromUrl = searchParams.get('tab') as TabValue | null;
  
  // Filtrar tabs baseado no tipo de usuário
  const tabs = useMemo(() => {
    return allTabs.filter(tab => !tab.hiddenForVisitors || !isVisitante);
  }, [isVisitante]);
  
  const validTabs = tabs.map(t => t.value);
  const [activeTab, setActiveTab] = useState<TabValue>(
    tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "todos"
  );

  useEffect(() => {
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);
  const [selectedConteudo, setSelectedConteudo] = useState<any>(null);
  
  const { data: newsletters, isLoading: loadingNewsletter } = useConteudosDashboard("newsletter");
  const { data: noticias, isLoading: loadingNoticia } = useConteudosDashboard("noticia");
  const { data: dicas, isLoading: loadingDica } = useConteudosDashboard("dica");

  const isLoading = loadingNewsletter || loadingNoticia || loadingDica;

  const allConteudos = [
    ...(newsletters || []),
    ...(noticias || []),
    ...(dicas || []),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filteredConteudos = activeTab === "todos" 
    ? allConteudos 
    : allConteudos.filter(c => c.tipo === activeTab);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background Logo - Decorativo Lateral */}
      <div className="absolute -right-20 -bottom-20 pointer-events-none">
        <img 
          src={logo3d} 
          alt="" 
          className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] object-contain opacity-[0.05] select-none"
        />
      </div>

      <main className="container max-w-7xl mx-auto py-6 md:py-8 px-4 md:px-6 space-y-6 relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div>
          <PageTitle primary="Central" secondary="de Conteúdo" />
          <p className="text-muted-foreground mt-2">
            Fique por dentro das novidades e aplique hoje
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="flex-1 flex flex-col">
          <TabsList className="inline-flex w-fit gap-0.5 sm:gap-1 bg-primary/20 dark:bg-primary/30 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-primary/30 dark:border-primary/40">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
              >
                <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Criadores */}
          <TabsContent value="criadores" className="mt-6 flex-1">
            <CriadoresComunidadeTab />
          </TabsContent>

          {/* Tabs de Conteúdo - Todos, Notícias, Dicas, Newsletter */}
          <TabsContent value="todos" className="mt-6 flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <Skeleton key={i} className="h-72 rounded-xl" />
                ))}
              </div>
            ) : allConteudos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {allConteudos.map((conteudo) => {
                  const TipoIcon = tipoIcons[conteudo.tipo as keyof typeof tipoIcons];
                  return (
                    <motion.div
                      key={conteudo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card 
                        className="h-full cursor-pointer hover:shadow-lg transition-all border border-border hover:border-aplicada-green-700/40 overflow-hidden group"
                        onClick={() => setSelectedConteudo(conteudo)}
                      >
                        {conteudo.imagem_url ? (
                          <div className="aspect-video w-full overflow-hidden bg-muted">
                            <img 
                              src={conteudo.imagem_url} 
                              alt={conteudo.titulo}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video w-full bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
                            <img src={logo3d} alt="" className="w-20 h-20 opacity-20" />
                          </div>
                        )}

                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <Badge variant="outline" className={tipoBadgeColors[conteudo.tipo as keyof typeof tipoBadgeColors]}>
                              {conteudo.tipo === 'newsletter' ? 'Newsletter' : 
                               conteudo.tipo === 'noticia' ? 'Notícia' : 'Dica'}
                            </Badge>
                            {conteudo.destaque && (
                              <Badge className="bg-primary text-primary-foreground">Destaque</Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg line-clamp-2 group-hover:text-aplicada-green-600 transition-colors">
                            {conteudo.titulo}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {conteudo.resumo}
                          </p>
                          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                            <span>{new Date(conteudo.created_at).toLocaleDateString('pt-BR')}</span>
                            {conteudo.link_externo && (
                              <ExternalLink className="w-3 h-3 text-aplicada-green-600" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <img src={logo3d} alt="" className="w-24 h-24 mx-auto opacity-20 mb-4" />
                <p className="text-muted-foreground">Nenhum conteúdo disponível</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="noticia" className="mt-6 flex-1">
            {loadingNoticia ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-72 rounded-xl" />
                ))}
              </div>
            ) : (noticias || []).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {(noticias || []).map((conteudo) => (
                  <motion.div
                    key={conteudo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card 
                      className="h-full cursor-pointer hover:shadow-lg transition-all border border-border hover:border-aplicada-green-700/40 overflow-hidden group"
                      onClick={() => setSelectedConteudo(conteudo)}
                    >
                      {conteudo.imagem_url ? (
                        <div className="aspect-video w-full overflow-hidden bg-muted">
                          <img 
                            src={conteudo.imagem_url} 
                            alt={conteudo.titulo}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video w-full bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
                          <img src={logo3d} alt="" className="w-20 h-20 opacity-20" />
                        </div>
                      )}

                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <Badge variant="outline" className={tipoBadgeColors[conteudo.tipo as keyof typeof tipoBadgeColors]}>
                            Notícia
                          </Badge>
                          {conteudo.destaque && (
                            <Badge className="bg-primary text-primary-foreground">Destaque</Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-aplicada-green-600 transition-colors">
                          {conteudo.titulo}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {conteudo.resumo}
                        </p>
                        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                          <span>{new Date(conteudo.created_at).toLocaleDateString('pt-BR')}</span>
                          {conteudo.link_externo && (
                            <ExternalLink className="w-3 h-3 text-aplicada-green-600" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <img src={logo3d} alt="" className="w-24 h-24 mx-auto opacity-20 mb-4" />
                <p className="text-muted-foreground">Nenhuma notícia disponível</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="dica" className="mt-6 flex-1">
            {loadingDica ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-72 rounded-xl" />
                ))}
              </div>
            ) : (dicas || []).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {(dicas || []).map((conteudo) => (
                  <motion.div
                    key={conteudo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card 
                      className="h-full cursor-pointer hover:shadow-lg transition-all border border-border hover:border-aplicada-green-700/40 overflow-hidden group"
                      onClick={() => setSelectedConteudo(conteudo)}
                    >
                      {conteudo.imagem_url ? (
                        <div className="aspect-video w-full overflow-hidden bg-muted">
                          <img 
                            src={conteudo.imagem_url} 
                            alt={conteudo.titulo}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video w-full bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
                          <img src={logo3d} alt="" className="w-20 h-20 opacity-20" />
                        </div>
                      )}

                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <Badge variant="outline" className={tipoBadgeColors[conteudo.tipo as keyof typeof tipoBadgeColors]}>
                            Dica
                          </Badge>
                          {conteudo.destaque && (
                            <Badge className="bg-primary text-primary-foreground">Destaque</Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-aplicada-green-600 transition-colors">
                          {conteudo.titulo}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {conteudo.resumo}
                        </p>
                        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                          <span>{new Date(conteudo.created_at).toLocaleDateString('pt-BR')}</span>
                          {conteudo.link_externo && (
                            <ExternalLink className="w-3 h-3 text-aplicada-green-600" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <img src={logo3d} alt="" className="w-24 h-24 mx-auto opacity-20 mb-4" />
                <p className="text-muted-foreground">Nenhuma dica disponível</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="newsletter" className="mt-6 flex-1">
            {loadingNewsletter ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-72 rounded-xl" />
                ))}
              </div>
            ) : (newsletters || []).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {(newsletters || []).map((conteudo) => (
                  <motion.div
                    key={conteudo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card 
                      className="h-full cursor-pointer hover:shadow-lg transition-all border border-border hover:border-aplicada-green-700/40 overflow-hidden group"
                      onClick={() => setSelectedConteudo(conteudo)}
                    >
                      {conteudo.imagem_url ? (
                        <div className="aspect-video w-full overflow-hidden bg-muted">
                          <img 
                            src={conteudo.imagem_url} 
                            alt={conteudo.titulo}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video w-full bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
                          <img src={logo3d} alt="" className="w-20 h-20 opacity-20" />
                        </div>
                      )}

                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <Badge variant="outline" className={tipoBadgeColors[conteudo.tipo as keyof typeof tipoBadgeColors]}>
                            Newsletter
                          </Badge>
                          {conteudo.destaque && (
                            <Badge className="bg-primary text-primary-foreground">Destaque</Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-aplicada-green-600 transition-colors">
                          {conteudo.titulo}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {conteudo.resumo}
                        </p>
                        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                          <span>{new Date(conteudo.created_at).toLocaleDateString('pt-BR')}</span>
                          {conteudo.link_externo && (
                            <ExternalLink className="w-3 h-3 text-aplicada-green-600" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <img src={logo3d} alt="" className="w-24 h-24 mx-auto opacity-20 mb-4" />
                <p className="text-muted-foreground">Nenhuma newsletter disponível</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Modal de Detalhes */}
        <Dialog open={!!selectedConteudo} onOpenChange={() => setSelectedConteudo(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedConteudo && (
              <div className="space-y-4">
                {/* Imagem Principal */}
                {selectedConteudo.imagem_url && (
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                    <img 
                      src={selectedConteudo.imagem_url} 
                      alt={selectedConteudo.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={tipoBadgeColors[selectedConteudo.tipo as keyof typeof tipoBadgeColors]}>
                      {selectedConteudo.tipo === 'newsletter' ? 'Newsletter' : 
                       selectedConteudo.tipo === 'noticia' ? 'Notícia' : 'Dica'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(selectedConteudo.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold">{selectedConteudo.titulo}</h2>
                  <p className="text-muted-foreground mt-2">{selectedConteudo.resumo}</p>
                </div>

                {/* Conteúdo Completo */}
                {selectedConteudo.conteudo && (
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none"
                    style={{
                      fontSize: selectedConteudo.estilo_texto?.fontSize || 16,
                      lineHeight: selectedConteudo.estilo_texto?.lineHeight || 1.5,
                      fontWeight: selectedConteudo.estilo_texto?.fontWeight || 'normal',
                      textAlign: selectedConteudo.estilo_texto?.textAlign || 'left',
                    }}
                  >
                    <p className="whitespace-pre-wrap">{selectedConteudo.conteudo}</p>
                  </div>
                )}

                {/* Galeria de Imagens */}
                {selectedConteudo.galeria_imagens && selectedConteudo.galeria_imagens.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Galeria
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedConteudo.galeria_imagens.map((url: string, index: number) => (
                        <div key={index} className="aspect-video rounded-lg overflow-hidden bg-muted">
                          <img src={url} alt={`Imagem ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2 pt-4 border-t">
                  {selectedConteudo.arquivo_pdf_url && (
                    <Button variant="outline" asChild>
                      <a href={selectedConteudo.arquivo_pdf_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="w-4 h-4 mr-2" />
                        Ver PDF
                      </a>
                    </Button>
                  )}
                  {selectedConteudo.link_externo && (
                    <Button asChild>
                      <a href={selectedConteudo.link_externo} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Acessar Link
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
