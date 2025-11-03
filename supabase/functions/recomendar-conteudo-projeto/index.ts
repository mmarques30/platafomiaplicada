import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapeamento de palavras-chave para trilhas (IDs reais)
const MAPEAMENTO: Record<string, { trilha_id: string; modulos: number[]; prioridade: string }> = {
  "planilha|dados|excel|sheets|google sheets|csv": {
    trilha_id: "39a7856f-65de-48b8-b98d-885274d40ef9", // Planilhas & Dados com IA
    modulos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    prioridade: "essencial"
  },
  "automação|automatizar|zapier|make|workflow|integração": {
    trilha_id: "8118b647-3250-4cc2-b21d-c5f4e570a26d", // Fundamentos de Automação
    modulos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    prioridade: "essencial"
  },
  "email|comunicação|relatório|apresentação|ata|documento": {
    trilha_id: "6b54e8e2-4644-4b9e-bf91-eed8fe918b04", // Comunicação com IA
    modulos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    prioridade: "recomendado"
  },
  "claude|análise|documento longo|pdf|contrato": {
    trilha_id: "302da0e7-1bf7-471b-83c4-0a3fef4e9e74", // Claude Avançado
    modulos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    prioridade: "essencial"
  },
  "dashboard|bi|business intelligence|visualização|kpi|looker|metabase": {
    trilha_id: "8393c6b0-e53a-43e6-aad3-dede5de8d504", // Dashboard e BI
    modulos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    prioridade: "essencial"
  },
  "zapier": {
    trilha_id: "b7ae7b03-1e83-4988-b726-6b45fa15180a", // Zapier do Zero
    modulos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    prioridade: "essencial"
  },
  "make": {
    trilha_id: "e69d86a7-e2e6-420d-8d23-22f86336cfe6", // Make do Zero
    modulos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    prioridade: "essencial"
  },
  "apresentação|slide|pitch|gamma": {
    trilha_id: "30356e58-4156-4e46-a6d1-2d29894f9b4f", // Apresentações Executivas
    modulos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    prioridade: "recomendado"
  },
  "app|site|landing page|lovable|bubble|bolt": {
    trilha_id: "d03299b6-c5e2-4c62-91f0-0ddae52e16d6", // Apps Web sem Código
    modulos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    prioridade: "recomendado"
  },
  "vendas|prospecção|crm|pipeline|comercial": {
    trilha_id: "45dcf411-5e65-48e6-aeb9-5c4c6543e7e6", // IA para Vendas
    modulos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    prioridade: "essencial"
  },
  "marketing|conteúdo|campanha|seo|social media|copywriting": {
    trilha_id: "a140758e-cc2d-4d54-b5ca-65837552e45f", // IA para Marketing
    modulos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    prioridade: "essencial"
  },
  "rh|recrutamento|pessoas|currículo|seleção|onboarding": {
    trilha_id: "5e78b95d-3192-4ef7-ab3c-982a6db6c5f7", // IA para RH
    modulos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    prioridade: "essencial"
  },
  "projeto|gestão de projeto|escopo|cronograma|pmo": {
    trilha_id: "e640f6aa-e3e8-4e94-96c1-1f2859d03cde", // IA para Gestão de Projetos
    modulos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    prioridade: "essencial"
  },
  "equipe|liderança|feedback|1:1|gestão de pessoas": {
    trilha_id: "2aacb19a-02a4-4002-9000-20b0d712a683", // IA para Gestão de Equipe
    modulos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    prioridade: "essencial"
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projeto_id, titulo, descricao, objetivo_projeto } = await req.json();
    
    console.log('Recomendando conteúdo para projeto:', { projeto_id, titulo });
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Combinar todos os textos do projeto
    const textoCompleto = `${titulo} ${descricao} ${objetivo_projeto}`.toLowerCase();
    console.log('Texto completo para análise:', textoCompleto.substring(0, 200));
    
    // Identificar trilhas/módulos recomendados
    const trilhasRecomendadas: any[] = [];
    const modulosObrigatorios: any[] = [];
    const trilhasProcessadas = new Set<string>();
    
    for (const [keywords, config] of Object.entries(MAPEAMENTO)) {
      const regex = new RegExp(keywords, 'i');
      if (regex.test(textoCompleto) && !trilhasProcessadas.has(config.trilha_id)) {
        trilhasProcessadas.add(config.trilha_id);
        
        // Buscar dados reais da trilha
        const { data: trilha, error: trilhaError } = await supabase
          .from('trilhas')
          .select('id, titulo')
          .eq('id', config.trilha_id)
          .single();
          
        if (trilhaError) {
          console.error('Erro ao buscar trilha:', trilhaError);
          continue;
        }
          
        if (trilha) {
          trilhasRecomendadas.push({
            trilha_id: trilha.id,
            titulo: trilha.titulo,
            prioridade: config.prioridade
          });
          
          console.log('Trilha encontrada:', trilha.titulo);
          
          // Buscar módulos da trilha
          const { data: modulos, error: modulosError } = await supabase
            .from('modulos')
            .select('id, titulo, ordem')
            .eq('trilha_id', trilha.id)
            .in('ordem', config.modulos)
            .order('ordem');
            
          if (modulosError) {
            console.error('Erro ao buscar módulos:', modulosError);
            continue;
          }
            
          if (modulos) {
            for (const modulo of modulos) {
              // Buscar vídeos do módulo
              const { data: videos, error: videosError } = await supabase
                .from('videos')
                .select('id')
                .eq('modulo_id', modulo.id)
                .eq('ativo', true);
                
              if (videosError) {
                console.error('Erro ao buscar vídeos:', videosError);
                continue;
              }
                
              modulosObrigatorios.push({
                modulo_id: modulo.id,
                titulo: modulo.titulo,
                trilha_titulo: trilha.titulo,
                video_ids: videos?.map(v => v.id) || [],
                concluido: false
              });
            }
          }
        }
      }
    }
    
    console.log(`Recomendações: ${trilhasRecomendadas.length} trilhas, ${modulosObrigatorios.length} módulos`);
    
    // Atualizar projeto no banco
    const { error: updateError } = await supabase
      .from('projetos_mentoria')
      .update({
        trilhas_recomendadas: trilhasRecomendadas,
        modulos_obrigatorios: modulosObrigatorios
      })
      .eq('id', projeto_id);
      
    if (updateError) {
      console.error('Erro ao atualizar projeto:', updateError);
      throw updateError;
    }
    
    return new Response(
      JSON.stringify({ 
        trilhasRecomendadas, 
        modulosObrigatorios,
        mensagem: `${trilhasRecomendadas.length} trilhas e ${modulosObrigatorios.length} módulos recomendados`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: any) {
    console.error('Erro na função:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Erro desconhecido' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
