import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formData = await req.formData();
    const titulo = formData.get('titulo') as string;
    const categoria = formData.get('categoria') as string;
    const file = formData.get('file') as File;

    if (!titulo || !categoria || !file) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios faltando' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validar tipo de arquivo
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Tipo de arquivo não suportado. Use PDF, DOCX, TXT ou MD' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validar tamanho (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ error: 'Arquivo muito grande. Tamanho máximo: 10MB' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Upload para storage
    const fileName = `${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('knowledge-documents')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      return new Response(JSON.stringify({ error: 'Erro ao fazer upload do arquivo' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extrair texto do arquivo
    let conteudoExtraido = '';
    
    try {
      if (file.type === 'text/plain' || file.type === 'text/markdown') {
        conteudoExtraido = await file.text();
      } else if (file.type === 'application/pdf') {
        // Para PDFs, armazenar uma mensagem indicando que o conteúdo precisa ser processado
        conteudoExtraido = '[Documento PDF - Conteúdo a ser processado]';
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Para DOCX, armazenar uma mensagem indicando que o conteúdo precisa ser processado
        conteudoExtraido = '[Documento DOCX - Conteúdo a ser processado]';
      }
    } catch (e) {
      console.error('Erro ao extrair texto:', e);
      conteudoExtraido = '[Erro ao extrair conteúdo]';
    }

    // Determinar tipo de arquivo
    const tipoArquivo = file.name.split('.').pop()?.toLowerCase() || 'unknown';

    // Salvar na tabela knowledge_base
    const { data: knowledgeData, error: knowledgeError } = await supabaseClient
      .from('knowledge_base')
      .insert({
        titulo,
        categoria,
        tipo_arquivo: tipoArquivo,
        arquivo_url: uploadData.path,
        conteudo_extraido: conteudoExtraido,
        created_by: user.id,
        ativo: true,
      })
      .select()
      .single();

    if (knowledgeError) {
      console.error('Erro ao salvar na base de conhecimento:', knowledgeError);
      
      // Deletar arquivo do storage se falhar ao salvar no banco
      await supabaseClient.storage
        .from('knowledge-documents')
        .remove([uploadData.path]);

      return new Response(JSON.stringify({ error: 'Erro ao salvar documento na base de conhecimento' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      documento: knowledgeData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no processamento do documento:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
