export interface KnowledgeBaseDocument {
  id: string;
  titulo: string;
  categoria: string;
  tipo_arquivo: string;
  arquivo_url: string;
  conteudo_extraido: string;
  ativo: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
