import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Trash2, Power } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { KnowledgeBaseDocument } from "@/types/knowledge-base";

interface DocumentoCardProps {
  documento: KnowledgeBaseDocument;
  onToggleAtivo: (id: string, ativo: boolean) => void;
  onDelete: (id: string) => void;
}

export const DocumentoCard = ({
  documento,
  onToggleAtivo,
  onDelete,
}: DocumentoCardProps) => {
  const getFileIcon = (tipo: string) => {
    return <FileText className="h-5 w-5" />;
  };

  const getPreview = (conteudo: string) => {
    if (conteudo.length > 150) {
      return conteudo.substring(0, 150) + "...";
    }
    return conteudo;
  };

  return (
    <Card className={documento.ativo ? "" : "opacity-60"}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {getFileIcon(documento.tipo_arquivo)}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg mb-2">{documento.titulo}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{documento.categoria}</Badge>
                <Badge variant="outline">{documento.tipo_arquivo.toUpperCase()}</Badge>
                <Badge variant={documento.ativo ? "default" : "secondary"}>
                  {documento.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {getPreview(documento.conteudo_extraido)}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Adicionado{" "}
            {formatDistanceToNow(new Date(documento.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={documento.ativo ? "outline" : "default"}
              onClick={() => onToggleAtivo(documento.id, !documento.ativo)}
            >
              <Power className="h-4 w-4 mr-1" />
              {documento.ativo ? "Desativar" : "Ativar"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(documento.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Deletar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
