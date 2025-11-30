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
          tema: string
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
          tema: string
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
          tema?: string
          updated_at?: string | null
        }
        Relationships: []
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
        ]
      }
      community_reactions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
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
        ]
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
      duvidas_mentoria: {
        Row: {
          atrasada: boolean | null
          contexto: string | null
          created_at: string | null
          duvida: string
          horas_para_vencer: number | null
          id: string
          prazo_sla: string
          prioridade: string
          respondida_em: string | null
          respondida_por: string | null
          resposta_mentor: string | null
          status: string
          tags: Json | null
          titulo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          atrasada?: boolean | null
          contexto?: string | null
          created_at?: string | null
          duvida: string
          horas_para_vencer?: number | null
          id?: string
          prazo_sla: string
          prioridade?: string
          respondida_em?: string | null
          respondida_por?: string | null
          resposta_mentor?: string | null
          status?: string
          tags?: Json | null
          titulo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          atrasada?: boolean | null
          contexto?: string | null
          created_at?: string | null
          duvida?: string
          horas_para_vencer?: number | null
          id?: string
          prazo_sla?: string
          prioridade?: string
          respondida_em?: string | null
          respondida_por?: string | null
          resposta_mentor?: string | null
          status?: string
          tags?: Json | null
          titulo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "duvidas_mentoria_respondida_por_fkey"
            columns: ["respondida_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duvidas_mentoria_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          area_aplicacao_ia: string | null
          area_atuacao: string | null
          area_atuacao_outro: string | null
          arquivo_diagnostico_url: string | null
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
          observacoes_admin: string | null
          outras_ferramentas: string | null
          plano_gerado: boolean | null
          plano_gerado_em: string | null
          plano_gerado_por: string | null
          preenchido_por: string | null
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
          arquivo_diagnostico_url?: string | null
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
          observacoes_admin?: string | null
          outras_ferramentas?: string | null
          plano_gerado?: boolean | null
          plano_gerado_em?: string | null
          plano_gerado_por?: string | null
          preenchido_por?: string | null
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
          arquivo_diagnostico_url?: string | null
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
          observacoes_admin?: string | null
          outras_ferramentas?: string | null
          plano_gerado?: boolean | null
          plano_gerado_em?: string | null
          plano_gerado_por?: string | null
          preenchido_por?: string | null
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
      ia_copie_use: {
        Row: {
          ativo: boolean | null
          categoria: string
          conteudo: string
          created_at: string | null
          descricao: string
          ferramentas_recomendadas: Json | null
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
          ferramentas_recomendadas?: Json | null
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
          ferramentas_recomendadas?: Json | null
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
      materiais_gratuitos: {
        Row: {
          ativo: boolean | null
          categoria: string
          created_at: string | null
          descricao: string | null
          id: string
          imagem_url: string | null
          ordem: number | null
          tipo: string | null
          titulo: string
          updated_at: string | null
          url: string
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          ordem?: number | null
          tipo?: string | null
          titulo: string
          updated_at?: string | null
          url: string
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          ordem?: number | null
          tipo?: string | null
          titulo?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
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
          created_at: string | null
          descricao: string
          exemplo: string | null
          ferramentas_recomendadas: Json | null
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
          ferramentas_recomendadas?: Json | null
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
          ferramentas_recomendadas?: Json | null
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
          adicionado_grupo_whatsapp: boolean | null
          avatar_url: string | null
          bio: string | null
          conta_ativa: boolean | null
          created_at: string | null
          data_conversao: string | null
          data_expiracao_acesso: string | null
          email: string | null
          email_acesso_enviado: boolean | null
          empresa_consultoria: string | null
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
          telefone: string | null
          ultimo_acesso: string | null
          updated_at: string | null
        }
        Insert: {
          adicionado_grupo_whatsapp?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          conta_ativa?: boolean | null
          created_at?: string | null
          data_conversao?: string | null
          data_expiracao_acesso?: string | null
          email?: string | null
          email_acesso_enviado?: boolean | null
          empresa_consultoria?: string | null
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
          telefone?: string | null
          ultimo_acesso?: string | null
          updated_at?: string | null
        }
        Update: {
          adicionado_grupo_whatsapp?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          conta_ativa?: boolean | null
          created_at?: string | null
          data_conversao?: string | null
          data_expiracao_acesso?: string | null
          email?: string | null
          email_acesso_enviado?: boolean | null
          empresa_consultoria?: string | null
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
      sessoes_mentoria: {
        Row: {
          created_at: string
          data_sessao: string
          duracao: number | null
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
          feedback_mentor: string | null
          id: string
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
          feedback_mentor?: string | null
          id?: string
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
          feedback_mentor?: string | null
          id?: string
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
      get_modulos_stats: {
        Args: never
        Returns: {
          modulo_id: string
          total_exercicios: number
          total_materiais: number
          total_videos: number
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
      user_has_access_level: {
        Args: {
          required_level: Database["public"]["Enums"]["nivel_acesso_plano"]
        }
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
      app_role: "admin" | "mentorado" | "aluno_trilha" | "visitante"
      nivel_acesso_plano: "academy" | "lab" | "skills" | "club"
      plano_mentoria:
        | "club"
        | "pro"
        | "boost"
        | "legacy"
        | "academy"
        | "lab"
        | "skills"
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
      app_role: ["admin", "mentorado", "aluno_trilha", "visitante"],
      nivel_acesso_plano: ["academy", "lab", "skills", "club"],
      plano_mentoria: [
        "club",
        "pro",
        "boost",
        "legacy",
        "academy",
        "lab",
        "skills",
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
