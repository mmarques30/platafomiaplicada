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

    console.log(`Processing file: ${fileName}, type: ${fileType}`);

    // For text files, decode directly
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      const textContent = atob(fileBase64);
      return new Response(
        JSON.stringify({ texto: textContent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mimeType = fileType || (fileName.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    // For DOCX files, extract text using mammoth
    if (mimeType.includes('wordprocessingml') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      console.log('Extracting text from DOCX using mammoth...');
      try {
        const mammoth = await import("npm:mammoth@1.8.0");
        const binaryStr = atob(fileBase64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const result = await mammoth.extractRawText({ buffer: bytes });
        const textoExtraido = result.value;

        if (!textoExtraido || textoExtraido.trim().length === 0) {
          throw new Error('Não foi possível extrair texto do documento DOCX');
        }

        console.log(`DOCX text extracted, length: ${textoExtraido.length} chars`);
        return new Response(
          JSON.stringify({ texto: textoExtraido }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (mammothError: unknown) {
        console.error('Mammoth extraction failed:', mammothError);
        const msg = mammothError instanceof Error ? mammothError.message : 'Erro ao extrair texto do DOCX';
        return new Response(
          JSON.stringify({ error: msg }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // For PDF, use Lovable AI to extract text via image_url
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const dataUrl = `data:${mimeType};base64,${fileBase64}`;

    const systemPrompt = `Você é um assistente especializado em extrair texto de documentos.
Sua tarefa é extrair TODO o texto legível do documento fornecido, preservando:
- A estrutura e organização do conteúdo
- Parágrafos e quebras de linha
- Listas e numerações
- Tabelas (formatadas como texto)

Retorne APENAS o texto extraído, sem comentários adicionais.`;

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
              { 
                type: 'text', 
                text: `Extraia todo o texto deste documento "${fileName}":` 
              },
              {
                type: 'image_url',
                image_url: { url: dataUrl }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos à sua conta.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`Erro ao processar documento: ${response.status}`);
    }

    const data = await response.json();
    const textoExtraido = data.choices?.[0]?.message?.content || '';

    if (!textoExtraido) {
      throw new Error('Não foi possível extrair texto do documento');
    }

    console.log(`Text extracted, length: ${textoExtraido.length} chars`);

    return new Response(
      JSON.stringify({ texto: textoExtraido }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error processing document:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao processar documento';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
