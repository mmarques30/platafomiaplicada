import { useNavigate } from "react-router-dom";
import { useDocumentoLegal } from "@/hooks/useDocumentosLegais";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PoliticaUso() {
  const navigate = useNavigate();
  const { data: documento, isLoading } = useDocumentoLegal("termos-uso");

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <Skeleton className="h-10 w-48 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!documento) {
    return (
      <div className="container max-w-4xl py-8">
        <Button variant="ghost" onClick={() => navigate("/configuracoes")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Configurações
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Documento não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <Button variant="ghost" onClick={() => navigate("/configuracoes")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para Configurações
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            {documento.tituloExibicao}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Última atualização: {format(new Date(documento.ultima_atualizacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {documento.conteudo}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
