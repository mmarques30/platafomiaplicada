import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Database, FileCheck, FileX } from "lucide-react";
import { useKnowledgeBase } from "@/hooks/admin/useKnowledgeBase";
import { UploadDocumentoModal } from "@/components/admin/knowledge/UploadDocumentoModal";
import { DocumentoCard } from "@/components/admin/knowledge/DocumentoCard";
import { StatsCard } from "@/components/admin/StatsCard";
import { KnowledgeBaseDocument } from "@/types/knowledge-base";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GerenciarConhecimento = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  
  const {
    documentos,
    isLoading,
    uploadDocumento,
    toggleAtivo,
    deletarDocumento,
  } = useKnowledgeBase();

  const categorias = [
    "Metodologia",
    "Casos de Uso",
    "FAQ",
    "Tutoriais",
    "Boas Práticas",
    "Outro",
  ];

  const handleUpload = (formData: FormData) => {
    uploadDocumento.mutate(formData, {
      onSuccess: () => {
        setUploadModalOpen(false);
      },
    });
  };

  const handleToggleAtivo = (id: string, ativo: boolean) => {
    toggleAtivo.mutate({ id, ativo });
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar este documento?")) {
      deletarDocumento.mutate(id);
    }
  };

  const documentosFiltrados = documentos?.filter(
    (doc) => filtroCategoria === "todas" || doc.categoria === filtroCategoria
  );

  const totalDocumentos = documentos?.length || 0;
  const documentosAtivos = documentos?.filter((d) => d.ativo).length || 0;
  const documentosInativos = totalDocumentos - documentosAtivos;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Base de Conhecimento</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os documentos que alimentam o conhecimento da MarIAna
          </p>
        </div>
        <Button onClick={() => setUploadModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Documento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total de Documentos"
          value={totalDocumentos}
          icon={Database}
        />
        <StatsCard
          title="Documentos Ativos"
          value={documentosAtivos}
          icon={FileCheck}
        />
        <StatsCard
          title="Documentos Inativos"
          value={documentosInativos}
          icon={FileX}
        />
      </div>

      <div className="flex items-center gap-4">
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {documentosFiltrados?.length || 0} documento(s) encontrado(s)
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando documentos...</p>
        </div>
      ) : documentosFiltrados && documentosFiltrados.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {documentosFiltrados.map((documento) => (
            <DocumentoCard
              key={documento.id}
              documento={documento}
              onToggleAtivo={handleToggleAtivo}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Nenhum documento encontrado. Comece adicionando um novo documento!
          </p>
        </div>
      )}

      <UploadDocumentoModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUpload={handleUpload}
        isUploading={uploadDocumento.isPending}
      />
    </div>
  );
};

export default GerenciarConhecimento;
