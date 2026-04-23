

## Diagnóstico

Investiguei o pipeline completo de geração de entregas e os pontos de download de arquivos. Encontrei 3 problemas reais:

### 1. Duplicação ao processar múltiplos HTMLs
Em `DocumentosUploadSection.handleProcessar()`, todos os documentos não-processados são concatenados com `---` num único texto antes de mandar pra IA. A edge function `processar-documentos-business` foi feita assumindo **um único documento estruturado** (com FASES, ENTREGAS, PASSOS contínuos). Quando recebe vários HTMLs colados, ela:
- Reextrai âncoras misturando "ENTREGA 1" do doc A com "ENTREGA 1" do doc B (mesmo número, conteúdos diferentes → entregas duplicadas/sobrepostas).
- Perde a hierarquia original de cada arquivo (nenhum separador é tratado pela função).
- Cai no fallback `processarDocumentoLivre` quando o HTML não tem palavras-chave "FASE/ENTREGA", e aí a IA "inventa" entregas genéricas.

### 2. Extração HTML perde a hierarquia semântica
`extrair-texto-documento` strippa todas as tags HTML e devolve texto plano, sem manter ordem `H1 → H2 → H3 → li`. Como o pre-parser depende de marcadores em texto puro (`FASE 1:`, `ENTREGA 1:`), HTMLs estruturados por headings viram "papelão".

### 3. Download dos Reports não funciona
Em `MeuSistemaDocumentos.tsx` e `MentoriaDocumentos.tsx`, o botão "Baixar" do Report chama `downloadUrl(report.arquivo_url, ...)` direto. Mas `arquivo_url` pode ser apenas o **path relativo** no bucket privado `contratos-business` — não uma URL pública nem signed. O download abre uma URL inválida e falha silenciosamente. (Os arquivos em `Arquivos` já funcionam — `ArquivosProjetoSection` cria signed URL corretamente.)

## Plano de correção

### A. Processar 1 documento por vez (resolve duplicação)
Em `src/components/admin/business/DocumentosUploadSection.tsx`:
- `handleProcessar` deixa de concatenar. Em vez disso, processa cada documento pendente sequencialmente chamando `processarDocumento` por arquivo, e mescla os resultados:
  - Renumera entregas globalmente (ex: doc A traz entregas 1–3, doc B começa em 4).
  - Renumera etapas globalmente também.
  - Mantém `instrucoes.entrega_numero` apontando para o novo número global.
- Mostra progresso "Processando X/Y" no toast.
- Se houver texto colado, vira mais um "documento" da fila.

### B. Melhorar extração de HTML (preserva hierarquia)
Em `supabase/functions/extrair-texto-documento/index.ts`, no bloco HTML:
- Converter `H1` → `# Título`, `H2` → `## Título`, `H3` → `### Título`, `<li>` → `- item`, `<strong>` → manter como marcador. Isso converte HTML estruturado em **Markdown**, que o pre-parser entende melhor.
- Detectar `H1/H2` que mencionem "Fase", "Etapa", "Entrega", "Módulo" e prefixar literalmente: `H2 "Cadastro de empresas"` quando dentro de um `H1 "Módulo 1"` vira `ENTREGA 1: Cadastro de empresas` automaticamente.
- Funcionalidade nova: **modo "auto-numerar"** quando o HTML não tem marcadores `FASE/ENTREGA` mas tem hierarquia clara de headings.

### C. Melhor formato de importação (recomendação ao usuário)
Adicionar no UI de upload (`DocumentosUploadSection`) um **alert info** com guia do formato ideal:

```
Formato recomendado para melhor extração:

FASE 1: Nome da Fase
  ENTREGA 1: Nome da Entrega
    PASSO 1: Nome do Passo
      Descrição...
      Prompt: "..." (opcional)
      DICA: ...
    PASSO 2: ...
  ENTREGA 2: ...

FASE 2: ...

Aceita: .txt, .md (ideal), .docx, .pdf, .html, .pptx
Para HTML: use H1 = Fase, H2 = Entrega, H3 = Passo
```

O **melhor formato é Markdown (.md)** — texto plano com hierarquia `#`/`##`/`###` e marcadores `FASE/ENTREGA/PASSO` explícitos. PDF é o pior (depende de OCR via Gemini).

### D. Corrigir download de Reports
Em `src/pages/MeuSistemaDocumentos.tsx` e `src/pages/MentoriaDocumentos.tsx`:
- Trocar `handleDownloadReport` para detectar se `arquivo_url` é URL absoluta (`http`) ou path do bucket. Se for path, gerar signed URL via `supabase.storage.from("contratos-business").createSignedUrl(arquivo_url, 3600)` antes de chamar `downloadUrl`.
- Adicionar feedback de loading no botão.

### E. Validar download dos Arquivos do projeto
`ArquivosProjetoSection` já usa signed URL corretamente — sem mudanças necessárias.

## Arquivos editados

1. `src/components/admin/business/DocumentosUploadSection.tsx` — processar 1 doc por vez + mesclar resultados + alert de formato recomendado.
2. `supabase/functions/extrair-texto-documento/index.ts` — converter HTML → Markdown preservando hierarquia.
3. `src/pages/MeuSistemaDocumentos.tsx` — corrigir download de Reports com signed URL.
4. `src/pages/MentoriaDocumentos.tsx` — mesma correção de download.

Sem alterações de banco. Sem migration.

## Resultado esperado

- Importar 3 HTMLs diferentes → gera 3 conjuntos de entregas separados, numerados em sequência, sem sobreposição.
- HTML estruturado por headings vira entregas/passos automaticamente, mesmo sem palavras-chave.
- Botão "Baixar" no card de Report passa a funcionar.
- Usuário vê instruções claras do melhor formato de importação direto no painel.

