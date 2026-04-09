import { useState } from "react";
import { FileText, Download, Loader2, FolderOpen, ExternalLink, Link2, HardDrive, Wrench, Video, Table, ArrowLeft, StickyNote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useDocumentosBusiness } from "@/hooks/useDocumentosBusiness";
import { useLinksBusiness } from "@/hooks/useLinksBusiness";
import { useNotasProjetoBusiness } from "@/hooks/useNotasProjetoBusiness";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { useNavigate } from "react-router-dom";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import BusinessReportsCard from "@/components/mentoria/business/BusinessReportsCard";
import { ArquivosProjetoSection } from "@/components/admin/business/ArquivosProjetoSection";
import { NotasProjetoSection } from "@/components/admin/business/NotasProjetoSection";

const iconeOptions = [
  { value: "link", Icon: ExternalLink },
  { value: "drive", Icon: HardDrive },
  { value: "folder", Icon: FolderOpen },
  { value: "tool", Icon: Wrench },
  { value: "video", Icon: Video },
  { value: "doc", Icon: FileText },
  { value: "spreadsheet", Icon: Table },
];

const getIconComponent = (icone: string) => {
  const found = iconeOptions.find(o => o.value === icone);
  return found?.Icon || ExternalLink;
};

export default function MentoriaDocumentos() {
  const navigate = useNavigate();
  const businessUserId = useBusinessUserId();
  const { contrato, isLoading: isLoadingContrato } = useContratosBusiness(businessUserId);
  const { documentos, isLoading: isLoadingDocs } = useDocumentosBusiness(contrato?.id, false);
  const { links, isLoading: isLoadingLinks } = useLinksBusiness(contrato?.id);
  const { notas, isLoading: isLoadingNotas } = useNotasProjetoBusiness(contrato?.id);

  const isLoading = isLoadingContrato || isLoadingDocs || isLoadingLinks || isLoadingNotas;

  if (isLoading) return <PageSkeleton variant="evolucao" />;

  if (!contrato) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum contrato encontrado</h3>
            <p className="text-muted-foreground">Você ainda não possui um contrato ativo no sistema.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const arquivosCount = documentos.filter((d) => d.arquivo_url).length;

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => navigate("/mentoria")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Mentoria
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Meus Documentos</h1>
        <p className="text-muted-foreground">Acesse seus arquivos, anotações, links e relatórios.</p>
      </div>

      <Tabs defaultValue="arquivos" className="space-y-4">
        <TabsList className="bg-muted/40 border-0 rounded-lg p-1">
          <TabsTrigger value="arquivos" className="text-sm rounded-md px-4 py-2 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <FileText className="h-4 w-4" />
            Arquivos ({arquivosCount})
          </TabsTrigger>
          <TabsTrigger value="anotacoes" className="text-sm rounded-md px-4 py-2 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <StickyNote className="h-4 w-4" />
            Anotações ({notas.length})
          </TabsTrigger>
          <TabsTrigger value="links" className="text-sm rounded-md px-4 py-2 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Link2 className="h-4 w-4" />
            Links ({links.length})
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-sm rounded-md px-4 py-2 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="arquivos" className="mt-4">
          <ArquivosProjetoSection contratoId={contrato.id} readOnly />
        </TabsContent>

        <TabsContent value="anotacoes" className="mt-4">
          <NotasProjetoSection contratoId={contrato.id} readOnly />
        </TabsContent>

        <TabsContent value="links" className="space-y-4 mt-4">
          {links.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum link disponível</h3>
                <p className="text-muted-foreground">Links importantes aparecerão aqui quando forem adicionados.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {links.map((link) => {
                const IconComponent = getIconComponent(link.icone);
                return (
                  <Card key={link.id} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => window.open(link.url, "_blank")}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base mb-1 truncate group-hover:text-primary transition-colors">{link.titulo}</h3>
                            {link.descricao && <p className="text-sm text-muted-foreground truncate">{link.descricao}</p>}
                          </div>
                        </div>
                        <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <BusinessReportsCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
