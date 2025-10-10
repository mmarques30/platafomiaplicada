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
          descricao: string | null
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
          id?: string
          ordem?: number
          titulo?: string
          trilha_id?: string
          updated_at?: string | null
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
          plano_mentoria: Database["public"]["Enums"]["plano_mentoria"] | null
          primeiro_acesso: boolean | null
          profissao: string | null
          senha_alterada_em: string | null
          senha_temporaria: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          idade?: number | null
          linkedin?: string | null
          nome_completo: string
          plano_mentoria?: Database["public"]["Enums"]["plano_mentoria"] | null
          primeiro_acesso?: boolean | null
          profissao?: string | null
          senha_alterada_em?: string | null
          senha_temporaria?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          idade?: number | null
          linkedin?: string | null
          nome_completo?: string
          plano_mentoria?: Database["public"]["Enums"]["plano_mentoria"] | null
          primeiro_acesso?: boolean | null
          profissao?: string | null
          senha_alterada_em?: string | null
          senha_temporaria?: boolean | null
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
          objetivo_id: string | null
          objetivo_projeto: string
          status: Database["public"]["Enums"]["status_projeto"]
          titulo: string
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
          objetivo_id?: string | null
          objetivo_projeto: string
          status?: Database["public"]["Enums"]["status_projeto"]
          titulo: string
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
          objetivo_id?: string | null
          objetivo_projeto?: string
          status?: Database["public"]["Enums"]["status_projeto"]
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projetos_mentoria_objetivo_id_fkey"
            columns: ["objetivo_id"]
            isOneToOne: false
            referencedRelation: "objetivos_mentoria"
            referencedColumns: ["id"]
          },
        ]
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
      trilhas: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          imagem_url: string | null
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
          imagem_url?: string | null
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
          imagem_url?: string | null
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
          data_disponibilidade: string | null
          descricao: string | null
          duracao: number | null
          id: string
          materiais: Json | null
          modulo_id: string
          ordem: number
          thumbnail_customizado_url: string | null
          thumbnail_url: string | null
          titulo: string
          trilha_id: string | null
          updated_at: string | null
          youtube_id: string
          youtube_url: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          data_disponibilidade?: string | null
          descricao?: string | null
          duracao?: number | null
          id?: string
          materiais?: Json | null
          modulo_id: string
          ordem?: number
          thumbnail_customizado_url?: string | null
          thumbnail_url?: string | null
          titulo: string
          trilha_id?: string | null
          updated_at?: string | null
          youtube_id: string
          youtube_url: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          data_disponibilidade?: string | null
          descricao?: string | null
          duracao?: number | null
          id?: string
          materiais?: Json | null
          modulo_id?: string
          ordem?: number
          thumbnail_customizado_url?: string | null
          thumbnail_url?: string | null
          titulo?: string
          trilha_id?: string | null
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
      calcular_prazo_sla: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_modulos_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          modulo_id: string
          total_exercicios: number
          total_materiais: number
          total_videos: number
        }[]
      }
      get_trilhas_stats: {
        Args: Record<PropertyKey, never>
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
      verificar_integridade_sistema: {
        Args: Record<PropertyKey, never>
        Returns: {
          categoria: string
          detalhes: string
          item: string
          status: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "mentorado" | "aluno_trilha"
      plano_mentoria: "intensivo_grupo" | "light" | "premium"
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
      app_role: ["admin", "mentorado", "aluno_trilha"],
      plano_mentoria: ["intensivo_grupo", "light", "premium"],
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
