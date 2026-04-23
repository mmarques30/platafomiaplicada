import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Converte HTML em Markdown preservando hierarquia (H1=#, H2=##, H3=###, li=-, etc.)
// Detecta H1/H2/H3 que mencionam Fase/Etapa/Entrega/Módulo/Passo e prefixa com marcadores
// reconhecidos pelo pre-parser (FASE N:, ENTREGA N:, PASSO N:).
function htmlParaMarkdown(htmlRaw: string): string {
  let html = htmlRaw
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  const stripInner = (s: string) =>
    s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

  // Contadores para auto-numeração
  let faseCount = 0;
  let entregaCount = 0;
  let passoCount = 0;

  // Substituir headings preservando hierarquia
  html = html.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_m, inner) => {
    const t = stripInner(inner);
    if (!t) return '\n';
    faseCount++;
    entregaCount = 0;
    passoCount = 0;
    const tipo = /fase|etapa|m[oó]dulo/i.test(t) ? '' : `FASE ${faseCount}: `;
    return `\n\n# ${tipo}${t}\n`;
  });

  html = html.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_m, inner) => {
    const t = stripInner(inner);
    if (!t) return '\n';
    entregaCount++;
    passoCount = 0;
    const tipo = /entrega|m[oó]dulo|sprint/i.test(t) ? '' : `ENTREGA ${entregaCount}: `;
    return `\n\n## ${tipo}${t}\n`;
  });

  html = html.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_m, inner) => {
    const t = stripInner(inner);
    if (!t) return '\n';
    passoCount++;
    const tipo = /passo|tarefa|step/i.test(t) ? '' : `PASSO ${passoCount}: `;
    return `\n\n### ${tipo}${t}\n`;
  });

  html = html.replace(/<h[4-6][^>]*>([\s\S]*?)<\/h[4-6]>/gi, (_m, inner) => {
    const t = stripInner(inner);
    return t ? `\n#### ${t}\n` : '\n';
  });

  // Listas
  html = html.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m, inner) => {
    const t = stripInner(inner);
    return t ? `\n- ${t}` : '';
  });

  // Negrito / ênfase → manter como marcador
  html = html
    .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, '**$2**')
    .replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, '*$2*')
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

  // Quebras estruturais
  html = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|blockquote|section|article)>/gi, '\n');

  // Strip remaining tags
  let texto = html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return texto;
}

// Função para extrair texto de DOCX manualmente (parsing XML interno)
async function extrairTextoDOCX(fileBase64: string): Promise<string> {
  console.log('Extraindo texto de DOCX (parsing XML interno)...');
  
  const JSZip = (await import("https://esm.sh/jszip@3.10.1")).default;
  
  // Decodificar base64 para Uint8Array
  const binaryString = atob(fileBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const zip = await JSZip.loadAsync(bytes);
  
  // DOCX tem o conteúdo principal em word/document.xml
  const documentXml = await zip.file('word/document.xml')?.async('text');
  
  if (!documentXml) {
    throw new Error('Arquivo DOCX inválido: word/document.xml não encontrado');
  }
  
  // Extrair texto das tags <w:t>texto</w:t>
  const textMatches = documentXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
  const paragraphs: string[] = [];
  let currentParagraph = '';
  
  // Detectar parágrafos pelas tags <w:p>
  const paragraphBlocks = documentXml.split(/<w:p[^>]*>/);
  
  for (const block of paragraphBlocks) {
    const texts = block.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
    const paragraphText = texts.map(t => 
      t.replace(/<w:t[^>]*>|<\/w:t>/g, '')
    ).join('');
    
    if (paragraphText.trim()) {
      paragraphs.push(paragraphText.trim());
    }
  }
  
  const resultado = paragraphs.join('\n');
  console.log(`DOCX XML parsing extraiu: ${resultado.length} caracteres`);
  
  return resultado;
}

// Função para extrair texto de PPTX usando JSZip
async function extrairTextoPPTX(fileBase64: string): Promise<string> {
  console.log('Extraindo texto de PPTX com JSZip...');
  
  const JSZip = (await import("https://esm.sh/jszip@3.10.1")).default;
  
  // Decodificar base64 para Uint8Array
  const binaryString = atob(fileBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const zip = await JSZip.loadAsync(bytes);
  const slides: string[] = [];
  
  // PPTX tem slides em ppt/slides/slideX.xml
  const slideFiles = Object.keys(zip.files)
    .filter(name => name.match(/ppt\/slides\/slide\d+\.xml$/))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)?.[1] || '0');
      const numB = parseInt(b.match(/slide(\d+)/)?.[1] || '0');
      return numA - numB;
    });
  
  for (const slideFile of slideFiles) {
    const content = await zip.files[slideFile].async('text');
    
    // Extrair texto das tags <a:t>texto</a:t>
    const textMatches = content.match(/<a:t>([^<]*)<\/a:t>/g) || [];
    const slideTexts = textMatches.map(match => 
      match.replace(/<a:t>|<\/a:t>/g, '').trim()
    ).filter(t => t.length > 0);
    
    if (slideTexts.length > 0) {
      const slideNum = slideFile.match(/slide(\d+)/)?.[1] || '?';
      slides.push(`--- Slide ${slideNum} ---\n${slideTexts.join('\n')}`);
    }
  }
  
  const resultado = slides.join('\n\n');
  console.log(`JSZip extraiu: ${resultado.length} caracteres de ${slideFiles.length} slides`);
  
  return resultado;
}

// Função para extrair texto de PDF usando Gemini (suportado)
async function extrairTextoPDF(fileBase64: string, fileName: string, apiKey: string): Promise<string> {
  console.log('Extraindo texto de PDF com Gemini...');
  
  const dataUrl = `data:application/pdf;base64,${fileBase64}`;
  
  const systemPrompt = `Você é um assistente especializado em extrair texto de documentos PDF.
Extraia TODO o texto legível do documento, preservando:
- Estrutura e organização
- Títulos e subtítulos
- Listas e bullets
- Tabelas (como texto formatado)

Retorne APENAS o texto extraído, sem comentários adicionais.
Se não conseguir ler o documento, responda apenas: "ERRO_LEITURA"`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: [
            { type: 'text', text: `Extraia todo o texto deste PDF "${fileName}":` },
            { type: 'image_url', image_url: { url: dataUrl } }
          ]
        }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erro Gemini PDF:', response.status, errorText);
    throw new Error(`Erro ao processar PDF: ${response.status}`);
  }

  const data = await response.json();
  const texto = data.choices?.[0]?.message?.content || '';
  
  console.log(`Gemini PDF extraiu: ${texto.length} caracteres`);
  return texto;
}

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

    const fileNameLower = fileName.toLowerCase();
    console.log(`Extraindo texto de: ${fileName}, tipo: ${fileType}, tamanho base64: ${fileBase64.length}`);

    let textoExtraido = '';

    // ===== ARQUIVOS TEXTO - DECODIFICAR DIRETAMENTE =====
    if (fileType === 'text/plain' || fileNameLower.endsWith('.txt') || fileNameLower.endsWith('.md')) {
      const binStr = atob(fileBase64);
      const bytesArr = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) { bytesArr[i] = binStr.charCodeAt(i); }
      textoExtraido = new TextDecoder('utf-8').decode(bytesArr);
      console.log(`Texto puro extraído: ${textoExtraido.length} caracteres`);
    }
    
    // ===== HTML - EXTRAIR TEXTO REMOVENDO TAGS =====
    else if (fileType === 'text/html' || fileNameLower.endsWith('.html') || fileNameLower.endsWith('.htm')) {
      const htmlBinStr = atob(fileBase64);
      const htmlBytes = new Uint8Array(htmlBinStr.length);
      for (let i = 0; i < htmlBinStr.length; i++) { htmlBytes[i] = htmlBinStr.charCodeAt(i); }
      const htmlRaw = new TextDecoder('utf-8').decode(htmlBytes);
      textoExtraido = htmlParaMarkdown(htmlRaw);
      console.log(`HTML→Markdown extraído: ${textoExtraido.length} caracteres`);
    }
    
    // ===== DOCX - USAR MAMMOTH (EXTRAÇÃO NATIVA) =====
    else if (fileNameLower.endsWith('.docx') || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      textoExtraido = await extrairTextoDOCX(fileBase64);
    }
    
    // ===== PPTX - USAR JSZIP (EXTRAÇÃO NATIVA) =====
    else if (fileNameLower.endsWith('.pptx') || fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      textoExtraido = await extrairTextoPPTX(fileBase64);
    }
    
    // ===== PDF - USAR GEMINI (SUPORTADO) =====
    else if (fileNameLower.endsWith('.pdf') || fileType === 'application/pdf') {
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY não configurada');
      }
      textoExtraido = await extrairTextoPDF(fileBase64, fileName, LOVABLE_API_KEY);
    }
    
    // ===== DOC/PPT ANTIGOS - NÃO SUPORTADOS =====
    else if (fileNameLower.endsWith('.doc') || fileNameLower.endsWith('.ppt')) {
      console.warn('Formato antigo não suportado:', fileName);
      return new Response(
        JSON.stringify({ 
          error: 'Formato .doc/.ppt não suportado. Por favor, converta para .docx/.pptx' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // ===== OUTROS - TENTAR GEMINI GENÉRICO =====
    else {
      console.warn('Tipo de arquivo desconhecido, tentando Gemini genérico:', fileType);
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY não configurada');
      }
      textoExtraido = await extrairTextoPDF(fileBase64, fileName, LOVABLE_API_KEY);
    }

    // Validar resultado
    if (!textoExtraido || textoExtraido.length < 20 || textoExtraido.includes('ERRO_LEITURA')) {
      console.warn('Não foi possível extrair texto significativo:', textoExtraido?.length || 0, 'caracteres');
      return new Response(
        JSON.stringify({ texto: null, fallback: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Texto extraído com sucesso: ${textoExtraido.length} caracteres`);

    return new Response(
      JSON.stringify({ texto: textoExtraido }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na extração:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro ao processar documento' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
