

# Fix: HTML document processing returns empty results

## Root cause

The logs show `processarDocumentoLivre` is called correctly with 51999 chars, but `extractJsonFromResponse` fails both parse attempts. The problem is **two-fold**:

1. **max_tokens too low**: `callAI` is called with `8192` max_tokens. The Focus Fintax document has 5+ modules with dozens of features. The AI needs to output a JSON with etapas, entregas, AND instrucoes for all of them -- easily 15K+ tokens. The response gets **truncated mid-JSON**, producing invalid JSON like `{"etapas": [...], "entregas": [...], "instruc` which can never be parsed.

2. **No truncation recovery**: When JSON is truncated, `extractJsonFromResponse` tries simple regex fixes (trailing commas, smart quotes) but has no logic to handle incomplete/cut-off JSON, which is the actual failure mode.

3. **No logging of AI response**: We never log what the AI returns, making debugging impossible.

## Changes

### File: `supabase/functions/processar-documentos-business/index.ts`

**Change 1: Increase max_tokens in `processarDocumentoLivre`** (line 1153)
- Change `callAI(apiKey, prompt, 8192)` to `callAI(apiKey, prompt, 16384)`
- Gemini 2.5 Flash supports large output; 16K tokens gives enough room for complex documents

**Change 2: Add debug logging** (after line 1153)
- Log the first 500 chars and total length of the raw AI response before parsing
- This allows debugging if issues persist

**Change 3: Add truncation recovery to `extractJsonFromResponse`** (after line 604, before the empty return)
- Before returning empty structure, attempt to salvage truncated JSON by:
  - Closing any open strings (add `"`)
  - Closing open arrays (add `]`)
  - Closing open objects (add `}`)
  - Try parsing again after each closure
- This handles the common case where the response is valid JSON that was simply cut off

**Change 4: Simplify the prompt to reduce response size** (lines 1073-1150)
- Remove the `instrucoes` requirement from `processarDocumentoLivre` prompt entirely
- Ask only for `etapas` and `entregas` -- which are the critical data
- This dramatically reduces the response size needed, making truncation less likely
- Instrucoes can be generated in a follow-up call if needed

This combination of larger token limit + smaller response requirement + truncation recovery should resolve the parsing failures.

