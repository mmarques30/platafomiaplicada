

# Fix: Importação de Contrato e Dados Desconfigurados na View do Mentorado

## Problema 1: Erro "add function" ao importar contrato DOCX

A edge function `parse-documento-contrato` tenta enviar arquivos DOCX diretamente para o Gemini via `image_url`, mas o Gemini retorna erro 400: **"Unsupported MIME type: application/vnd.openxmlformats-officedocument.wordprocessingml.document"**. O Gemini só aceita imagens e PDFs via `image_url`, não DOCX.

**Solução**: Para arquivos DOCX, usar a biblioteca `mammoth` (disponível via npm/esm) no edge function para converter o DOCX em texto puro antes de enviar ao Gemini. Fluxo:
- PDF → continua usando `image_url` (já funciona)
- DOCX → extrair texto com `mammoth` → enviar como texto puro ao Gemini
- TXT → continua decodificando direto (já funciona)

## Problema 2: Dados desconfigurados na view do mentorado

A interface `ContratoBusiness` define `modulos_selecionados` como `Array<{ nome: string; descricao?: string }>`, mas no banco os dados são **strings simples** (ex: `["CRM", "Financeiro"]`). Quando o código tenta renderizar `{m.nome || m}`, funciona por fallback, mas a tipagem está incorreta.

O problema mais provável de "valor, exclamação" é que os valores numéricos (como `valor_contrato: 8997.00`) estão sendo exibidos com formatação inconsistente, ou campos nulos mostram artefatos visuais. Além disso, `tempo_consultoria_meses` renderiza como template string `` `${contrato.tempo_consultoria_meses} meses` `` — se for `null` ou `undefined`, mostra "undefined meses".

**Solução**: Adicionar guards de null/undefined em todos os campos renderizados no `MeuSistemaDocumentos.tsx` e corrigir a tipagem de `modulos_selecionados`.

## Arquivos a editar

| Arquivo | Ação |
|---|---|
| `supabase/functions/parse-documento-contrato/index.ts` | **Editar** — usar mammoth para DOCX, manter image_url para PDF |
| `src/pages/MeuSistemaDocumentos.tsx` | **Editar** — adicionar guards de null em todos os campos, corrigir formatação |
| `src/hooks/useContratosBusiness.tsx` | **Editar** — corrigir tipo de `modulos_selecionados` para `Array<string | { nome: string }>` |

## Detalhes técnicos

### Edge Function — DOCX handling
```typescript
// Para DOCX: converter para texto com mammoth
import mammoth from "npm:mammoth@1.8.0";

if (mimeType.includes('wordprocessingml') || fileName.endsWith('.docx')) {
  const buffer = Uint8Array.from(atob(fileBase64), c => c.charCodeAt(0));
  const result = await mammoth.extractRawText({ buffer });
  return new Response(JSON.stringify({ texto: result.value }), { headers: ... });
}
// Para PDF: continua usando image_url com Gemini
```

### MeuSistemaDocumentos — Guards
- `tempo_consultoria_meses`: mostrar "—" se null
- `valor_contrato`, `valor_entrada`, `valor_parcela`: usar `formatCurrency` que já trata null
- Todos os InfoItem já usam `value || "—"`, mas template strings como `` `${x} meses` `` precisam de guard

