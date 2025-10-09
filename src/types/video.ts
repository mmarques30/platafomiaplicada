export interface Material {
  titulo: string;
  url: string;
  tipo: 'download' | 'link' | 'documento';
  arquivo_path?: string; // Path do arquivo no storage bucket
  arquivo_nome?: string; // Nome original do arquivo
  arquivo_tamanho?: number; // Tamanho em bytes
}

export interface AuditoriaRegistro {
  id: string;
  tabela: string;
  registro_id: string;
  operacao: 'INSERT' | 'UPDATE' | 'DELETE';
  user_id: string;
  dados_anteriores: any;
  dados_novos: any;
  campos_alterados: string[];
  created_at: string;
  profiles?: {
    nome_completo: string;
  };
}
