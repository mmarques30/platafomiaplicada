import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Trash2, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Documento {
  id: string;
  titulo: string;
  categoria: string;
  tipo_arquivo: string;
  ativo: boolean;
  created_at: string;
  conteudo_extraido: string;
}

interface DocumentoCardProps {
  documento: Documento;
  onToggleAtivo: (id: string, ativo: boolean) => void;
  onDelete: (id: string) => void;
}

export function DocumentoCard({ documento, onToggleAtivo, onDelete }: DocumentoCardProps) {
  const getTipoLabel = (tipo: string) => {
    if (tipo.includes('pdf')) return 'PDF';
    if (tipo.includes('word')) return 'DOCX';
    if (tipo.includes('text')) return 'TXT';
    if (tipo.includes('markdown')) return 'MD';
    return tipo;
  };

  const previewText = documento.conteudo_extraido.slice(0, 150) + '...';

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {documento.titulo}
          </CardTitle>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">{documento.categoria}</Badge>
            <Badge variant="outline">{getTipoLabel(documento.tipo_arquivo)}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={documento.ativo}
            onCheckedChange={(checked) => onToggleAtivo(documento.id, checked)}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(documento.id)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">{previewText}</p>
        <p className="text-xs text-muted-foreground">
          Adicionado em {format(new Date(documento.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </CardContent>
    </Card>
  );
}
