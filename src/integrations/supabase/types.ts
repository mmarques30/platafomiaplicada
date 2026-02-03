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
      admin_permissions: {
        Row: {
          admin_label: string
          admin_path: string
          can_access: boolean | null
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          admin_label: string
          admin_path: string
          can_access?: boolean | null
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          admin_label?: string
          admin_path?: string
          can_access?: boolean | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      auditoria_conteudo: {
        Row: {
          campos_alterados: string[] | null
          created_at: string | null
          dados_anteriores: Json | null
          dados_novos: Json | null
          id: string
          operacao: string
          registro_id: string
          tabela: string
          user_id: string | null
        }
        Insert: {
          campos_alterados?: string[] | null
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          operacao: string
          registro_id: string
          tabela: string
          user_id?: string | null
        }
        Update: {
          campos_alterados?: string[] | null
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          operacao?: string
          registro_id?: string
          tabela?: string
          user_id?: string | null
        }
        Relationships: []
      }
      aulas_semanais: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          data_aula: string | null
          descricao: string | null
          dia_semana: string | null
          horario: string | null
          id: string
          link_reuniao: string | null
          realizada: boolean | null
          recorrente: boolean | null
          tema: string
          tipo_evento: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          data_aula?: string | null
          descricao?: string | null
          dia_semana?: string | null
          horario?: string | null
          id?: string
          link_reuniao?: string | null
          realizada?: boolean | null
          recorrente?: boolean | null
          tema: string
          tipo_evento?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          data_aula?: string | null
          descricao?: string | null
          dia_semana?: string | null
          horario?: string | null
          id?: string
          link_reuniao?: string | null
          realizada?: boolean | null
          recorrente?: boolean | null
          tema?: string
          tipo_evento?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      avaliacoes_ferramentas_ia: {
        Row: {
          comentario: string | null
          created_at: string | null
          ferramenta_id: string
          id: string
          nota: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comentario?: string | null
          created_at?: string | null
          ferramenta_id: string
          id?: string
          nota: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comentario?: string | null
          created_at?: string | null
          ferramenta_id?: string
          id?: string
          nota?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_ferramentas_ia_ferramenta_id_fkey"
            columns: ["ferramenta_id"]
            isOneToOne: false
            referencedRelation: "ferramentas_ia"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes_materiais_comunidade: {
        Row: {
          comentario: string | null
          created_at: string | null
          id: string
          material_id: string
          nota: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comentario?: string | null
          created_at?: string | null
          id?: string
          material_id: string
          nota: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comentario?: string | null
          created_at?: string | null
          id?: string
          material_id?: string
          nota?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_materiais_comunidade_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais_comunidade"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_materiais_comunidade_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_materiais_comunidade_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
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
          visivel_para: string[] | null
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
          visivel_para?: string[] | null
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
          visivel_para?: string[] | null
        }
        Relationships: []
      }
      avisos_lidos: {
        Row: {
          aviso_id: string
          id: string
          lido_em: string | null
          user_id: string
        }
        Insert: {
          aviso_id: string
          id?: string
          lido_em?: string | null
          user_id: string
        }
        Update: {
          aviso_id?: string
          id?: string
          lido_em?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avisos_lidos_aviso_id_fkey"
            columns: ["aviso_id"]
            isOneToOne: false
            referencedRelation: "avisos"
            referencedColumns: ["id"]
          },
        ]
      }
      backlog_skills: {
        Row: {
          area_impactada: string | null
          created_at: string | null
          descricao: string | null
          equipe_id: string | null
          horas_estimadas_economia: number | null
          id: string
          ordem: number | null
          origem: string | null
          prioridade: string | null
          responsavel_id: string | null
          status: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          area_impactada?: string | null
          created_at?: string | null
          descricao?: string | null
          equipe_id?: string | null
          horas_estimadas_economia?: number | null
          id?: string
          ordem?: number | null
          origem?: string | null
          prioridade?: string | null
          responsavel_id?: string | null
          status?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          area_impactada?: string | null
          created_at?: string | null
          descricao?: string | null
          equipe_id?: string | null
          horas_estimadas_economia?: number | null
          id?: string
          ordem?: number | null
          origem?: string | null
          prioridade?: string | null
          responsavel_id?: string | null
          status?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "backlog_skills_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes_skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backlog_skills_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backlog_skills_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "ranking_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      biblioteca_prompts: {
        Row: {
          ativo: boolean | null
          categoria: string
          created_at: string | null
          descricao: string
          ferramentas_recomendadas: Json | null
          id: string
          modulo_id: string | null
          nivel_complexidade: string | null
          ordem: number | null
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
          ferramentas_recomendadas?: Json | null
          id?: string
          modulo_id?: string | null
          nivel_complexidade?: string | null
          ordem?: number | null
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
          ferramentas_recomendadas?: Json | null
          id?: string
          modulo_id?: string | null
          nivel_complexidade?: string | null
          ordem?: number | null
          prompt?: string
          tags?: Json | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "biblioteca_prompts_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      bonus_mentoria: {
        Row: {
          arquivo_url: Json | null
          comando_uso: string | null
          condicao_descricao: string | null
          condicao_tipo: string
          created_at: string | null
          data_liberacao: string | null
          descricao: string
          id: string
          liberado: boolean | null
          link: string | null
          nome: string
          publico_alvo: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          arquivo_url?: Json | null
          comando_uso?: string | null
          condicao_descricao?: string | null
          condicao_tipo?: string
          created_at?: string | null
          data_liberacao?: string | null
          descricao: string
          id?: string
          liberado?: boolean | null
          link?: string | null
          nome: string
          publico_alvo?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          arquivo_url?: Json | null
          comando_uso?: string | null
          condicao_descricao?: string | null
          condicao_tipo?: string
          created_at?: string | null
          data_liberacao?: string | null
          descricao?: string
          id?: string
          liberado?: boolean | null
          link?: string | null
          nome?: string
          publico_alvo?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bonus_usuarios_elegiveis: {
        Row: {
          bonus_id: string
          created_at: string | null
          data_liberacao: string | null
          id: string
          liberado: boolean | null
          user_id: string
        }
        Insert: {
          bonus_id: string
          created_at?: string | null
          data_liberacao?: string | null
          id?: string
          liberado?: boolean | null
          user_id: string
        }
        Update: {
          bonus_id?: string
          created_at?: string | null
          data_liberacao?: string | null
          id?: string
          liberado?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bonus_usuarios_elegiveis_bonus_id_fkey"
            columns: ["bonus_id"]
            isOneToOne: false
            referencedRelation: "bonus_mentoria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonus_usuarios_elegiveis_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonus_usuarios_elegiveis_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      button_click_logs: {
        Row: {
          button_type: string
          clicked_at: string | null
          id: string
          page_origin: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          button_type: string
          clicked_at?: string | null
          id?: string
          page_origin: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          button_type?: string
          clicked_at?: string | null
          id?: string
          page_origin?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      candidaturas_mentoria: {
        Row: {
          admin_responsavel: string | null
          autonomia_contratacao: string | null
          cargo_atual: string | null
          cargo_outro: string | null
          cidade_estado: string | null
          como_contribuir_grupo: string | null
          created_at: string | null
          data_contato: string | null
          descricao_implementacao: string | null
          email: string
          empresa_atual: string | null
          faixa_renda: string | null
          ferramentas_ia: string[] | null
          horas_semana_aprendizado: string | null
          id: string
          impedimento_comecar_hoje: string | null
          is_visitante_origem: boolean | null
          ja_implementou_ia: boolean | null
          ja_investiu_mentoria: boolean | null
          linkedin_url: string | null
          maximo_investido_desenvolvimento: string | null
          nivel_ia: number | null
          nome_completo: string
          notas_admin: string | null
          onde_quer_estar_2_anos: string | null
          origem_pagina: string | null
          outras_ferramentas: string | null
          outro_impedimento: string | null
          plano_origem: string | null
          por_que_escolher_voce: string
          por_que_nao_alcancou: string | null
          porte_empresa: string | null
          qtd_liderados: number | null
          quanto_investiu: string | null
          significado_sucesso_ia: string
          status: string | null
          tem_4k_10k_investir: string | null
          tempo_cargo: string | null
          tres_maiores_desafios: string
          updated_at: string | null
          urgencia_dominar_ia: number | null
          valor_disponivel: string | null
          whatsapp: string
        }
        Insert: {
          admin_responsavel?: string | null
          autonomia_contratacao?: string | null
          cargo_atual?: string | null
          cargo_outro?: string | null
          cidade_estado?: string | null
          como_contribuir_grupo?: string | null
          created_at?: string | null
          data_contato?: string | null
          descricao_implementacao?: string | null
          email: string
          empresa_atual?: string | null
          faixa_renda?: string | null
          ferramentas_ia?: string[] | null
          horas_semana_aprendizado?: string | null
          id?: string
          impedimento_comecar_hoje?: string | null
          is_visitante_origem?: boolean | null
          ja_implementou_ia?: boolean | null
          ja_investiu_mentoria?: boolean | null
          linkedin_url?: string | null
          maximo_investido_desenvolvimento?: string | null
          nivel_ia?: number | null
          nome_completo: string
          notas_admin?: string | null
          onde_quer_estar_2_anos?: string | null
          origem_pagina?: string | null
          outras_ferramentas?: string | null
          outro_impedimento?: string | null
          plano_origem?: string | null
          por_que_escolher_voce: string
          por_que_nao_alcancou?: string | null
          porte_empresa?: string | null
          qtd_liderados?: number | null
          quanto_investiu?: string | null
          significado_sucesso_ia: string
          status?: string | null
          tem_4k_10k_investir?: string | null
          tempo_cargo?: string | null
          tres_maiores_desafios: string
          updated_at?: string | null
          urgencia_dominar_ia?: number | null
          valor_disponivel?: string | null
          whatsapp: string
        }
        Update: {
          admin_responsavel?: string | null
          autonomia_contratacao?: string | null
          cargo_atual?: string | null
          cargo_outro?: string | null
          cidade_estado?: string | null
          como_contribuir_grupo?: string | null
          created_at?: string | null
          data_contato?: string | null
          descricao_implementacao?: string | null
          email?: string
          empresa_atual?: string | null
          faixa_renda?: string | null
          ferramentas_ia?: string[] | null
          horas_semana_aprendizado?: string | null
          id?: string
          impedimento_comecar_hoje?: string | null
          is_visitante_origem?: boolean | null
          ja_implementou_ia?: boolean | null
          ja_investiu_mentoria?: boolean | null
          linkedin_url?: string | null
          maximo_investido_desenvolvimento?: string | null
          nivel_ia?: number | null
          nome_completo?: string
          notas_admin?: string | null
          onde_quer_estar_2_anos?: string | null
          origem_pagina?: string | null
          outras_ferramentas?: string | null
          outro_impedimento?: string | null
          plano_origem?: string | null
          por_que_escolher_voce?: string
          por_que_nao_alcancou?: string | null
          porte_empresa?: string | null
          qtd_liderados?: number | null
          quanto_investiu?: string | null
          significado_sucesso_ia?: string
          status?: string | null
          tem_4k_10k_investir?: string | null
          tempo_cargo?: string | null
          tres_maiores_desafios?: string
          updated_at?: string | null
          urgencia_dominar_ia?: number | null
          valor_disponivel?: string | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidaturas_mentoria_admin_responsavel_fkey"
            columns: ["admin_responsavel"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidaturas_mentoria_admin_responsavel_fkey"
            columns: ["admin_responsavel"]
            isOneToOne: false
            referencedRelation: "ranking_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      categorias_qa: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          ordem: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      certificados: {
        Row: {
          codigo_verificacao: string | null
          created_at: string | null
          criterios: Json | null
          data_emissao: string | null
          descricao: string | null
          id: string
          progresso: number | null
          status: string
          titulo: string
          trilha_id: string
          updated_at: string | null
          url_pdf: string | null
          user_id: string
        }
        Insert: {
          codigo_verificacao?: string | null
          created_at?: string | null
          criterios?: Json | null
          data_emissao?: string | null
          descricao?: string | null
          id?: string
          progresso?: number | null
          status?: string
          titulo: string
          trilha_id: string
          updated_at?: string | null
          url_pdf?: string | null
          user_id: string
        }
        Update: {
          codigo_verificacao?: string | null
          created_at?: string | null
          criterios?: Json | null
          data_emissao?: string | null
          descricao?: string | null
          id?: string
          progresso?: number | null
          status?: string
          titulo?: string
          trilha_id?: string
          updated_at?: string | null
          url_pdf?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificados_trilha_id_fkey"
            columns: ["trilha_id"]
            isOneToOne: false
            referencedRelation: "trilhas"
            referencedColumns: ["id"]
          },
        ]
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
      community_categories: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          emoji: string | null
          id: string
          name: string
          ordem: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          emoji?: string | null
          id?: string
          name: string
          ordem?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          emoji?: string | null
          id?: string
          name?: string
          ordem?: number | null
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      community_posts: {
        Row: {
          category_id: string | null
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          media: Json | null
          pinned: boolean | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_id?: string | null
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media?: Json | null
          pinned?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_id?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media?: Json | null
          pinned?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "community_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      community_reactions: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          post_id: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      content_access_logs: {
        Row: {
          accessed_at: string | null
          content_id: string
          content_title: string | null
          content_type: string
          id: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          accessed_at?: string | null
          content_id: string
          content_title?: string | null
          content_type: string
          id?: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          accessed_at?: string | null
          content_id?: string
          content_title?: string | null
          content_type?: string
          id?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      conteudos_dashboard: {
        Row: {
          arquivo_pdf_url: string | null
          arquivos_url: Json | null
          ativo: boolean | null
          autor: string | null
          categoria: string | null
          conteudo: string | null
          created_at: string
          criador_id: string | null
          destaque: boolean | null
          estilo_texto: Json | null
          galeria_imagens: Json | null
          id: string
          imagem_url: string | null
          link_externo: string | null
          ordem: number | null
          resumo: string
          tags: Json | null
          tipo: string
          titulo: string
          updated_at: string
          visivel_gratuitos: boolean | null
        }
        Insert: {
          arquivo_pdf_url?: string | null
          arquivos_url?: Json | null
          ativo?: boolean | null
          autor?: string | null
          categoria?: string | null
          conteudo?: string | null
          created_at?: string
          criador_id?: string | null
          destaque?: boolean | null
          estilo_texto?: Json | null
          galeria_imagens?: Json | null
          id?: string
          imagem_url?: string | null
          link_externo?: string | null
          ordem?: number | null
          resumo: string
          tags?: Json | null
          tipo: string
          titulo: string
          updated_at?: string
          visivel_gratuitos?: boolean | null
        }
        Update: {
          arquivo_pdf_url?: string | null
          arquivos_url?: Json | null
          ativo?: boolean | null
          autor?: string | null
          categoria?: string | null
          conteudo?: string | null
          created_at?: string
          criador_id?: string | null
          destaque?: boolean | null
          estilo_texto?: Json | null
          galeria_imagens?: Json | null
          id?: string
          imagem_url?: string | null
          link_externo?: string | null
          ordem?: number | null
          resumo?: string
          tags?: Json | null
          tipo?: string
          titulo?: string
          updated_at?: string
          visivel_gratuitos?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "conteudos_dashboard_criador_id_fkey"
            columns: ["criador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conteudos_dashboard_criador_id_fkey"
            columns: ["criador_id"]
            isOneToOne: false
            referencedRelation: "ranking_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      conteudos_liberados_skills: {
        Row: {
          created_at: string | null
          equipe_id: string
          fase_roadmap_id: string | null
          id: string
          liberado_por: string | null
          modulo_id: string | null
          motivo: string | null
          ordem: number | null
          trilha_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          equipe_id: string
          fase_roadmap_id?: string | null
          id?: string
          liberado_por?: string | null
          modulo_id?: string | null
          motivo?: string | null
          ordem?: number | null
          trilha_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          equipe_id?: string
          fase_roadmap_id?: string | null
          id?: string
          liberado_por?: string | null
          modulo_id?: string | null
          motivo?: string | null
          ordem?: number | null
          trilha_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conteudos_liberados_skills_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes_skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conteudos_liberados_skills_fase_roadmap_id_fkey"
            columns: ["fase_roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmap_skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conteudos_liberados_skills_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conteudos_liberados_skills_trilha_id_fkey"
            columns: ["trilha_id"]
            isOneToOne: false
            referencedRelation: "trilhas"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos_business: {
        Row: {
          cases_referencia: string | null
          cnpj: string | null
          contexto_transformacao: string | null
          created_at: string
          creditos_iniciais: number | null
          data_assinatura: string | null
          data_fim: string | null
          data_inicio: string | null
          desafios_estrategicos: Json | null
          desafios_operacionais: Json | null
          dores_mapeadas: Json | null
          duracao_academy_meses: number | null
          endereco: string | null
          entregas_esperadas: Json | null
          fases_projeto: Json | null
          garantias: Json | null
          id: string
          metricas_performance: Json | null
          modulos_contratados: number
          modulos_selecionados: Json | null
          multa_rescisao_percentual: number | null
          nome_empresa: string | null
          numero_parcelas: number | null
          observacoes: string | null
          proximos_passos: Json | null
          razao_social: string | null
          reports_frequencia: string | null
          representante_cpf: string | null
          representante_email: string | null
          representante_nome: string | null
          representante_rg: string | null
          reunioes_mensais: number
          roi_projetado: number | null
          setor_atuacao: string | null
          solucao_proposta: Json | null
          status: string | null
          suporte_tipo: string | null
          tabela_manutencao: Json | null
          tempo_consultoria_meses: number
          updated_at: string
          user_id: string
          valor_contrato: number | null
          valor_credito_adicional: number | null
          valor_entrada: number | null
          valor_hora_tecnica: number | null
          valor_parcela: number | null
        }
        Insert: {
          cases_referencia?: string | null
          cnpj?: string | null
          contexto_transformacao?: string | null
          created_at?: string
          creditos_iniciais?: number | null
          data_assinatura?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          desafios_estrategicos?: Json | null
          desafios_operacionais?: Json | null
          dores_mapeadas?: Json | null
          duracao_academy_meses?: number | null
          endereco?: string | null
          entregas_esperadas?: Json | null
          fases_projeto?: Json | null
          garantias?: Json | null
          id?: string
          metricas_performance?: Json | null
          modulos_contratados?: number
          modulos_selecionados?: Json | null
          multa_rescisao_percentual?: number | null
          nome_empresa?: string | null
          numero_parcelas?: number | null
          observacoes?: string | null
          proximos_passos?: Json | null
          razao_social?: string | null
          reports_frequencia?: string | null
          representante_cpf?: string | null
          representante_email?: string | null
          representante_nome?: string | null
          representante_rg?: string | null
          reunioes_mensais?: number
          roi_projetado?: number | null
          setor_atuacao?: string | null
          solucao_proposta?: Json | null
          status?: string | null
          suporte_tipo?: string | null
          tabela_manutencao?: Json | null
          tempo_consultoria_meses?: number
          updated_at?: string
          user_id: string
          valor_contrato?: number | null
          valor_credito_adicional?: number | null
          valor_entrada?: number | null
          valor_hora_tecnica?: number | null
          valor_parcela?: number | null
        }
        Update: {
          cases_referencia?: string | null
          cnpj?: string | null
          contexto_transformacao?: string | null
          created_at?: string
          creditos_iniciais?: number | null
          data_assinatura?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          desafios_estrategicos?: Json | null
          desafios_operacionais?: Json | null
          dores_mapeadas?: Json | null
          duracao_academy_meses?: number | null
          endereco?: string | null
          entregas_esperadas?: Json | null
          fases_projeto?: Json | null
          garantias?: Json | null
          id?: string
          metricas_performance?: Json | null
          modulos_contratados?: number
          modulos_selecionados?: Json | null
          multa_rescisao_percentual?: number | null
          nome_empresa?: string | null
          numero_parcelas?: number | null
          observacoes?: string | null
          proximos_passos?: Json | null
          razao_social?: string | null
          reports_frequencia?: string | null
          representante_cpf?: string | null
          representante_email?: string | null
          representante_nome?: string | null
          representante_rg?: string | null
          reunioes_mensais?: number
          roi_projetado?: number | null
          setor_atuacao?: string | null
          solucao_proposta?: Json | null
          status?: string | null
          suporte_tipo?: string | null
          tabela_manutencao?: Json | null
          tempo_consultoria_meses?: number
          updated_at?: string
          user_id?: string
          valor_contrato?: number | null
          valor_credito_adicional?: number | null
          valor_entrada?: number | null
          valor_hora_tecnica?: number | null
          valor_parcela?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_business_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_business_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cupons_visitantes: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string | null
          desconto_percentual: number
          descricao: string | null
          id: string
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string | null
          desconto_percentual: number
          descricao?: string | null
          id?: string
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string | null
          desconto_percentual?: number
          descricao?: string | null
          id?: string
          tipo?: string | null
          updated_at?: string | null
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
      descontos: {
        Row: {
          ativo: boolean | null
          codigo: string | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          motivo: string
          nome: string
          produtos_ids: Json | null
          tipo_desconto: string
          updated_at: string | null
          valor: number
        }
        Insert: {
          ativo?: boolean | null
          codigo?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          motivo: string
          nome: string
          produtos_ids?: Json | null
          tipo_desconto: string
          updated_at?: string | null
          valor: number
        }
        Update: {
          ativo?: boolean | null
          codigo?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          motivo?: string
          nome?: string
          produtos_ids?: Json | null
          tipo_desconto?: string
          updated_at?: string | null
          valor?: number
        }
        Relationships: []
      }
      diagnostico_consolidado_skills: {
        Row: {
          created_at: string | null
          dores_comuns: Json | null
          equipe_id: string | null
          gerado_em: string | null
          id: string
          insights_ia: string | null
          potencial_economia_horas: number | null
          processos_maior_potencial: Json | null
          recomendacoes: Json | null
          sobreposicoes_esforco: Json | null
          total_horas_manuais_semana: number | null
          updated_at: string | null
          versao: number | null
        }
        Insert: {
          created_at?: string | null
          dores_comuns?: Json | null
          equipe_id?: string | null
          gerado_em?: string | null
          id?: string
          insights_ia?: string | null
          potencial_economia_horas?: number | null
          processos_maior_potencial?: Json | null
          recomendacoes?: Json | null
          sobreposicoes_esforco?: Json | null
          total_horas_manuais_semana?: number | null
          updated_at?: string | null
          versao?: number | null
        }
        Update: {
          created_at?: string | null
          dores_comuns?: Json | null
          equipe_id?: string | null
          gerado_em?: string | null
          id?: string
          insights_ia?: string | null
          potencial_economia_horas?: number | null
          processos_maior_potencial?: Json | null
          recomendacoes?: Json | null
          sobreposicoes_esforco?: Json | null
          total_horas_manuais_semana?: number | null
          updated_at?: string | null
          versao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnostico_consolidado_skills_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: true
            referencedRelation: "equipes_skills"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnosticos_skills: {
        Row: {
          area_atuacao: string | null
          cargo: string | null
          completado: boolean | null
          created_at: string | null
          equipe_id: string | null
          ferramentas_atuais: Json | null
          gargalos_identificados: Json | null
          id: string
          interesse_em_ia: string | null
          ja_usou_ia: string | null
          onde_perde_mais_tempo: string | null
          onde_poderia_ser_mais_produtivo: string | null
          processos_mais_demorados: string | null
          processos_repetitivos: string | null
          tarefas_manuais: Json | null
          tempo_na_empresa: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          area_atuacao?: string | null
          cargo?: string | null
          completado?: boolean | null
          created_at?: string | null
          equipe_id?: string | null
          ferramentas_atuais?: Json | null
          gargalos_identificados?: Json | null
          id?: string
          interesse_em_ia?: string | null
          ja_usou_ia?: string | null
          onde_perde_mais_tempo?: string | null
          onde_poderia_ser_mais_produtivo?: string | null
          processos_mais_demorados?: string | null
          processos_repetitivos?: string | null
          tarefas_manuais?: Json | null
          tempo_na_empresa?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          area_atuacao?: string | null
          cargo?: string | null
          completado?: boolean | null
          created_at?: string | null
          equipe_id?: string | null
          ferramentas_atuais?: Json | null
          gargalos_identificados?: Json | null
          id?: string
          interesse_em_ia?: string | null
          ja_usou_ia?: string | null
          onde_perde_mais_tempo?: string | null
          onde_poderia_ser_mais_produtivo?: string | null
          processos_mais_demorados?: string | null
          processos_repetitivos?: string | null
          tarefas_manuais?: Json | null
          tempo_na_empresa?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnosticos_skills_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes_skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnosticos_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnosticos_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      documentos_business: {
        Row: {
          arquivo_url: string | null
          conteudo_texto: string | null
          contrato_id: string | null
          created_at: string | null
          id: string
          para_processamento_ia: boolean | null
          processado: boolean | null
          resultado_ia: Json | null
          tipo: string | null
          titulo: string
        }
        Insert: {
          arquivo_url?: string | null
          conteudo_texto?: string | null
          contrato_id?: string | null
          created_at?: string | null
          id?: string
          para_processamento_ia?: boolean | null
          processado?: boolean | null
          resultado_ia?: Json | null
          tipo?: string | null
          titulo: string
        }
        Update: {
          arquivo_url?: string | null
          conteudo_texto?: string | null
          contrato_id?: string | null
          created_at?: string | null
          id?: string
          para_processamento_ia?: boolean | null
          processado?: boolean | null
          resultado_ia?: Json | null
          tipo?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_business_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos_business"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_legais: {
        Row: {
          apenas_mentorados: boolean | null
          conteudo_mentorados: string
          conteudo_visitantes: string | null
          created_at: string | null
          id: string
          slug: string
          titulo: string
          ultima_atualizacao: string | null
          updated_at: string | null
        }
        Insert: {
          apenas_mentorados?: boolean | null
          conteudo_mentorados: string
          conteudo_visitantes?: string | null
          created_at?: string | null
          id?: string
          slug: string
          titulo: string
          ultima_atualizacao?: string | null
          updated_at?: string | null
        }
        Update: {
          apenas_mentorados?: boolean | null
          conteudo_mentorados?: string
          conteudo_visitantes?: string | null
          created_at?: string | null
          id?: string
          slug?: string
          titulo?: string
          ultima_atualizacao?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      duvidas_mentoria: {
        Row: {
          atrasada: boolean | null
          categoria_qa_id: string | null
          contexto: string | null
          created_at: string | null
          duvida: string
          horas_para_vencer: number | null
          id: string
          prazo_sla: string
          prioridade: string
          publicado_qa_em: string | null
          publicar_qa: boolean | null
          respondida_em: string | null
          respondida_por: string | null
          resposta_mentor: string | null
          status: string
          tags: Json | null
          titulo: string
          updated_at: string | null
          user_id: string
          video_qa_url: string | null
        }
        Insert: {
          atrasada?: boolean | null
          categoria_qa_id?: string | null
          contexto?: string | null
          created_at?: string | null
          duvida: string
          horas_para_vencer?: number | null
          id?: string
          prazo_sla: string
          prioridade?: string
          publicado_qa_em?: string | null
          publicar_qa?: boolean | null
          respondida_em?: string | null
          respondida_por?: string | null
          resposta_mentor?: string | null
          status?: string
          tags?: Json | null
          titulo: string
          updated_at?: string | null
          user_id: string
          video_qa_url?: string | null
        }
        Update: {
          atrasada?: boolean | null
          categoria_qa_id?: string | null
          contexto?: string | null
          created_at?: string | null
          duvida?: string
          horas_para_vencer?: number | null
          id?: string
          prazo_sla?: string
          prioridade?: string
          publicado_qa_em?: string | null
          publicar_qa?: boolean | null
          respondida_em?: string | null
          respondida_por?: string | null
          resposta_mentor?: string | null
          status?: string
          tags?: Json | null
          titulo?: string
          updated_at?: string | null
          user_id?: string
          video_qa_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "duvidas_mentoria_categoria_qa_id_fkey"
            columns: ["categoria_qa_id"]
            isOneToOne: false
            referencedRelation: "categorias_qa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duvidas_mentoria_respondida_por_fkey"
            columns: ["respondida_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duvidas_mentoria_respondida_por_fkey"
            columns: ["respondida_por"]
            isOneToOne: false
            referencedRelation: "ranking_dashboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "duvidas_mentoria_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duvidas_mentoria_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      entregas_business: {
        Row: {
          contrato_id: string | null
          created_at: string | null
          descricao: string | null
          etapa_id: string | null
          id: string
          justificativa_backlog: string | null
          modulo_relacionado: string | null
          numero_entrega: number | null
          ordem: number | null
          prazo_previsto: string | null
          prioridade: string | null
          status: string | null
          tem_instrucoes: boolean | null
          tipo: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          contrato_id?: string | null
          created_at?: string | null
          descricao?: string | null
          etapa_id?: string | null
          id?: string
          justificativa_backlog?: string | null
          modulo_relacionado?: string | null
          numero_entrega?: number | null
          ordem?: number | null
          prazo_previsto?: string | null
          prioridade?: string | null
          status?: string | null
          tem_instrucoes?: boolean | null
          tipo?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          contrato_id?: string | null
          created_at?: string | null
          descricao?: string | null
          etapa_id?: string | null
          id?: string
          justificativa_backlog?: string | null
          modulo_relacionado?: string | null
          numero_entrega?: number | null
          ordem?: number | null
          prazo_previsto?: string | null
          prioridade?: string | null
          status?: string | null
          tem_instrucoes?: boolean | null
          tipo?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entregas_business_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos_business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregas_business_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "etapas_business"
            referencedColumns: ["id"]
          },
        ]
      }
      entregas_skills: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          backlog_item_id: string | null
          created_at: string | null
          descricao: string | null
          equipe_id: string | null
          id: string
          instrucoes: string | null
          prazo: string | null
          prompts_recomendados: Json | null
          responsavel_id: string | null
          roadmap_fase_id: string | null
          status: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          backlog_item_id?: string | null
          created_at?: string | null
          descricao?: string | null
          equipe_id?: string | null
          id?: string
          instrucoes?: string | null
          prazo?: string | null
          prompts_recomendados?: Json | null
          responsavel_id?: string | null
          roadmap_fase_id?: string | null
          status?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          backlog_item_id?: string | null
          created_at?: string | null
          descricao?: string | null
          equipe_id?: string | null
          id?: string
          instrucoes?: string | null
          prazo?: string | null
          prompts_recomendados?: Json | null
          responsavel_id?: string | null
          roadmap_fase_id?: string | null
          status?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entregas_skills_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregas_skills_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "ranking_dashboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "entregas_skills_backlog_item_id_fkey"
            columns: ["backlog_item_id"]
            isOneToOne: false
            referencedRelation: "backlog_skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregas_skills_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes_skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregas_skills_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregas_skills_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "ranking_dashboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "entregas_skills_roadmap_fase_id_fkey"
            columns: ["roadmap_fase_id"]
            isOneToOne: false
            referencedRelation: "roadmap_skills"
            referencedColumns: ["id"]
          },
        ]
      }
      equipes_skills: {
        Row: {
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          empresa_nome: string | null
          id: string
          lider_id: string | null
          nome: string
          setor: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          empresa_nome?: string | null
          id?: string
          lider_id?: string | null
          nome: string
          setor?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          empresa_nome?: string | null
          id?: string
          lider_id?: string | null
          nome?: string
          setor?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipes_skills_lider_id_fkey"
            columns: ["lider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipes_skills_lider_id_fkey"
            columns: ["lider_id"]
            isOneToOne: false
            referencedRelation: "ranking_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      etapas_business: {
        Row: {
          contrato_id: string | null
          created_at: string | null
          data_conclusao: string | null
          data_prevista: string | null
          id: string
          marcos_proxima_etapa: string[] | null
          numero_etapa: number
          objetivo: string | null
          status: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          contrato_id?: string | null
          created_at?: string | null
          data_conclusao?: string | null
          data_prevista?: string | null
          id?: string
          marcos_proxima_etapa?: string[] | null
          numero_etapa: number
          objetivo?: string | null
          status?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          contrato_id?: string | null
          created_at?: string | null
          data_conclusao?: string | null
          data_prevista?: string | null
          id?: string
          marcos_proxima_etapa?: string[] | null
          numero_etapa?: number
          objetivo?: string | null
          status?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "etapas_business_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos_business"
            referencedColumns: ["id"]
          },
        ]
      }
      exercicios_praticos: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string
          id: string
          tipo_resposta: string
          titulo: string
          updated_at: string | null
          video_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao: string
          id?: string
          tipo_resposta: string
          titulo: string
          updated_at?: string | null
          video_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string
          id?: string
          tipo_resposta?: string
          titulo?: string
          updated_at?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercicios_praticos_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      fases_processo_mentoria: {
        Row: {
          created_at: string | null
          data_conclusao: string | null
          data_inicio: string | null
          descricao: string | null
          fase_numero: number
          id: string
          nome_fase: string
          observacoes: string | null
          projeto_associado_id: string | null
          sessao_associada_id: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          descricao?: string | null
          fase_numero: number
          id?: string
          nome_fase: string
          observacoes?: string | null
          projeto_associado_id?: string | null
          sessao_associada_id?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          descricao?: string | null
          fase_numero?: number
          id?: string
          nome_fase?: string
          observacoes?: string | null
          projeto_associado_id?: string | null
          sessao_associada_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fases_processo_mentoria_projeto_associado_id_fkey"
            columns: ["projeto_associado_id"]
            isOneToOne: false
            referencedRelation: "projetos_mentoria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fases_processo_mentoria_sessao_associada_id_fkey"
            columns: ["sessao_associada_id"]
            isOneToOne: false
            referencedRelation: "sessoes_mentoria"
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
      ferramentas_compartilhadas: {
        Row: {
          ativo: boolean | null
          categoria: string
          created_at: string | null
          descricao: string
          id: string
          link: string | null
          nome: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          created_at?: string | null
          descricao: string
          id?: string
          link?: string | null
          nome: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          created_at?: string | null
          descricao?: string
          id?: string
          link?: string | null
          nome?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ferramentas_ia: {
        Row: {
          ativo: boolean | null
          avaliacao: number | null
          avaliacao_comunidade: number | null
          avaliacao_mari: number | null
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
          total_avaliacoes_comunidade: number | null
          updated_at: string | null
          vale_a_pena: boolean | null
        }
        Insert: {
          ativo?: boolean | null
          avaliacao?: number | null
          avaliacao_comunidade?: number | null
          avaliacao_mari?: number | null
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
          total_avaliacoes_comunidade?: number | null
          updated_at?: string | null
          vale_a_pena?: boolean | null
        }
        Update: {
          ativo?: boolean | null
          avaliacao?: number | null
          avaliacao_comunidade?: number | null
          avaliacao_mari?: number | null
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
          total_avaliacoes_comunidade?: number | null
          updated_at?: string | null
          vale_a_pena?: boolean | null
        }
        Relationships: []
      }
      formulario_diagnostico: {
        Row: {
          agendar_call_alinhamento: string | null
          area_aplicacao_ia: string | null
          area_atuacao: string | null
          area_atuacao_outro: string | null
          areas_futuro_ia: Json | null
          arquivo_diagnostico_url: string | null
          cargo_atual: string | null
          como_conheceu_iaplicada: string | null
          como_medir_sucesso: string | null
          completado: boolean | null
          created_at: string | null
          decisor_especifico: string | null
          decisores_tecnologia: string | null
          definicao_sucesso: string | null
          desafio_1: string | null
          desafio_2: string | null
          desafio_3: string | null
          desafio_principal_negocio: string | null
          direcional_entregas: string | null
          disponibilidade_treinamento: string | null
          duvidas_preocupacoes: string | null
          empresa_nome: string | null
          equipe_precisa_aprender: string | null
          estilo_aprendizagem: string | null
          experiencia_consultorias: string | null
          experiencia_ia: string | null
          feedback_mentora_em: string | null
          ferramentas_ia: Json | null
          frequencia_feedback: string | null
          frequencia_uso_ia: string | null
          gatilho_renovacao: string | null
          id: string
          idade: number | null
          impacto_financeiro_estimado: string | null
          importancia_projeto: number | null
          insight_gerado_em: string | null
          insight_ia: Json | null
          interesse_alem_entrega: Json | null
          ja_tentou_antes: string | null
          kpi_principal: string | null
          lidera_equipe: boolean | null
          limitacoes_tecnicas: string | null
          link_plano_execucao: string | null
          linkedin: string | null
          maior_dificuldade_ia: string | null
          maior_ladrao_tempo: string | null
          maior_medo_ia: string | null
          maior_preocupacao: string | null
          melhor_horario: string | null
          meta_12_meses: string | null
          meta_3_meses: string | null
          metricas_sucesso: string | null
          motivacao_mentoria: string | null
          motivo_escolha_iaplicada: string | null
          nao_negociaveis: string | null
          nao_pode_acontecer: string | null
          nivel_autonomia: string | null
          nivel_comprometimento: number | null
          nivel_envolvimento: string | null
          nivel_ia: string | null
          nome_completo: string | null
          o_que_aprender: string | null
          objetivo_especifico: string | null
          objetivo_principal: string | null
          observacoes_admin: string | null
          orcamento_expansao: string | null
          outras_areas_potencial: string | null
          outras_ferramentas: string | null
          outros_decisores: string | null
          outros_sistemas: string | null
          pessoas_para_capacitar_skills: string | null
          plano_gerado: boolean | null
          plano_gerado_em: string | null
          plano_gerado_por: string | null
          preenchido_por: string | null
          preferencia_acompanhamento: string | null
          preferencia_aprendizado: string | null
          preferencia_comunicacao: string | null
          preferencia_sessoes: string | null
          problema_principal: string | null
          processo_automatizar: string | null
          processo_otimizar: string | null
          profissao: string | null
          proximo_projeto_ia: string | null
          quantos_capacitar: number | null
          quem_vai_usar: string | null
          quer_aprender: string | null
          quick_wins: Json | null
          resultado_esperado: string | null
          sistemas_integrar: Json | null
          tamanho_empresa: string | null
          tamanho_equipe: number | null
          tem_equipe: boolean | null
          tempo_disponivel: string | null
          tempo_experiencia: string | null
          tipo_feedback: string | null
          tipo_suporte: string | null
          transcricao_call_url: string | null
          updated_at: string | null
          urgencia_solucao: string | null
          user_id: string
          video_call_url: string | null
          vitoria_30_dias: string | null
          volume_uso: string | null
          zona_conforto: string | null
        }
        Insert: {
          agendar_call_alinhamento?: string | null
          area_aplicacao_ia?: string | null
          area_atuacao?: string | null
          area_atuacao_outro?: string | null
          areas_futuro_ia?: Json | null
          arquivo_diagnostico_url?: string | null
          cargo_atual?: string | null
          como_conheceu_iaplicada?: string | null
          como_medir_sucesso?: string | null
          completado?: boolean | null
          created_at?: string | null
          decisor_especifico?: string | null
          decisores_tecnologia?: string | null
          definicao_sucesso?: string | null
          desafio_1?: string | null
          desafio_2?: string | null
          desafio_3?: string | null
          desafio_principal_negocio?: string | null
          direcional_entregas?: string | null
          disponibilidade_treinamento?: string | null
          duvidas_preocupacoes?: string | null
          empresa_nome?: string | null
          equipe_precisa_aprender?: string | null
          estilo_aprendizagem?: string | null
          experiencia_consultorias?: string | null
          experiencia_ia?: string | null
          feedback_mentora_em?: string | null
          ferramentas_ia?: Json | null
          frequencia_feedback?: string | null
          frequencia_uso_ia?: string | null
          gatilho_renovacao?: string | null
          id?: string
          idade?: number | null
          impacto_financeiro_estimado?: string | null
          importancia_projeto?: number | null
          insight_gerado_em?: string | null
          insight_ia?: Json | null
          interesse_alem_entrega?: Json | null
          ja_tentou_antes?: string | null
          kpi_principal?: string | null
          lidera_equipe?: boolean | null
          limitacoes_tecnicas?: string | null
          link_plano_execucao?: string | null
          linkedin?: string | null
          maior_dificuldade_ia?: string | null
          maior_ladrao_tempo?: string | null
          maior_medo_ia?: string | null
          maior_preocupacao?: string | null
          melhor_horario?: string | null
          meta_12_meses?: string | null
          meta_3_meses?: string | null
          metricas_sucesso?: string | null
          motivacao_mentoria?: string | null
          motivo_escolha_iaplicada?: string | null
          nao_negociaveis?: string | null
          nao_pode_acontecer?: string | null
          nivel_autonomia?: string | null
          nivel_comprometimento?: number | null
          nivel_envolvimento?: string | null
          nivel_ia?: string | null
          nome_completo?: string | null
          o_que_aprender?: string | null
          objetivo_especifico?: string | null
          objetivo_principal?: string | null
          observacoes_admin?: string | null
          orcamento_expansao?: string | null
          outras_areas_potencial?: string | null
          outras_ferramentas?: string | null
          outros_decisores?: string | null
          outros_sistemas?: string | null
          pessoas_para_capacitar_skills?: string | null
          plano_gerado?: boolean | null
          plano_gerado_em?: string | null
          plano_gerado_por?: string | null
          preenchido_por?: string | null
          preferencia_acompanhamento?: string | null
          preferencia_aprendizado?: string | null
          preferencia_comunicacao?: string | null
          preferencia_sessoes?: string | null
          problema_principal?: string | null
          processo_automatizar?: string | null
          processo_otimizar?: string | null
          profissao?: string | null
          proximo_projeto_ia?: string | null
          quantos_capacitar?: number | null
          quem_vai_usar?: string | null
          quer_aprender?: string | null
          quick_wins?: Json | null
          resultado_esperado?: string | null
          sistemas_integrar?: Json | null
          tamanho_empresa?: string | null
          tamanho_equipe?: number | null
          tem_equipe?: boolean | null
          tempo_disponivel?: string | null
          tempo_experiencia?: string | null
          tipo_feedback?: string | null
          tipo_suporte?: string | null
          transcricao_call_url?: string | null
          updated_at?: string | null
          urgencia_solucao?: string | null
          user_id: string
          video_call_url?: string | null
          vitoria_30_dias?: string | null
          volume_uso?: string | null
          zona_conforto?: string | null
        }
        Update: {
          agendar_call_alinhamento?: string | null
          area_aplicacao_ia?: string | null
          area_atuacao?: string | null
          area_atuacao_outro?: string | null
          areas_futuro_ia?: Json | null
          arquivo_diagnostico_url?: string | null
          cargo_atual?: string | null
          como_conheceu_iaplicada?: string | null
          como_medir_sucesso?: string | null
          completado?: boolean | null
          created_at?: string | null
          decisor_especifico?: string | null
          decisores_tecnologia?: string | null
          definicao_sucesso?: string | null
          desafio_1?: string | null
          desafio_2?: string | null
          desafio_3?: string | null
          desafio_principal_negocio?: string | null
          direcional_entregas?: string | null
          disponibilidade_treinamento?: string | null
          duvidas_preocupacoes?: string | null
          empresa_nome?: string | null
          equipe_precisa_aprender?: string | null
          estilo_aprendizagem?: string | null
          experiencia_consultorias?: string | null
          experiencia_ia?: string | null
          feedback_mentora_em?: string | null
          ferramentas_ia?: Json | null
          frequencia_feedback?: string | null
          frequencia_uso_ia?: string | null
          gatilho_renovacao?: string | null
          id?: string
          idade?: number | null
          impacto_financeiro_estimado?: string | null
          importancia_projeto?: number | null
          insight_gerado_em?: string | null
          insight_ia?: Json | null
          interesse_alem_entrega?: Json | null
          ja_tentou_antes?: string | null
          kpi_principal?: string | null
          lidera_equipe?: boolean | null
          limitacoes_tecnicas?: string | null
          link_plano_execucao?: string | null
          linkedin?: string | null
          maior_dificuldade_ia?: string | null
          maior_ladrao_tempo?: string | null
          maior_medo_ia?: string | null
          maior_preocupacao?: string | null
          melhor_horario?: string | null
          meta_12_meses?: string | null
          meta_3_meses?: string | null
          metricas_sucesso?: string | null
          motivacao_mentoria?: string | null
          motivo_escolha_iaplicada?: string | null
          nao_negociaveis?: string | null
          nao_pode_acontecer?: string | null
          nivel_autonomia?: string | null
          nivel_comprometimento?: number | null
          nivel_envolvimento?: string | null
          nivel_ia?: string | null
          nome_completo?: string | null
          o_que_aprender?: string | null
          objetivo_especifico?: string | null
          objetivo_principal?: string | null
          observacoes_admin?: string | null
          orcamento_expansao?: string | null
          outras_areas_potencial?: string | null
          outras_ferramentas?: string | null
          outros_decisores?: string | null
          outros_sistemas?: string | null
          pessoas_para_capacitar_skills?: string | null
          plano_gerado?: boolean | null
          plano_gerado_em?: string | null
          plano_gerado_por?: string | null
          preenchido_por?: string | null
          preferencia_acompanhamento?: string | null
          preferencia_aprendizado?: string | null
          preferencia_comunicacao?: string | null
          preferencia_sessoes?: string | null
          problema_principal?: string | null
          processo_automatizar?: string | null
          processo_otimizar?: string | null
          profissao?: string | null
          proximo_projeto_ia?: string | null
          quantos_capacitar?: number | null
          quem_vai_usar?: string | null
          quer_aprender?: string | null
          quick_wins?: Json | null
          resultado_esperado?: string | null
          sistemas_integrar?: Json | null
          tamanho_empresa?: string | null
          tamanho_equipe?: number | null
          tem_equipe?: boolean | null
          tempo_disponivel?: string | null
          tempo_experiencia?: string | null
          tipo_feedback?: string | null
          tipo_suporte?: string | null
          transcricao_call_url?: string | null
          updated_at?: string | null
          urgencia_solucao?: string | null
          user_id?: string
          video_call_url?: string | null
          vitoria_30_dias?: string | null
          volume_uso?: string | null
          zona_conforto?: string | null
        }
        Relationships: []
      }
      formularios_customizados: {
        Row: {
          created_at: string | null
          created_by: string
          data_criacao: string | null
          data_expiracao: string | null
          descricao: string | null
          id: string
          mentorados_ids: Json | null
          perguntas_geradas: Json
          status: string
          texto_original: string
          titulo: string
          total_respostas: number | null
          updated_at: string | null
          visibilidade: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          data_criacao?: string | null
          data_expiracao?: string | null
          descricao?: string | null
          id?: string
          mentorados_ids?: Json | null
          perguntas_geradas: Json
          status?: string
          texto_original: string
          titulo: string
          total_respostas?: number | null
          updated_at?: string | null
          visibilidade?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          data_criacao?: string | null
          data_expiracao?: string | null
          descricao?: string | null
          id?: string
          mentorados_ids?: Json | null
          perguntas_geradas?: Json
          status?: string
          texto_original?: string
          titulo?: string
          total_respostas?: number | null
          updated_at?: string | null
          visibilidade?: string
        }
        Relationships: []
      }
      formularios_sistema: {
        Row: {
          ativo: boolean | null
          categoria: string
          created_at: string | null
          descricao: string | null
          etapas: number | null
          icon: string | null
          id: string
          rota_admin: string | null
          rota_form: string | null
          slug: string
          tipo: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          created_at?: string | null
          descricao?: string | null
          etapas?: number | null
          icon?: string | null
          id?: string
          rota_admin?: string | null
          rota_form?: string | null
          slug: string
          tipo: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          created_at?: string | null
          descricao?: string | null
          etapas?: number | null
          icon?: string | null
          id?: string
          rota_admin?: string | null
          rota_form?: string | null
          slug?: string
          tipo?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ia_copie_use: {
        Row: {
          arquivos_url: Json | null
          ativo: boolean | null
          categoria: string
          conteudo: string
          created_at: string | null
          descricao: string
          ferramentas_recomendadas: Json | null
          ia_recomendada: string | null
          id: string
          links_url: Json | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          arquivos_url?: Json | null
          ativo?: boolean | null
          categoria: string
          conteudo: string
          created_at?: string | null
          descricao: string
          ferramentas_recomendadas?: Json | null
          ia_recomendada?: string | null
          id?: string
          links_url?: Json | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          arquivos_url?: Json | null
          ativo?: boolean | null
          categoria?: string
          conteudo?: string
          created_at?: string | null
          descricao?: string
          ferramentas_recomendadas?: Json | null
          ia_recomendada?: string | null
          id?: string
          links_url?: Json | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      instrucoes_etapa: {
        Row: {
          created_at: string | null
          descricao: string | null
          dicas: string | null
          entrega_id: string | null
          etapa_id: string | null
          ferramenta: string | null
          gerado_por_ia: boolean | null
          id: string
          ordem: number | null
          prompt_sugerido: string | null
          recursos: Json | null
          recursos_url: string | null
          responsavel: string
          status: string | null
          titulo: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          dicas?: string | null
          entrega_id?: string | null
          etapa_id?: string | null
          ferramenta?: string | null
          gerado_por_ia?: boolean | null
          id?: string
          ordem?: number | null
          prompt_sugerido?: string | null
          recursos?: Json | null
          recursos_url?: string | null
          responsavel: string
          status?: string | null
          titulo: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          dicas?: string | null
          entrega_id?: string | null
          etapa_id?: string | null
          ferramenta?: string | null
          gerado_por_ia?: boolean | null
          id?: string
          ordem?: number | null
          prompt_sugerido?: string | null
          recursos?: Json | null
          recursos_url?: string | null
          responsavel?: string
          status?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "instrucoes_etapa_entrega_id_fkey"
            columns: ["entrega_id"]
            isOneToOne: false
            referencedRelation: "entregas_business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instrucoes_etapa_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "etapas_business"
            referencedColumns: ["id"]
          },
        ]
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
      links_business: {
        Row: {
          ativo: boolean | null
          contrato_id: string
          created_at: string | null
          descricao: string | null
          icone: string | null
          id: string
          ordem: number | null
          titulo: string
          updated_at: string | null
          url: string
        }
        Insert: {
          ativo?: boolean | null
          contrato_id: string
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          ordem?: number | null
          titulo: string
          updated_at?: string | null
          url: string
        }
        Update: {
          ativo?: boolean | null
          contrato_id?: string
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          ordem?: number | null
          titulo?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_business_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos_business"
            referencedColumns: ["id"]
          },
        ]
      }
      materiais_comunidade: {
        Row: {
          adicionado_por: string | null
          arquivos_url: Json | null
          ativo: boolean | null
          categoria: string
          conteudo_texto: string | null
          created_at: string | null
          criador_id: string | null
          descricao: string | null
          id: string
          media_avaliacoes: number | null
          ordem: number | null
          tipo: string
          titulo: string
          total_avaliacoes: number | null
          total_comentarios: number | null
          updated_at: string | null
          visibilidade: string
        }
        Insert: {
          adicionado_por?: string | null
          arquivos_url?: Json | null
          ativo?: boolean | null
          categoria: string
          conteudo_texto?: string | null
          created_at?: string | null
          criador_id?: string | null
          descricao?: string | null
          id?: string
          media_avaliacoes?: number | null
          ordem?: number | null
          tipo: string
          titulo: string
          total_avaliacoes?: number | null
          total_comentarios?: number | null
          updated_at?: string | null
          visibilidade?: string
        }
        Update: {
          adicionado_por?: string | null
          arquivos_url?: Json | null
          ativo?: boolean | null
          categoria?: string
          conteudo_texto?: string | null
          created_at?: string | null
          criador_id?: string | null
          descricao?: string | null
          id?: string
          media_avaliacoes?: number | null
          ordem?: number | null
          tipo?: string
          titulo?: string
          total_avaliacoes?: number | null
          total_comentarios?: number | null
          updated_at?: string | null
          visibilidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "materiais_comunidade_adicionado_por_fkey"
            columns: ["adicionado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materiais_comunidade_adicionado_por_fkey"
            columns: ["adicionado_por"]
            isOneToOne: false
            referencedRelation: "ranking_dashboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "materiais_comunidade_criador_id_fkey"
            columns: ["criador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materiais_comunidade_criador_id_fkey"
            columns: ["criador_id"]
            isOneToOne: false
            referencedRelation: "ranking_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      materiais_gratuitos: {
        Row: {
          arquivos_url: Json | null
          ativo: boolean | null
          categoria: string
          created_at: string | null
          descricao: string | null
          id: string
          imagem_url: string | null
          links_url: Json | null
          ordem: number | null
          tipo: string | null
          titulo: string
          updated_at: string | null
          url: string
          visivel_gratuitos: boolean | null
        }
        Insert: {
          arquivos_url?: Json | null
          ativo?: boolean | null
          categoria: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          links_url?: Json | null
          ordem?: number | null
          tipo?: string | null
          titulo: string
          updated_at?: string | null
          url: string
          visivel_gratuitos?: boolean | null
        }
        Update: {
          arquivos_url?: Json | null
          ativo?: boolean | null
          categoria?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          links_url?: Json | null
          ordem?: number | null
          tipo?: string | null
          titulo?: string
          updated_at?: string | null
          url?: string
          visivel_gratuitos?: boolean | null
        }
        Relationships: []
      }
      membros_equipe_skills: {
        Row: {
          cargo: string | null
          created_at: string | null
          equipe_id: string
          id: string
          papel: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          cargo?: string | null
          created_at?: string | null
          equipe_id: string
          id?: string
          papel?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          cargo?: string | null
          created_at?: string | null
          equipe_id?: string
          id?: string
          papel?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membros_equipe_skills_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes_skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membros_equipe_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membros_equipe_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      menu_config: {
        Row: {
          created_at: string | null
          editavel: boolean | null
          icon: string | null
          id: string
          label: string
          menu_key: string
          ordem: number | null
          parent_key: string | null
          planos_permitidos: string[] | null
          tipo: string
          updated_at: string | null
          url: string | null
          visivel: boolean | null
        }
        Insert: {
          created_at?: string | null
          editavel?: boolean | null
          icon?: string | null
          id?: string
          label: string
          menu_key: string
          ordem?: number | null
          parent_key?: string | null
          planos_permitidos?: string[] | null
          tipo?: string
          updated_at?: string | null
          url?: string | null
          visivel?: boolean | null
        }
        Update: {
          created_at?: string | null
          editavel?: boolean | null
          icon?: string | null
          id?: string
          label?: string
          menu_key?: string
          ordem?: number | null
          parent_key?: string | null
          planos_permitidos?: string[] | null
          tipo?: string
          updated_at?: string | null
          url?: string | null
          visivel?: boolean | null
        }
        Relationships: []
      }
      metodos_aplicar: {
        Row: {
          ativo: boolean | null
          categoria: string
          comentarios: string | null
          created_at: string | null
          descricao: string
          exemplo: string | null
          ferramentas_recomendadas: Json | null
          id: string
          link_documento: string | null
          template: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          comentarios?: string | null
          created_at?: string | null
          descricao: string
          exemplo?: string | null
          ferramentas_recomendadas?: Json | null
          id?: string
          link_documento?: string | null
          template?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          comentarios?: string | null
          created_at?: string | null
          descricao?: string
          exemplo?: string | null
          ferramentas_recomendadas?: Json | null
          id?: string
          link_documento?: string | null
          template?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      metricas_skills: {
        Row: {
          created_at: string | null
          engajamento_trilhas: number | null
          entregas_concluidas: number | null
          entregas_planejadas: number | null
          equipe_id: string | null
          horas_economizadas: number | null
          id: string
          processos_automatizados: number | null
          semana: number
        }
        Insert: {
          created_at?: string | null
          engajamento_trilhas?: number | null
          entregas_concluidas?: number | null
          entregas_planejadas?: number | null
          equipe_id?: string | null
          horas_economizadas?: number | null
          id?: string
          processos_automatizados?: number | null
          semana: number
        }
        Update: {
          created_at?: string | null
          engajamento_trilhas?: number | null
          entregas_concluidas?: number | null
          entregas_planejadas?: number | null
          equipe_id?: string | null
          horas_economizadas?: number | null
          id?: string
          processos_automatizados?: number | null
          semana?: number
        }
        Relationships: [
          {
            foreignKeyName: "metricas_skills_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes_skills"
            referencedColumns: ["id"]
          },
        ]
      }
      modulos: {
        Row: {
          ativo: boolean | null
          categoria: string
          created_at: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          imagem_url: string | null
          nivel_minimo_acesso:
            | Database["public"]["Enums"]["nivel_acesso_plano"]
            | null
          ordem: number
          titulo: string
          trilha_id: string
          updated_at: string | null
          visivel_apenas_pro: boolean | null
          visivel_mentorados: boolean | null
          visivel_visitantes: boolean | null
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          created_at?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          nivel_minimo_acesso?:
            | Database["public"]["Enums"]["nivel_acesso_plano"]
            | null
          ordem?: number
          titulo: string
          trilha_id: string
          updated_at?: string | null
          visivel_apenas_pro?: boolean | null
          visivel_mentorados?: boolean | null
          visivel_visitantes?: boolean | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          created_at?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          nivel_minimo_acesso?:
            | Database["public"]["Enums"]["nivel_acesso_plano"]
            | null
          ordem?: number
          titulo?: string
          trilha_id?: string
          updated_at?: string | null
          visivel_apenas_pro?: boolean | null
          visivel_mentorados?: boolean | null
          visivel_visitantes?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "modulos_trilha_id_fkey"
            columns: ["trilha_id"]
            isOneToOne: false
            referencedRelation: "trilhas"
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
          formulario_id: string | null
          gerado_por_ia: boolean | null
          id: string
          objetivo: string
          prioridade: number | null
          status: string | null
          tipo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          formulario_id?: string | null
          gerado_por_ia?: boolean | null
          id?: string
          objetivo: string
          prioridade?: number | null
          status?: string | null
          tipo?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          formulario_id?: string | null
          gerado_por_ia?: boolean | null
          id?: string
          objetivo?: string
          prioridade?: number | null
          status?: string | null
          tipo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "objetivos_mentoria_formulario_id_fkey"
            columns: ["formulario_id"]
            isOneToOne: false
            referencedRelation: "formulario_diagnostico"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_requests: {
        Row: {
          completed_at: string | null
          created_at: string | null
          email: string
          erro_mensagem: string | null
          id: string
          ip_address: string | null
          status: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          email: string
          erro_mensagem?: string | null
          id?: string
          ip_address?: string | null
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          email?: string
          erro_mensagem?: string | null
          id?: string
          ip_address?: string | null
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "password_reset_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "password_reset_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      password_reset_tokens: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "password_reset_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "password_reset_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      pendencias_dashboard: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          icone: string | null
          id: string
          link: string
          ordem: number | null
          planos_aplicaveis: string[] | null
          referencia_id: string | null
          tipo: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          link: string
          ordem?: number | null
          planos_aplicaveis?: string[] | null
          referencia_id?: string | null
          tipo: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          link?: string
          ordem?: number | null
          planos_aplicaveis?: string[] | null
          referencia_id?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pesquisas: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          perguntas: Json
          recompensas: string | null
          slug: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          perguntas?: Json
          recompensas?: string | null
          slug: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          perguntas?: Json
          recompensas?: string | null
          slug?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      players: {
        Row: {
          apresentacao: string | null
          ativo: boolean | null
          codigo_indicacao: string
          comissao_acumulada: number | null
          created_at: string | null
          data_player: string | null
          especialidade: string | null
          id: string
          total_indicacoes: number | null
          updated_at: string | null
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          apresentacao?: string | null
          ativo?: boolean | null
          codigo_indicacao: string
          comissao_acumulada?: number | null
          created_at?: string | null
          data_player?: string | null
          especialidade?: string | null
          id?: string
          total_indicacoes?: number | null
          updated_at?: string | null
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          apresentacao?: string | null
          ativo?: boolean | null
          codigo_indicacao?: string
          comissao_acumulada?: number | null
          created_at?: string | null
          data_player?: string | null
          especialidade?: string | null
          id?: string
          total_indicacoes?: number | null
          updated_at?: string | null
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      premiacoes_comunidade: {
        Row: {
          created_at: string | null
          data_entrega: string | null
          descricao_premio: string
          entregue: boolean | null
          id: string
          mes_referencia: string
          observacoes: string | null
          tipo_premio: string
          updated_at: string | null
          vencedor_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_entrega?: string | null
          descricao_premio: string
          entregue?: boolean | null
          id?: string
          mes_referencia: string
          observacoes?: string | null
          tipo_premio: string
          updated_at?: string | null
          vencedor_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_entrega?: string | null
          descricao_premio?: string
          entregue?: boolean | null
          id?: string
          mes_referencia?: string
          observacoes?: string | null
          tipo_premio?: string
          updated_at?: string | null
          vencedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "premiacoes_comunidade_vencedor_id_fkey"
            columns: ["vencedor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "premiacoes_comunidade_vencedor_id_fkey"
            columns: ["vencedor_id"]
            isOneToOne: false
            referencedRelation: "ranking_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean | null
          beneficios: Json | null
          created_at: string | null
          descricao_completa: string
          descricao_curta: string
          duracao: string | null
          fases: Json | null
          formato: string
          id: string
          imagem_url: string | null
          is_consultoria: boolean | null
          licencas_minimas: number | null
          nome: string
          ordem: number
          periodicidade: string | null
          produtos_inclusos: Json | null
          slug: string
          tipo: string
          updated_at: string | null
          valor: number
          valor_com_desconto: number | null
          valor_maximo: number | null
          valor_minimo: number | null
        }
        Insert: {
          ativo?: boolean | null
          beneficios?: Json | null
          created_at?: string | null
          descricao_completa: string
          descricao_curta: string
          duracao?: string | null
          fases?: Json | null
          formato: string
          id?: string
          imagem_url?: string | null
          is_consultoria?: boolean | null
          licencas_minimas?: number | null
          nome: string
          ordem?: number
          periodicidade?: string | null
          produtos_inclusos?: Json | null
          slug: string
          tipo: string
          updated_at?: string | null
          valor: number
          valor_com_desconto?: number | null
          valor_maximo?: number | null
          valor_minimo?: number | null
        }
        Update: {
          ativo?: boolean | null
          beneficios?: Json | null
          created_at?: string | null
          descricao_completa?: string
          descricao_curta?: string
          duracao?: string | null
          fases?: Json | null
          formato?: string
          id?: string
          imagem_url?: string | null
          is_consultoria?: boolean | null
          licencas_minimas?: number | null
          nome?: string
          ordem?: number
          periodicidade?: string | null
          produtos_inclusos?: Json | null
          slug?: string
          tipo?: string
          updated_at?: string | null
          valor?: number
          valor_com_desconto?: number | null
          valor_maximo?: number | null
          valor_minimo?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          acesso_expira_em: string | null
          acesso_expirado: boolean | null
          adicionado_grupo_whatsapp: boolean | null
          avatar_url: string | null
          bio: string | null
          conta_ativa: boolean | null
          created_at: string | null
          cupom_especial: string | null
          data_conversao: string | null
          data_expiracao_acesso: string | null
          email: string | null
          email_acesso_enviado: boolean | null
          empresa_consultoria: string | null
          google_login_autorizado: boolean | null
          id: string
          idade: number | null
          is_visitante: boolean | null
          linkedin: string | null
          nivel_comunidade: number | null
          nome_completo: string
          origem_consultoria: boolean | null
          plano_mentoria: Database["public"]["Enums"]["plano_mentoria"] | null
          pontos_comunidade: number | null
          primeiro_acesso: boolean | null
          profissao: string | null
          senha_alterada_em: string | null
          senha_temporaria: boolean | null
          skills_liberado: boolean | null
          telefone: string | null
          ultimo_acesso: string | null
          updated_at: string | null
        }
        Insert: {
          acesso_expira_em?: string | null
          acesso_expirado?: boolean | null
          adicionado_grupo_whatsapp?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          conta_ativa?: boolean | null
          created_at?: string | null
          cupom_especial?: string | null
          data_conversao?: string | null
          data_expiracao_acesso?: string | null
          email?: string | null
          email_acesso_enviado?: boolean | null
          empresa_consultoria?: string | null
          google_login_autorizado?: boolean | null
          id: string
          idade?: number | null
          is_visitante?: boolean | null
          linkedin?: string | null
          nivel_comunidade?: number | null
          nome_completo: string
          origem_consultoria?: boolean | null
          plano_mentoria?: Database["public"]["Enums"]["plano_mentoria"] | null
          pontos_comunidade?: number | null
          primeiro_acesso?: boolean | null
          profissao?: string | null
          senha_alterada_em?: string | null
          senha_temporaria?: boolean | null
          skills_liberado?: boolean | null
          telefone?: string | null
          ultimo_acesso?: string | null
          updated_at?: string | null
        }
        Update: {
          acesso_expira_em?: string | null
          acesso_expirado?: boolean | null
          adicionado_grupo_whatsapp?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          conta_ativa?: boolean | null
          created_at?: string | null
          cupom_especial?: string | null
          data_conversao?: string | null
          data_expiracao_acesso?: string | null
          email?: string | null
          email_acesso_enviado?: boolean | null
          empresa_consultoria?: string | null
          google_login_autorizado?: boolean | null
          id?: string
          idade?: number | null
          is_visitante?: boolean | null
          linkedin?: string | null
          nivel_comunidade?: number | null
          nome_completo?: string
          origem_consultoria?: boolean | null
          plano_mentoria?: Database["public"]["Enums"]["plano_mentoria"] | null
          pontos_comunidade?: number | null
          primeiro_acesso?: boolean | null
          profissao?: string | null
          senha_alterada_em?: string | null
          senha_temporaria?: boolean | null
          skills_liberado?: boolean | null
          telefone?: string | null
          ultimo_acesso?: string | null
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
      projetos_mentoria: {
        Row: {
          anexos: Json | null
          avaliacao_mentor: number | null
          avaliacao_mentorado: number | null
          comentarios_mentor: string | null
          comentarios_mentorado: string | null
          contribuicao_plano: string
          created_at: string
          data_entrega: string | null
          descricao: string
          devolutiva_mentor: string | null
          ferramentas_projeto: Json | null
          id: string
          modulos_obrigatorios: Json | null
          objetivo_projeto: string
          progresso_preparacao: number | null
          status: Database["public"]["Enums"]["status_projeto"]
          tipo: string
          titulo: string
          trilhas_recomendadas: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          anexos?: Json | null
          avaliacao_mentor?: number | null
          avaliacao_mentorado?: number | null
          comentarios_mentor?: string | null
          comentarios_mentorado?: string | null
          contribuicao_plano: string
          created_at?: string
          data_entrega?: string | null
          descricao: string
          devolutiva_mentor?: string | null
          ferramentas_projeto?: Json | null
          id?: string
          modulos_obrigatorios?: Json | null
          objetivo_projeto: string
          progresso_preparacao?: number | null
          status?: Database["public"]["Enums"]["status_projeto"]
          tipo?: string
          titulo: string
          trilhas_recomendadas?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          anexos?: Json | null
          avaliacao_mentor?: number | null
          avaliacao_mentorado?: number | null
          comentarios_mentor?: string | null
          comentarios_mentorado?: string | null
          contribuicao_plano?: string
          created_at?: string
          data_entrega?: string | null
          descricao?: string
          devolutiva_mentor?: string | null
          ferramentas_projeto?: Json | null
          id?: string
          modulos_obrigatorios?: Json | null
          objetivo_projeto?: string
          progresso_preparacao?: number | null
          status?: Database["public"]["Enums"]["status_projeto"]
          tipo?: string
          titulo?: string
          trilhas_recomendadas?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prompt_copy_logs: {
        Row: {
          copied_at: string
          id: string
          prompt_id: string
          prompt_titulo: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          copied_at?: string
          id?: string
          prompt_id: string
          prompt_titulo: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          copied_at?: string
          id?: string
          prompt_id?: string
          prompt_titulo?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      recursos_mentoria: {
        Row: {
          categoria: string
          como_usar: string | null
          created_at: string
          descricao: string
          id: string
          link: string | null
          nome: string
          para_que_serve: string
          updated_at: string
          user_id: string
        }
        Insert: {
          categoria: string
          como_usar?: string | null
          created_at?: string
          descricao: string
          id?: string
          link?: string | null
          nome: string
          para_que_serve: string
          updated_at?: string
          user_id: string
        }
        Update: {
          categoria?: string
          como_usar?: string | null
          created_at?: string
          descricao?: string
          id?: string
          link?: string | null
          nome?: string
          para_que_serve?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      regras_upsell: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao_oferta: string
          economia: number
          id: string
          produto_destino_id: string | null
          produto_origem_id: string | null
          tipo: string
          updated_at: string | null
          valor_desconto: number
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao_oferta: string
          economia: number
          id?: string
          produto_destino_id?: string | null
          produto_origem_id?: string | null
          tipo?: string
          updated_at?: string | null
          valor_desconto: number
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao_oferta?: string
          economia?: number
          id?: string
          produto_destino_id?: string | null
          produto_origem_id?: string | null
          tipo?: string
          updated_at?: string | null
          valor_desconto?: number
        }
        Relationships: [
          {
            foreignKeyName: "regras_upsell_produto_destino_id_fkey"
            columns: ["produto_destino_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regras_upsell_produto_origem_id_fkey"
            columns: ["produto_origem_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      reports_business: {
        Row: {
          arquivo_url: string | null
          conteudo_html: string | null
          contrato_id: string
          created_at: string
          data_envio: string
          descricao: string | null
          gerado_por_ia: boolean | null
          id: string
          metricas: Json | null
          periodo_referencia: string | null
          resumo_executivo: string | null
          tipo: string | null
          titulo: string
        }
        Insert: {
          arquivo_url?: string | null
          conteudo_html?: string | null
          contrato_id: string
          created_at?: string
          data_envio?: string
          descricao?: string | null
          gerado_por_ia?: boolean | null
          id?: string
          metricas?: Json | null
          periodo_referencia?: string | null
          resumo_executivo?: string | null
          tipo?: string | null
          titulo: string
        }
        Update: {
          arquivo_url?: string | null
          conteudo_html?: string | null
          contrato_id?: string
          created_at?: string
          data_envio?: string
          descricao?: string | null
          gerado_por_ia?: boolean | null
          id?: string
          metricas?: Json | null
          periodo_referencia?: string | null
          resumo_executivo?: string | null
          tipo?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_business_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos_business"
            referencedColumns: ["id"]
          },
        ]
      }
      reports_public_links: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          public_token: string
          report_id: string | null
          views_count: number | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          public_token: string
          report_id?: string | null
          views_count?: number | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          public_token?: string
          report_id?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_public_links_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports_business"
            referencedColumns: ["id"]
          },
        ]
      }
      respostas_exercicios: {
        Row: {
          arquivo_url: string | null
          created_at: string | null
          exercicio_id: string
          feedback_mentor: string | null
          id: string
          nota: number | null
          resposta_texto: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string | null
          exercicio_id: string
          feedback_mentor?: string | null
          id?: string
          nota?: number | null
          resposta_texto?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string | null
          exercicio_id?: string
          feedback_mentor?: string | null
          id?: string
          nota?: number | null
          resposta_texto?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "respostas_exercicios_exercicio_id_fkey"
            columns: ["exercicio_id"]
            isOneToOne: false
            referencedRelation: "exercicios_praticos"
            referencedColumns: ["id"]
          },
        ]
      }
      respostas_formularios_customizados: {
        Row: {
          completado: boolean | null
          created_at: string | null
          formulario_id: string
          id: string
          respostas: Json
          tempo_resposta: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completado?: boolean | null
          created_at?: string | null
          formulario_id: string
          id?: string
          respostas: Json
          tempo_resposta?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completado?: boolean | null
          created_at?: string | null
          formulario_id?: string
          id?: string
          respostas?: Json
          tempo_resposta?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "respostas_formularios_customizados_formulario_id_fkey"
            columns: ["formulario_id"]
            isOneToOne: false
            referencedRelation: "formularios_customizados"
            referencedColumns: ["id"]
          },
        ]
      }
      respostas_pesquisas: {
        Row: {
          completado: boolean | null
          created_at: string | null
          email_respondente: string | null
          id: string
          pesquisa_id: string
          respostas: Json
          secao_atual: number | null
          tempo_resposta: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completado?: boolean | null
          created_at?: string | null
          email_respondente?: string | null
          id?: string
          pesquisa_id: string
          respostas?: Json
          secao_atual?: number | null
          tempo_resposta?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completado?: boolean | null
          created_at?: string | null
          email_respondente?: string | null
          id?: string
          pesquisa_id?: string
          respostas?: Json
          secao_atual?: number | null
          tempo_resposta?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "respostas_pesquisas_pesquisa_id_fkey"
            columns: ["pesquisa_id"]
            isOneToOne: false
            referencedRelation: "pesquisas"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmap_skills: {
        Row: {
          created_at: string | null
          data_prevista: string | null
          descricao: string | null
          equipe_id: string | null
          id: string
          numero_fase: number
          semana_fim: number | null
          semana_inicio: number | null
          status: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_prevista?: string | null
          descricao?: string | null
          equipe_id?: string | null
          id?: string
          numero_fase: number
          semana_fim?: number | null
          semana_inicio?: number | null
          status?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_prevista?: string | null
          descricao?: string | null
          equipe_id?: string | null
          id?: string
          numero_fase?: number
          semana_fim?: number | null
          semana_inicio?: number | null
          status?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_skills_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes_skills"
            referencedColumns: ["id"]
          },
        ]
      }
      sessoes_mentoria: {
        Row: {
          created_at: string
          data_sessao: string
          duracao: number | null
          etapa_id: string | null
          feedback_entregas: string | null
          id: string
          notas: string | null
          status: Database["public"]["Enums"]["status_sessao"]
          titulo: string
          transcricao: string | null
          transcricao_url: string | null
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          data_sessao: string
          duracao?: number | null
          etapa_id?: string | null
          feedback_entregas?: string | null
          id?: string
          notas?: string | null
          status?: Database["public"]["Enums"]["status_sessao"]
          titulo: string
          transcricao?: string | null
          transcricao_url?: string | null
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          data_sessao?: string
          duracao?: number | null
          etapa_id?: string | null
          feedback_entregas?: string | null
          id?: string
          notas?: string | null
          status?: Database["public"]["Enums"]["status_sessao"]
          titulo?: string
          transcricao?: string | null
          transcricao_url?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessoes_mentoria_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "etapas_business"
            referencedColumns: ["id"]
          },
        ]
      }
      signup_attempts: {
        Row: {
          created_at: string
          email: string
          erro_mensagem: string | null
          id: string
          ip_info: string | null
          nome: string | null
          sucesso: boolean
          telefone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          erro_mensagem?: string | null
          id?: string
          ip_info?: string | null
          nome?: string | null
          sucesso?: boolean
          telefone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          erro_mensagem?: string | null
          id?: string
          ip_info?: string | null
          nome?: string | null
          sucesso?: boolean
          telefone?: string | null
        }
        Relationships: []
      }
      tarefas_mentoria: {
        Row: {
          arquivo_entrega_url: string | null
          avaliacao_mentor: number | null
          created_at: string
          data_acordo: string
          data_conclusao: string | null
          descricao: string
          entrega_id: string | null
          etapa_id: string | null
          feedback_mentor: string | null
          id: string
          instrucao_id: string | null
          link_externo: string | null
          prazo_entrega: string
          prioridade: string
          projeto_id: string | null
          sessao_id: string | null
          status: string
          tipo: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          arquivo_entrega_url?: string | null
          avaliacao_mentor?: number | null
          created_at?: string
          data_acordo?: string
          data_conclusao?: string | null
          descricao: string
          entrega_id?: string | null
          etapa_id?: string | null
          feedback_mentor?: string | null
          id?: string
          instrucao_id?: string | null
          link_externo?: string | null
          prazo_entrega: string
          prioridade?: string
          projeto_id?: string | null
          sessao_id?: string | null
          status?: string
          tipo: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          arquivo_entrega_url?: string | null
          avaliacao_mentor?: number | null
          created_at?: string
          data_acordo?: string
          data_conclusao?: string | null
          descricao?: string
          entrega_id?: string | null
          etapa_id?: string | null
          feedback_mentor?: string | null
          id?: string
          instrucao_id?: string | null
          link_externo?: string | null
          prazo_entrega?: string
          prioridade?: string
          projeto_id?: string | null
          sessao_id?: string | null
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_mentoria_entrega_id_fkey"
            columns: ["entrega_id"]
            isOneToOne: false
            referencedRelation: "entregas_business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_mentoria_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "etapas_business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_mentoria_instrucao_id_fkey"
            columns: ["instrucao_id"]
            isOneToOne: false
            referencedRelation: "instrucoes_etapa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_mentoria_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos_mentoria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_mentoria_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "sessoes_mentoria"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks_business: {
        Row: {
          arquivo_resposta_url: string | null
          contrato_id: string | null
          created_at: string | null
          created_by: string | null
          data_resposta: string | null
          descricao: string | null
          documento_url: string | null
          entrega_id: string | null
          etapa_id: string | null
          id: string
          instrucoes_validacao: string | null
          link_referencia: string | null
          prazo: string | null
          prioridade: string | null
          resposta_mentorado: string | null
          status: string | null
          tipo: string | null
          titulo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          arquivo_resposta_url?: string | null
          contrato_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_resposta?: string | null
          descricao?: string | null
          documento_url?: string | null
          entrega_id?: string | null
          etapa_id?: string | null
          id?: string
          instrucoes_validacao?: string | null
          link_referencia?: string | null
          prazo?: string | null
          prioridade?: string | null
          resposta_mentorado?: string | null
          status?: string | null
          tipo?: string | null
          titulo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          arquivo_resposta_url?: string | null
          contrato_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_resposta?: string | null
          descricao?: string | null
          documento_url?: string | null
          entrega_id?: string | null
          etapa_id?: string | null
          id?: string
          instrucoes_validacao?: string | null
          link_referencia?: string | null
          prazo?: string | null
          prioridade?: string | null
          resposta_mentorado?: string | null
          status?: string | null
          tipo?: string | null
          titulo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_business_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos_business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_business_entrega_id_fkey"
            columns: ["entrega_id"]
            isOneToOne: false
            referencedRelation: "entregas_business"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_business_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "etapas_business"
            referencedColumns: ["id"]
          },
        ]
      }
      tentativas_acesso_nao_autorizado: {
        Row: {
          email: string | null
          id: string
          ip_address: string | null
          tentativa_acesso_a: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          email?: string | null
          id?: string
          ip_address?: string | null
          tentativa_acesso_a?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          email?: string | null
          id?: string
          ip_address?: string | null
          tentativa_acesso_a?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      trilhas: {
        Row: {
          ativo: boolean | null
          bloqueada: boolean | null
          categoria: string
          created_at: string | null
          descricao: string | null
          duracao_estimada: number | null
          id: string
          imagem_url: string | null
          nivel: string
          nivel_minimo_acesso:
            | Database["public"]["Enums"]["nivel_acesso_plano"]
            | null
          ordem: number
          titulo: string
          updated_at: string | null
          visivel_apenas_pro: boolean | null
          visivel_mentorados: boolean | null
          visivel_visitantes: boolean | null
        }
        Insert: {
          ativo?: boolean | null
          bloqueada?: boolean | null
          categoria: string
          created_at?: string | null
          descricao?: string | null
          duracao_estimada?: number | null
          id?: string
          imagem_url?: string | null
          nivel: string
          nivel_minimo_acesso?:
            | Database["public"]["Enums"]["nivel_acesso_plano"]
            | null
          ordem?: number
          titulo: string
          updated_at?: string | null
          visivel_apenas_pro?: boolean | null
          visivel_mentorados?: boolean | null
          visivel_visitantes?: boolean | null
        }
        Update: {
          ativo?: boolean | null
          bloqueada?: boolean | null
          categoria?: string
          created_at?: string | null
          descricao?: string | null
          duracao_estimada?: number | null
          id?: string
          imagem_url?: string | null
          nivel?: string
          nivel_minimo_acesso?:
            | Database["public"]["Enums"]["nivel_acesso_plano"]
            | null
          ordem?: number
          titulo?: string
          updated_at?: string | null
          visivel_apenas_pro?: boolean | null
          visivel_mentorados?: boolean | null
          visivel_visitantes?: boolean | null
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
      video_feedbacks: {
        Row: {
          comentario: string | null
          created_at: string | null
          id: string
          tipo: string
          updated_at: string | null
          user_id: string
          video_id: string
        }
        Insert: {
          comentario?: string | null
          created_at?: string | null
          id?: string
          tipo: string
          updated_at?: string | null
          user_id: string
          video_id: string
        }
        Update: {
          comentario?: string | null
          created_at?: string | null
          id?: string
          tipo?: string
          updated_at?: string | null
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_feedbacks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_feedbacks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_dashboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "video_feedbacks_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_ratings: {
        Row: {
          created_at: string | null
          id: string
          rating: number
          updated_at: string | null
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          rating: number
          updated_at?: string | null
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_ratings_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          data_aula: string | null
          data_disponibilidade: string | null
          descricao: string | null
          duracao: number | null
          google_drive_url: string | null
          id: string
          materiais: Json | null
          modulo_id: string
          nivel_minimo_acesso:
            | Database["public"]["Enums"]["nivel_acesso_plano"]
            | null
          ordem: number
          thumbnail_customizado_url: string | null
          thumbnail_url: string | null
          titulo: string
          trilha_id: string | null
          updated_at: string | null
          visivel_apenas_pro: boolean | null
          visivel_mentorados: boolean | null
          visivel_visitantes: boolean | null
          youtube_id: string
          youtube_url: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          data_aula?: string | null
          data_disponibilidade?: string | null
          descricao?: string | null
          duracao?: number | null
          google_drive_url?: string | null
          id?: string
          materiais?: Json | null
          modulo_id: string
          nivel_minimo_acesso?:
            | Database["public"]["Enums"]["nivel_acesso_plano"]
            | null
          ordem?: number
          thumbnail_customizado_url?: string | null
          thumbnail_url?: string | null
          titulo: string
          trilha_id?: string | null
          updated_at?: string | null
          visivel_apenas_pro?: boolean | null
          visivel_mentorados?: boolean | null
          visivel_visitantes?: boolean | null
          youtube_id: string
          youtube_url: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          data_aula?: string | null
          data_disponibilidade?: string | null
          descricao?: string | null
          duracao?: number | null
          google_drive_url?: string | null
          id?: string
          materiais?: Json | null
          modulo_id?: string
          nivel_minimo_acesso?:
            | Database["public"]["Enums"]["nivel_acesso_plano"]
            | null
          ordem?: number
          thumbnail_customizado_url?: string | null
          thumbnail_url?: string | null
          titulo?: string
          trilha_id?: string | null
          updated_at?: string | null
          visivel_apenas_pro?: boolean | null
          visivel_mentorados?: boolean | null
          visivel_visitantes?: boolean | null
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
          {
            foreignKeyName: "videos_trilha_id_fkey"
            columns: ["trilha_id"]
            isOneToOne: false
            referencedRelation: "trilhas"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_expiration_notices: {
        Row: {
          created_at: string | null
          dismissed_at: string | null
          id: string
          notice_type: string
          shown_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dismissed_at?: string | null
          id?: string
          notice_type: string
          shown_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dismissed_at?: string | null
          id?: string
          notice_type?: string
          shown_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitor_expiration_notices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitor_expiration_notices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_dashboard"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      historico_completo: {
        Row: {
          campos_alterados: string[] | null
          created_at: string | null
          dados_anteriores: Json | null
          dados_novos: Json | null
          operacao: string | null
          registro_id: string | null
          tabela: string | null
          usuario: string | null
        }
        Relationships: []
      }
      ranking_dashboard: {
        Row: {
          nome_completo: string | null
          total_videos: number | null
          user_id: string | null
          videos_24h: number | null
          videos_24h_anterior: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_community_points: {
        Args: { p_points: number; p_user_id: string }
        Returns: undefined
      }
      calcular_prazo_sla: { Args: { p_user_id: string }; Returns: string }
      calcular_progresso_preparacao: {
        Args: { p_projeto_id: string; p_user_id: string }
        Returns: number
      }
      check_visitor_engagement: {
        Args: { visitor_id: string }
        Returns: boolean
      }
      get_gratuito_stats: {
        Args: never
        Returns: {
          online_visitantes: number
          total_conteudos_gratuitos: number
          total_materiais_gratuitos: number
          total_visitantes: number
        }[]
      }
      get_modulos_stats: {
        Args: never
        Returns: {
          modulo_id: string
          total_exercicios: number
          total_materiais: number
          total_videos: number
        }[]
      }
      get_public_profiles: {
        Args: never
        Returns: {
          avatar_url: string
          bio: string
          conta_ativa: boolean
          created_at: string
          id: string
          is_visitante: boolean
          nivel_comunidade: number
          nome_completo: string
          plano_mentoria: Database["public"]["Enums"]["plano_mentoria"]
          pontos_comunidade: number
          ultimo_acesso: string
        }[]
      }
      get_ranking_comunidade: {
        Args: never
        Returns: {
          avatar_url: string
          nome_completo: string
          posicao: number
          total_comentarios: number
          total_ferramentas_compartilhadas: number
          total_pontos: number
          total_projetos_entregues: number
          total_videos_assistidos: number
          user_id: string
        }[]
      }
      get_ranking_engajamento: {
        Args: never
        Returns: {
          avatar_url: string
          dias_ativos_30d: number
          nome_completo: string
          posicao: number
          total_comentarios: number
          total_likes_dados: number
          total_likes_recebidos: number
          total_pontos: number
          total_posts: number
          user_id: string
        }[]
      }
      get_trilhas_stats: {
        Args: never
        Returns: {
          total_exercicios: number
          total_materiais: number
          total_modulos: number
          total_videos: number
          trilha_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      inicializar_fases_processo: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      is_leader_of_skills_team: { Args: { team_id: string }; Returns: boolean }
      is_member_of_skills_team: { Args: { team_id: string }; Returns: boolean }
      user_has_access_level: {
        Args: {
          required_level: Database["public"]["Enums"]["nivel_acesso_plano"]
        }
        Returns: boolean
      }
      verificar_email_mentorado: {
        Args: { email_input: string }
        Returns: boolean
      }
      verificar_integridade_sistema: {
        Args: never
        Returns: {
          categoria: string
          detalhes: string
          item: string
          status: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "mentorado"
        | "aluno_trilha"
        | "visitante"
        | "facilitador"
        | "equipe"
      nivel_acesso_plano: "academy" | "lab" | "skills" | "club" | "business"
      plano_mentoria:
        | "club"
        | "pro"
        | "boost"
        | "legacy"
        | "academy"
        | "lab"
        | "skills"
        | "business"
        | "business_iaplicada"
      status_projeto:
        | "planejamento"
        | "em_andamento"
        | "concluido"
        | "cancelado"
      status_sessao: "agendada" | "realizada" | "cancelada"
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
      app_role: [
        "admin",
        "mentorado",
        "aluno_trilha",
        "visitante",
        "facilitador",
        "equipe",
      ],
      nivel_acesso_plano: ["academy", "lab", "skills", "club", "business"],
      plano_mentoria: [
        "club",
        "pro",
        "boost",
        "legacy",
        "academy",
        "lab",
        "skills",
        "business",
        "business_iaplicada",
      ],
      status_projeto: [
        "planejamento",
        "em_andamento",
        "concluido",
        "cancelado",
      ],
      status_sessao: ["agendada", "realizada", "cancelada"],
    },
  },
} as const
