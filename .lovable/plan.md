

# Adicionar suporte a arquivos HTML no processamento de documentos

## Contexto
O processamento de entregas Business (`DocumentosUploadSection`) e o contrato import (`ContratoImportSection`) não aceitam HTML. A edge function `extrair-texto-documento` também não trata HTML.

## Alterações

### 1. Edge function `extrair-texto-documento/index.ts`
- Adicionar bloco para arquivos `.html`/`.htm` (type `text/html`)
- Decodificar base64 para texto e remover tags HTML com regex simples (`/<[^>]*>/g`), preservando quebras de linha em `<br>`, `<p>`, `<div>`

### 2. Frontend - `DocumentosUploadSection.tsx` (linha ~248)
- Adicionar `.html,.htm` ao `accept` do input file

### 3. Frontend - `ContratoImportSection.tsx` (linhas 34-35)
- Adicionar `text/html` aos `validTypes` e `.html`/`.htm` aos `validExtensions`

### 4. Frontend - `UploadTranscricaoModal.tsx` (linhas 52, 178)
- Adicionar `text/html` aos validTypes e `.html` ao accept

Nenhuma migração de banco necessária. 1 edge function + 3 componentes editados.

