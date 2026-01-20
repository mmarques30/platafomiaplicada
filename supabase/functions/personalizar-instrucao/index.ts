import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PassoInstrucao {
  numero: number;
  titulo: string;
  descricao?: string;
  recursos: Array<{
    id: string;
    tipo: string;
    url: string;
    titulo: string;
  }>;
}

interface RequestBody {
  texto_orientativo: string;
  passos: PassoInstrucao[];
  contexto?: {
    etapaTitulo?: string;
    contratoNomeEmpresa?: string;
    instrucaoTitulo?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { texto_orientativo, passos, contexto } = await req.json() as RequestBody;

    if (!texto_orientativo) {
      return new Response(
        JSON.stringify({ error: 'Texto orientativo é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Montar descrição dos passos e recursos
    let passosDescricao = '';
    if (passos && passos.length > 0) {
      passosDescricao = '\n\nPassos definidos:\n' + passos.map(p => {
        let passoText = `${p.numero}. ${p.titulo}`;
        if (p.descricao) passoText += ` - ${p.descricao}`;
        if (p.recursos && p.recursos.length > 0) {
          passoText += '\n   Recursos: ' + p.recursos.map(r => r.titulo).join(', ');
        }
        return passoText;
      }).join('\n');
    }

    // Montar contexto
    let contextoText = '';
    if (contexto) {
      const partes = [];
      if (contexto.contratoNomeEmpresa) partes.push(`Empresa: ${contexto.contratoNomeEmpresa}`);
      if (contexto.etapaTitulo) partes.push(`Etapa: ${contexto.etapaTitulo}`);
      if (contexto.instrucaoTitulo) partes.push(`Instrução: ${contexto.instrucaoTitulo}`);
      if (partes.length > 0) {
        contextoText = '\n\nContexto: ' + partes.join(' | ');
      }
    }

    // Usar o endpoint da Lovable AI
    const prompt = `Você é um consultor de IA especializado em transformação digital para empresas.

Com base no texto orientativo abaixo, crie uma descrição clara, objetiva e personalizada para o cliente executar esta instrução.

TEXTO ORIENTATIVO:
${texto_orientativo}
${passosDescricao}
${contextoText}

REGRAS:
1. Seja direto e objetivo (máximo 3-4 parágrafos)
2. Use linguagem profissional mas acessível
3. Se houver passos, referencie-os naturalmente
4. Se houver recursos mencionados, indique quando usá-los
5. Foque no resultado esperado e no valor para o cliente
6. NÃO use formatação markdown complexa, apenas texto simples

Responda APENAS com a descrição personalizada, sem títulos ou explicações adicionais.`;

    const manusApiKey = Deno.env.get('MANUS_API_KEY');
    if (!manusApiKey) {
      throw new Error('MANUS_API_KEY não configurada');
    }

    const response = await fetch('https://api.manus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${manusApiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da API:', errorText);
      throw new Error(`Erro da API: ${response.status}`);
    }

    const data = await response.json();
    const descricaoPersonalizada = data.choices?.[0]?.message?.content || '';

    return new Response(
      JSON.stringify({ descricao_personalizada: descricaoPersonalizada.trim() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
