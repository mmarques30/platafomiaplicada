export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      avisos: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          data_expiracao: string | null
          id: string
          mensagem: string
          tipo: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          data_expiracao?: string | null
          id?: string
          mensagem: string
          tipo: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          data_expiracao?: string | null
          id?: string
          mensagem?: string
          tipo?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      biblioteca_prompts: {
        Row: {
          ativo: boolean | null
          categoria: string
          created_at: string | null
          descricao: string
          id: string
          prompt: string
          tags: Json | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          created_at?: string | null
          descricao: string
          id?: string
          prompt: string
          tags?: Json | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          created_at?: string | null
          descricao?: string
          id?: string
          prompt?: string
          tags?: Json | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      cursos: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          duracao_estimada: number | null
          id: string
          ordem: number
          titulo: string
          trilha_id: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          duracao_estimada?: number | null
          id?: string
          ordem?: number
          titulo: string
          trilha_id: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          duracao_estimada?: number | null
          id?: string
          ordem?: number
          titulo?: string
          trilha_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cursos_trilha_id_fkey"
            columns: ["trilha_id"]
            isOneToOne: false
            referencedRelation: "trilhas"
            referencedColumns: ["id"]
          },
        ]
      }
      favoritos: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          tipo: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          tipo: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      ferramentas_ia: {
        Row: {
          ativo: boolean | null
          avaliacao: number | null
          categoria: string
          created_at: string | null
          gratuito: boolean | null
          id: string
          justificativa: string | null
          link_ferramenta: string | null
          logo_url: string | null
          nome: string
          o_que_entrega: string
          objetivo: string
          updated_at: string | null
          vale_a_pena: boolean | null
        }
        Insert: {
          ativo?: boolean | null
          avaliacao?: number | null
          categoria: string
          created_at?: string | null
          gratuito?: boolean | null
          id?: string
          justificativa?: string | null
          link_ferramenta?: string | null
          logo_url?: string | null
          nome: string
          o_que_entrega: string
          objetivo: string
          updated_at?: string | null
          vale_a_pena?: boolean | null
        }
        Update: {
          ativo?: boolean | null
          avaliacao?: number | null
          categoria?: string
          created_at?: string | null
          gratuito?: boolean | null
          id?: string
          justificativa?: string | null
          link_ferramenta?: string | null
          logo_url?: string | null
          nome?: string
          o_que_entrega?: string
          objetivo?: string
          updated_at?: string | null
          vale_a_pena?: boolean | null
        }
        Relationships: []
      }
      formulario_diagnostico: {
        Row: {
          area_aplicacao_ia: string | null
          area_atuacao: string | null
          area_atuacao_outro: string | null
          completado: boolean | null
          created_at: string | null
          desafio_1: string | null
          desafio_2: string | null
          desafio_3: string | null
          duvidas_preocupacoes: string | null
          estilo_aprendizagem: string | null
          experiencia_ia: string | null
          ferramentas_ia: Json | null
          frequencia_feedback: string | null
          frequencia_uso_ia: string | null
          id: string
          idade: number | null
          insight_gerado_em: string | null
          insight_ia: Json | null
          lidera_equipe: boolean | null
          limitacoes_tecnicas: string | null
          linkedin: string | null
          maior_dificuldade_ia: string | null
          maior_ladrao_tempo: string | null
          maior_medo_ia: string | null
          melhor_horario: string | null
          meta_12_meses: string | null
          meta_3_meses: string | null
          metricas_sucesso: string | null
          motivacao_mentoria: string | null
          nao_negociaveis: string | null
          nivel_autonomia: string | null
          nivel_comprometimento: number | null
          nivel_ia: string | null
          nome_completo: string | null
          objetivo_especifico: string | null
          objetivo_principal: string | null
          outras_ferramentas: string | null
          preferencia_aprendizado: string | null
          preferencia_sessoes: string | null
          processo_otimizar: string | null
          profissao: string | null
          quick_wins: Json | null
          tamanho_empresa: string | null
          tamanho_equipe: number | null
          tempo_disponivel: string | null
          tempo_experiencia: string | null
          tipo_feedback: string | null
          tipo_suporte: string | null
          updated_at: string | null
          user_id: string
          vitoria_30_dias: string | null
          zona_conforto: string | null
        }
        Insert: {
          area_aplicacao_ia?: string | null
          area_atuacao?: string | null
          area_atuacao_outro?: string | null
          completado?: boolean | null
          created_at?: string | null
          desafio_1?: string | null
          desafio_2?: string | null
          desafio_3?: string | null
          duvidas_preocupacoes?: string | null
          estilo_aprendizagem?: string | null
          experiencia_ia?: string | null
          ferramentas_ia?: Json | null
          frequencia_feedback?: string | null
          frequencia_uso_ia?: string | null
          id?: string
          idade?: number | null
          insight_gerado_em?: string | null
          insight_ia?: Json | null
          lidera_equipe?: boolean | null
          limitacoes_tecnicas?: string | null
          linkedin?: string | null
          maior_dificuldade_ia?: string | null
          maior_ladrao_tempo?: string | null
          maior_medo_ia?: string | null
          melhor_horario?: string | null
          meta_12_meses?: string | null
          meta_3_meses?: string | null
          metricas_sucesso?: string | null
          motivacao_mentoria?: string | null
          nao_negociaveis?: string | null
          nivel_autonomia?: string | null
          nivel_comprometimento?: number | null
          nivel_ia?: string | null
          nome_completo?: string | null
          objetivo_especifico?: string | null
          objetivo_principal?: string | null
          outras_ferramentas?: string | null
          preferencia_aprendizado?: string | null
          preferencia_sessoes?: string | null
          processo_otimizar?: string | null
          profissao?: string | null
          quick_wins?: Json | null
          tamanho_empresa?: string | null
          tamanho_equipe?: number | null
          tempo_disponivel?: string | null
          tempo_experiencia?: string | null
          tipo_feedback?: string | null
          tipo_suporte?: string | null
          updated_at?: string | null
          user_id: string
          vitoria_30_dias?: string | null
          zona_conforto?: string | null
        }
        Update: {
          area_aplicacao_ia?: string | null
          area_atuacao?: string | null
          area_atuacao_outro?: string | null
          completado?: boolean | null
          created_at?: string | null
          desafio_1?: string | null
          desafio_2?: string | null
          desafio_3?: string | null
          duvidas_preocupacoes?: string | null
          estilo_aprendizagem?: string | null
          experiencia_ia?: string | null
          ferramentas_ia?: Json | null
          frequencia_feedback?: string | null
          frequencia_uso_ia?: string | null
          id?: string
          idade?: number | null
          insight_gerado_em?: string | null
          insight_ia?: Json | null
          lidera_equipe?: boolean | null
          limitacoes_tecnicas?: string | null
          linkedin?: string | null
          maior_dificuldade_ia?: string | null
          maior_ladrao_tempo?: string | null
          maior_medo_ia?: string | null
          melhor_horario?: string | null
          meta_12_meses?: string | null
          meta_3_meses?: string | null
          metricas_sucesso?: string | null
          motivacao_mentoria?: string | null
          nao_negociaveis?: string | null
          nivel_autonomia?: string | null
          nivel_comprometimento?: number | null
          nivel_ia?: string | null
          nome_completo?: string | null
          objetivo_especifico?: string | null
          objetivo_principal?: string | null
          outras_ferramentas?: string | null
          preferencia_aprendizado?: string | null
          preferencia_sessoes?: string | null
          processo_otimizar?: string | null
          profissao?: string | null
          quick_wins?: Json | null
          tamanho_empresa?: string | null
          tamanho_equipe?: number | null
          tempo_disponivel?: string | null
          tempo_experiencia?: string | null
          tipo_feedback?: string | null
          tipo_suporte?: string | null
          updated_at?: string | null
          user_id?: string
          vitoria_30_dias?: string | null
          zona_conforto?: string | null
        }
        Relationships: []
      }
      ia_copie_use: {
        Row: {
          ativo: boolean | null
          categoria: string
          conteudo: string
          created_at: string | null
          descricao: string
          ia_recomendada: string | null
          id: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          conteudo: string
          created_at?: string | null
          descricao: string
          ia_recomendada?: string | null
          id?: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          conteudo?: string
          created_at?: string | null
          descricao?: string
          ia_recomendada?: string | null
          id?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          arquivo_url: string
          ativo: boolean | null
          categoria: string
          conteudo_extraido: string
          created_at: string | null
          created_by: string | null
          id: string
          tipo_arquivo: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          arquivo_url: string
          ativo?: boolean | null
          categoria: string
          conteudo_extraido: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          tipo_arquivo: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          arquivo_url?: string
          ativo?: boolean | null
          categoria?: string
          conteudo_extraido?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          tipo_arquivo?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      metodos_aplicar: {
        Row: {
          ativo: boolean | null
          categoria: string
          created_at: string | null
          descricao: string
          exemplo: string | null
          id: string
          template: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          created_at?: string | null
          descricao: string
          exemplo?: string | null
          id?: string
          template: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          created_at?: string | null
          descricao?: string
          exemplo?: string | null
          id?: string
          template?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      modulos: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          curso_id: string
          descricao: string | null
          id: string
          ordem: number
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          curso_id: string
          descricao?: string | null
          id?: string
          ordem?: number
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          curso_id?: string
          descricao?: string | null
          id?: string
          ordem?: number
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modulos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string | null
          id: string
          lida: boolean | null
          link: string | null
          mensagem: string | null
          tipo: string
          titulo: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lida?: boolean | null
          link?: string | null
          mensagem?: string | null
          tipo: string
          titulo: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lida?: boolean | null
          link?: string | null
          mensagem?: string | null
          tipo?: string
          titulo?: string
          user_id?: string | null
        }
        Relationships: []
      }
      objetivos_mentoria: {
        Row: {
          created_at: string | null
          id: string
          objetivo: string
          observacoes: string | null
          prazo: string | null
          progresso: number | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          objetivo: string
          observacoes?: string | null
          prazo?: string | null
          progresso?: number | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          objetivo?: string
          observacoes?: string | null
          prazo?: string | null
          progresso?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          idade: number | null
          linkedin: string | null
          nome_completo: string
          profissao: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          idade?: number | null
          linkedin?: string | null
          nome_completo: string
          profissao?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          idade?: number | null
          linkedin?: string | null
          nome_completo?: string
          profissao?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      progresso_videos: {
        Row: {
          completado: boolean | null
          created_at: string | null
          id: string
          tempo_assistido: number | null
          ultima_visualizacao: string | null
          updated_at: string | null
          user_id: string
          video_id: string
        }
        Insert: {
          completado?: boolean | null
          created_at?: string | null
          id?: string
          tempo_assistido?: number | null
          ultima_visualizacao?: string | null
          updated_at?: string | null
          user_id: string
          video_id: string
        }
        Update: {
          completado?: boolean | null
          created_at?: string | null
          id?: string
          tempo_assistido?: number | null
          ultima_visualizacao?: string | null
          updated_at?: string | null
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progresso_videos_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      trilhas: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          nivel: string
          ordem: number
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nivel: string
          ordem?: number
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nivel?: string
          ordem?: number
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          duracao: number | null
          id: string
          modulo_id: string
          ordem: number
          thumbnail_url: string | null
          titulo: string
          updated_at: string | null
          youtube_id: string
          youtube_url: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          duracao?: number | null
          id?: string
          modulo_id: string
          ordem?: number
          thumbnail_url?: string | null
          titulo: string
          updated_at?: string | null
          youtube_id: string
          youtube_url: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          duracao?: number | null
          id?: string
          modulo_id?: string
          ordem?: number
          thumbnail_url?: string | null
          titulo?: string
          updated_at?: string | null
          youtube_id?: string
          youtube_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "mentorado" | "aluno_trilha"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "mentorado", "aluno_trilha"],
    },
  },
} as const
