import { useState } from "react";
import { motion } from "framer-motion";
import { Newspaper, Globe, Lightbulb, FileText, ExternalLink, ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConteudosDashboard, TipoConteudo } from "@/hooks/useConteudosDashboard";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const tabs = [
  { value: "todos" as const, label: "Todos", icon: FileText },
  { value: "newsletter" as TipoConteudo, label: "Newsletter", icon: Newspaper },
  { value: "noticia" as TipoConteudo, label: "Notícias IA", icon: Globe },
  { value: "dica" as TipoConteudo, label: "Dicas Práticas", icon: Lightbulb },
];

const tipoIcons = {
  newsletter: Newspaper,
  noticia: Globe,
  dica: Lightbulb,
};

const tipoBadgeColors = {
  newsletter: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  noticia: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  dica: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

export default function Central() {
  const [activeTab, setActiveTab] = useState<TipoConteudo | "todos">("todos");
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
    <div className="container max-w-6xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Central de Conteúdo</h1>
        <p className="text-muted-foreground mt-1">
          Fique por dentro das novidades e aplique hoje
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TipoConteudo | "todos")}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : filteredConteudos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConteudos.map((conteudo) => {
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
                      className="h-full cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                      onClick={() => setSelectedConteudo(conteudo)}
                    >
                      {/* Imagem */}
                      {conteudo.imagem_url ? (
                        <div className="aspect-video w-full overflow-hidden bg-muted">
                          <img 
                            src={conteudo.imagem_url} 
                            alt={conteudo.titulo}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <TipoIcon className="w-12 h-12 text-primary/30" />
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
                        <CardTitle className="text-lg line-clamp-2">{conteudo.titulo}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {conteudo.resumo}
                        </p>
                        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                          <span>{new Date(conteudo.created_at).toLocaleDateString('pt-BR')}</span>
                          {conteudo.link_externo && (
                            <ExternalLink className="w-3 h-3" />
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
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Nenhum conteúdo disponível nesta categoria</p>
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
    </div>
  );
}
