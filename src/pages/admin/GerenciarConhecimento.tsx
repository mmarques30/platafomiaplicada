import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import { useKnowledgeBase } from "@/hooks/admin/useKnowledgeBase";
import { UploadDocumentoModal } from "@/components/admin/knowledge/UploadDocumentoModal";
import { DocumentoCard } from "@/components/admin/knowledge/DocumentoCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function GerenciarConhecimento() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  
  const { 
    documentos, 
    isLoading, 
    uploadDocumento, 
    isUploading,
    toggleAtivo,
    deleteDocumento 
  } = useKnowledgeBase();

  const categorias = [
    "todas",
    "Metodologia IA Aplicada",
    "Ferramentas de IA",
    "Casos de Uso",
    "Processos e Workflows",
    "FAQ e Dúvidas Comuns",
    "Recursos Externos",
  ];

  const documentosFiltrados = filtroCategoria === "todas"
    ? documentos
    : documentos.filter(doc => doc.categoria === filtroCategoria);

  const documentosAtivos = documentos.filter(doc => doc.ativo).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="w-8 h-8" />
            Base de Conhecimento da MarIAna
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie documentos que a MarIAna usa para responder perguntas
          </p>
        </div>
        <Button onClick={() => setUploadModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Documento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Total de Documentos</p>
          <p className="text-2xl font-bold">{documentos.length}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Documentos Ativos</p>
          <p className="text-2xl font-bold text-green-600">{documentosAtivos}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Documentos Inativos</p>
          <p className="text-2xl font-bold text-orange-600">{documentos.length - documentosAtivos}</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <label className="text-sm font-medium">Filtrar por categoria:</label>
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categorias.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat === "todas" ? "Todas as categorias" : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando documentos...</p>
        </div>
      ) : documentosFiltrados.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {filtroCategoria === "todas" 
              ? "Nenhum documento cadastrado ainda."
              : "Nenhum documento nesta categoria."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {documentosFiltrados.map((doc) => (
            <DocumentoCard
              key={doc.id}
              documento={doc}
              onToggleAtivo={(id, ativo) => toggleAtivo({ id, ativo })}
              onDelete={deleteDocumento}
            />
          ))}
        </div>
      )}

      <UploadDocumentoModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUpload={uploadDocumento}
        isUploading={isUploading}
      />
    </div>
  );
}
