

# Fix: UTF-8 encoding broken in HTML text extraction

## Problem
The screenshot shows classic UTF-8 mojibake: "ESTRATÃ©GICO" instead of "ESTRATÉGICO", "MÃ³DULO" instead of "MÓDULO". 

`atob()` decodes base64 to a binary string where each character = 1 byte. UTF-8 characters like `é`, `ó`, `ã` are multi-byte, so they get split into garbage characters.

## Fix

**File: `supabase/functions/extrair-texto-documento/index.ts`**

Replace `atob(fileBase64)` on line 180 with proper UTF-8 decoding:

```typescript
// Decode base64 to bytes, then properly decode as UTF-8
const binaryString = atob(fileBase64);
const bytes = new Uint8Array(binaryString.length);
for (let i = 0; i < binaryString.length; i++) {
  bytes[i] = binaryString.charCodeAt(i);
}
const htmlRaw = new TextDecoder('utf-8').decode(bytes);
```

Same fix needed for the plain text branch (line 174) which has the identical `atob()` problem.

This is the same pattern already used in `extrairTextoDOCX` and `extrairTextoPPTX` functions in this same file — just not applied to the HTML/text paths.

