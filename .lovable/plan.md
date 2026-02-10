
# Corrigir criação de vídeo com URL do Google Drive

## Problema

No hook `useCreateVideo` (arquivo `src/hooks/admin/useContent.tsx`), linhas 231-232, o código **sempre** exige uma URL do YouTube válida:

```typescript
const youtubeId = extractYouTubeId(video.youtube_url);
if (!youtubeId) throw new Error("URL do YouTube inválida");
```

Mesmo que o admin informe apenas a URL do Google Drive, o código tenta extrair o ID do YouTube de uma string vazia e lança o erro "URL do YouTube inválida".

O `useUpdateVideo` já trata isso corretamente (linha 260: `if (video.youtube_url)`), mas o `useCreateVideo` não.

## Solução

Alterar o `useCreateVideo` para tornar o YouTube ID condicional, da mesma forma que o `useUpdateVideo` já faz.

### Arquivo: `src/hooks/admin/useContent.tsx`

Substituir as linhas 230-238 de:

```typescript
mutationFn: async (video: any) => {
  const youtubeId = extractYouTubeId(video.youtube_url);
  if (!youtubeId) throw new Error("URL do YouTube inválida");

  const videoData = {
    ...video,
    youtube_id: youtubeId,
    thumbnail_url: getYouTubeThumbnail(youtubeId),
  };
```

Para:

```typescript
mutationFn: async (video: any) => {
  const videoData = { ...video };

  if (video.youtube_url?.trim()) {
    const youtubeId = extractYouTubeId(video.youtube_url);
    if (!youtubeId) throw new Error("URL do YouTube inválida");
    videoData.youtube_id = youtubeId;
    videoData.thumbnail_url = getYouTubeThumbnail(youtubeId);
  }
```

Isso permite criar vídeos usando apenas Google Drive, sem exigir YouTube.
