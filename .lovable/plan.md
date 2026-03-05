

# Correcao: HTML nao processado no upload de documentos Business

## Problema identificado

No arquivo `DocumentosUploadSection.tsx`, o `handleFileUpload` aceita arquivos `.html/.htm` no input, mas o codigo de extracao de texto **nao tem tratamento para HTML**:

- Arquivos `.txt/.md` -> lidos diretamente com `file.text()`
- Arquivos `.docx/.pdf/.pptx` -> enviados para edge function `extrair-texto-documento`
- Arquivos `.html/.htm` -> **caem no vazio**, `conteudoTexto` fica vazio

A edge function `extrair-texto-documento` ja tem suporte completo para HTML (remove tags, preserva quebras de linha), mas o cliente nunca envia HTMLs para ela.

## Solucao

Adicionar `.html` e `.htm` ao bloco que envia arquivos para a edge function `extrair-texto-documento`, junto com DOCX/PDF/PPTX. A edge function ja sabe processar HTML corretamente.

### Alteracao unica em `src/components/admin/business/DocumentosUploadSection.tsx`

Na funcao `handleFileUpload` (linha ~110), adicionar as extensoes `.html` e `.htm` na condicao que decide quais arquivos enviar para extracao via edge function:

```typescript
// De:
else if (
  file.name.endsWith(".docx") || 
  file.name.endsWith(".doc") ||
  file.name.endsWith(".pdf") ||
  file.name.endsWith(".pptx") ||
  file.name.endsWith(".ppt")
)

// Para:
else if (
  file.name.endsWith(".docx") || 
  file.name.endsWith(".doc") ||
  file.name.endsWith(".pdf") ||
  file.name.endsWith(".pptx") ||
  file.name.endsWith(".ppt") ||
  file.name.endsWith(".html") ||
  file.name.endsWith(".htm")
)
```

Isso e suficiente pois a edge function ja extrai texto de HTML corretamente.

