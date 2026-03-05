

# Fix: HTML document processing fails to generate deliverables

## Root Cause (confirmed by logs)

The logs show: `processarDocumentoLivre` IS being called correctly, but produces **0 etapas, 0 entregas, 0 instrucoes**. Two bugs cause this:

### Bug 1: CSS/script noise in extracted text
`extrair-texto-documento` strips HTML tags but leaves `<style>`, `<script>`, `<nav>`, `<head>` **content** intact. The Focus Fintax HTML has ~140 lines of CSS that become raw text like `:root { --green-deep: #2F302B; }`. This wastes ~5000+ chars of the 30000 char limit and confuses the AI model.

### Bug 2: JSON parser destroys valid responses
`extractJsonFromResponse` (line 597) does `.replace(/\\"/g, "'")` in recovery mode. This replaces ALL escaped quotes with single quotes, which **corrupts valid JSON**. For example, a JSON value `"titulo": "Central da \"Holding\""` becomes `"titulo": "Central da 'Holding'"` which then breaks subsequent parsing.

The logs confirm: "First parse failed, attempting recovery... Second parse failed, returning empty structure."

## Changes

### 1. Fix HTML extraction (`supabase/functions/extrair-texto-documento/index.ts`, lines 179-195)

Remove `<style>`, `<script>`, `<nav>`, `<head>`, `<footer>` blocks BEFORE stripping tags:

```typescript
const htmlRaw = atob(fileBase64);
textoExtraido = htmlRaw
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
  .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
  .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
  // then existing tag stripping...
```

### 2. Fix JSON recovery (`supabase/functions/processar-documentos-business/index.ts`, line 597)

Remove the destructive `\\\"` → `'` replacement. Replace with a safe approach that removes problematic escape sequences without corrupting the JSON structure.

### 3. Increase text limit (`supabase/functions/processar-documentos-business/index.ts`, line 1113)

Change `texto.substring(0, 30000)` to `texto.substring(0, 45000)` in `processarDocumentoLivre` - the model supports larger context and with CSS removed, the actual content will fit better.

