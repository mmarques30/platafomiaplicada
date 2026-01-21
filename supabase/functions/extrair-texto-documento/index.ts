import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileBase64, fileName, fileType } = await req.json();

    if (!fileBase64 || !fileName) {
      return new Response(
        JSON.stringify({ error: 'Arquivo e nome são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Extraindo texto de: ${fileName}, tipo: ${fileType}, tamanho base64: ${fileBase64.length}`);

    // Para arquivos texto, decodificar diretamente
    if (fileType === 'text/plain' || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      const textContent = atob(fileBase64);
      return new Response(
        JSON.stringify({ texto: textContent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Para PDF, PPTX, DOCX - usar Gemini com capacidade multimodal
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    // Criar data URL com mime type correto
    const mimeType = fileType || getMimeType(fileName);
    const dataUrl = `data:${mimeType};base64,${fileBase64}`;

    const systemPrompt = `Você é um assistente especializado em extrair texto de documentos.
Extraia TODO o texto legível do documento, preservando:
- Estrutura e organização
- Títulos e subtítulos
- Listas e bullets
- Tabelas (como texto formatado)
- Slides (para PPTX, separe cada slide)

Retorne APENAS o texto extraído, sem comentários adicionais.
Se for uma apresentação, indique: "--- Slide X ---" para cada slide.
Se não conseguir ler o documento, responda apenas: "ERRO_LEITURA"`;

    console.log('Chamando Gemini para extrair texto...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: `Extraia todo o texto deste documento "${fileName}":` },
              { type: 'image_url', image_url: { url: dataUrl } }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit atingido');
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        console.error('Créditos insuficientes');
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('Erro na API:', response.status, errorText);
      throw new Error(`Erro ao processar documento: ${response.status}`);
    }

    const data = await response.json();
    const textoExtraido = data.choices?.[0]?.message?.content || '';

    console.log(`Texto extraído: ${textoExtraido.length} caracteres`);

    // Verificar se houve erro de leitura
    if (!textoExtraido || textoExtraido.length < 20 || textoExtraido.includes('ERRO_LEITURA')) {
      console.warn('Não foi possível extrair texto significativo');
      return new Response(
        JSON.stringify({ texto: null, fallback: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ texto: textoExtraido }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro ao processar documento' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const mimes: Record<string, string> = {
    'pdf': 'application/pdf',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'ppt': 'application/vnd.ms-powerpoint',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'doc': 'application/msword',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'xls': 'application/vnd.ms-excel',
    'txt': 'text/plain',
    'md': 'text/markdown',
  };
  return mimes[ext || ''] || 'application/octet-stream';
}
