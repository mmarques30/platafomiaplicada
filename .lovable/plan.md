

# Corrigir validacao de URLs do YouTube Live

## Problema
A funcao `extractYouTubeId` em `src/lib/youtube.ts` nao reconhece URLs no formato de live streams do YouTube (`youtube.com/live/VIDEO_ID`), causando o erro "URL do YouTube invalida" ao tentar cadastrar videos com esse formato.

## Formatos atualmente suportados
- `youtube.com/watch?v=ID`
- `youtu.be/ID`
- `youtube.com/embed/ID`
- `youtube.com/v/ID`

## Formato que falta
- `youtube.com/live/ID` (lives e transmissoes)
- `youtube.com/shorts/ID` (shorts -- aproveitando para adicionar tambem)

## Solucao

### Arquivo: `src/lib/youtube.ts`

Adicionar dois novos regex patterns ao array `patterns`:

```
/youtube\.com\/live\/([^&\n?#]+)/
/youtube\.com\/shorts\/([^&\n?#]+)/
```

O array completo ficara com 5 patterns cobrindo todos os formatos comuns de URL do YouTube.

Nenhum outro arquivo precisa ser alterado -- toda a logica de validacao passa por esta funcao.
