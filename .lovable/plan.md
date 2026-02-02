
# Plano: Reproduzir Vídeo Diretamente do Google Drive

## Problema

O vídeo do Google Drive não está sendo reproduzido no player. Atualmente:
- O player **sempre** tenta carregar do YouTube usando o `youtube_id`
- Quando falha, oferece o Google Drive como **link externo** (abre nova aba)
- O usuário quer que o vídeo seja reproduzido **diretamente** do Drive no player

## Diagnóstico Técnico

O link salvo: `https://drive.google.com/file/d/12HCoZ_I_k81q5TydookcUfyO8sxaEn-V/view?usp=sharing`

Para reproduzir vídeo do Google Drive via iframe, é necessário:
1. Converter URL `/view` para `/preview`
2. Usar iframe direto (react-player não suporta Google Drive nativamente)
3. Configurar `crossOrigin="anonymous"` no elemento de vídeo

## Solução Proposta

Criar um player híbrido que:
1. **Se tiver `google_drive_url`** → prioriza reprodução via iframe do Drive
2. **Senão** → usa YouTube como antes
3. Se ambos falharem → oferece links externos como fallback

### Formato das URLs

| Formato Original | Formato Embed |
|-----------------|---------------|
| `drive.google.com/file/d/ID/view` | `drive.google.com/file/d/ID/preview` |

### Função de Conversão

```typescript
function getGoogleDriveEmbedUrl(url: string): string | null {
  // Extrair o FILE_ID do link de compartilhamento
  const match = url.match(/\/d\/([^/]+)/);
  if (!match) return null;
  
  const fileId = match[1];
  return `https://drive.google.com/file/d/${fileId}/preview`;
}
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/video/CustomVideoPlayer.tsx` | Adicionar lógica para priorizar Google Drive quando disponível |
| `src/pages/TrilhaDetalhes.tsx` | Passar `googleDriveUrl` para o iframe quando disponível |
| `src/lib/google-drive.ts` | Novo arquivo com funções de conversão de URLs |

---

## Implementação

### 1. Novo Utilitário: `src/lib/google-drive.ts`

```typescript
/**
 * Converte URL de compartilhamento do Google Drive para URL de embed
 * Input:  https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * Output: https://drive.google.com/file/d/FILE_ID/preview
 */
export function getGoogleDriveEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  const match = url.match(/\/d\/([^/]+)/);
  if (!match) return null;
  
  const fileId = match[1];
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * Verifica se uma URL é do Google Drive
 */
export function isGoogleDriveUrl(url: string): boolean {
  return url?.includes('drive.google.com');
}
```

### 2. Atualizar `CustomVideoPlayer.tsx`

Adicionar lógica para escolher fonte:

```typescript
// No início do componente
const driveEmbedUrl = googleDriveUrl 
  ? getGoogleDriveEmbedUrl(googleDriveUrl) 
  : null;

// Priorizar Google Drive quando disponível
const useGoogleDrive = !!driveEmbedUrl;
```

Se `useGoogleDrive`, renderizar iframe do Drive em vez do player YouTube:

```tsx
if (useGoogleDrive && driveEmbedUrl) {
  return (
    <div className={cn("relative w-full bg-black overflow-hidden rounded-lg", aspectClass)}>
      {showThumbnail && thumbnail ? (
        // ... thumbnail com botão play
      ) : (
        <iframe
          src={driveEmbedUrl}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      )}
    </div>
  );
}
```

### 3. Atualizar `TrilhaDetalhes.tsx`

Passar a propriedade `google_drive_url` para o player embarcado:

```tsx
// Onde usa iframe do YouTube (linha 263-269)
{currentVideo.google_drive_url ? (
  <iframe
    src={getGoogleDriveEmbedUrl(currentVideo.google_drive_url)}
    title={currentVideo.titulo}
    allow="autoplay; encrypted-media"
    allowFullScreen
    className="w-full h-full"
  />
) : (
  <iframe
    src={`https://www.youtube.com/embed/${currentVideo.youtube_id}?...`}
    // ... resto igual
  />
)}
```

---

## Comportamento Final

```text
1. Usuário acessa vídeo
   ↓
2. Verifica se tem google_drive_url configurado
   ↓
   ├── SIM → Usa iframe do Google Drive (/preview)
   │          Player embed nativo do Drive
   │
   └── NÃO → Usa YouTube como fonte
              ├── Sucesso → Exibe vídeo
              └── Falha → Mostra botões de fallback
```

---

## Vantagens da Solução

1. **Prioriza Drive** quando configurado (evita bloqueios YouTube)
2. **Mantém compatibilidade** com vídeos apenas no YouTube
3. **Fallback robusto** se ambos falharem
4. **Sem dependência de API** - usa apenas iframe embed

## Limitações Conhecidas

- O embed do Google Drive não permite controles customizados (play/pause externos)
- Não é possível rastrear tempo assistido no vídeo do Drive
- O Drive precisa ter permissão de visualização "Qualquer pessoa com o link"
