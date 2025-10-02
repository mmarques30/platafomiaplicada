import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const titulo = formData.get('titulo') as string;
    const categoria = formData.get('categoria') as string;

    if (!file || !titulo || !categoria) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios faltando' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'Arquivo muito grande. Máximo 10MB.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validar tipo de arquivo
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Tipo de arquivo não suportado' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Upload do arquivo pro storage
    const fileName = `${crypto.randomUUID()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('knowledge-documents')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      return new Response(JSON.stringify({ error: 'Erro ao fazer upload do arquivo' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extrair texto do arquivo
    const fileBuffer = await file.arrayBuffer();
    const fileContent = new Uint8Array(fileBuffer);
    let conteudoExtraido = '';

    if (file.type === 'text/plain' || file.type === 'text/markdown') {
      const decoder = new TextDecoder('utf-8');
      conteudoExtraido = decoder.decode(fileContent);
    } else if (file.type === 'application/pdf') {
      // Para PDF, vamos extrair texto simples (simplificado)
      const decoder = new TextDecoder('utf-8');
      conteudoExtraido = decoder.decode(fileContent);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Para DOCX, extrair texto (simplificado)
      const decoder = new TextDecoder('utf-8');
      conteudoExtraido = decoder.decode(fileContent);
    }

    // Obter URL pública do arquivo
    const { data: { publicUrl } } = supabaseClient
      .storage
      .from('knowledge-documents')
      .getPublicUrl(fileName);

    // Salvar na tabela knowledge_base
    const { data: knowledgeData, error: dbError } = await supabaseClient
      .from('knowledge_base')
      .insert({
        titulo,
        tipo_arquivo: file.type,
        conteudo_extraido: conteudoExtraido,
        arquivo_url: publicUrl,
        categoria,
        created_by: user.id,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Erro ao salvar no banco:', dbError);
      return new Response(JSON.stringify({ error: 'Erro ao salvar documento no banco de dados' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Documento processado com sucesso:', knowledgeData.id);

    return new Response(JSON.stringify({ 
      success: true, 
      documento: knowledgeData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no processamento:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
