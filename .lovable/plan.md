

# Plano: Suporte a Google Drive como Alternativa ao YouTube

## Resumo

Adicionar um campo opcional `google_drive_url` na tabela `videos` para permitir que vídeos sejam disponibilizados via Google Drive como alternativa quando o YouTube bloquear o conteúdo. O player de vídeo verificará se o YouTube falhou e oferecerá o link do Drive como fallback.

---

## Alterações Necessárias

### 1. Banco de Dados: Nova Coluna

Adicionar o campo `google_drive_url` (texto, opcional) na tabela `videos`:

```sql
ALTER TABLE public.videos 
ADD COLUMN google_drive_url text;

COMMENT ON COLUMN public.videos.google_drive_url IS 'URL alternativa do Google Drive para casos onde o YouTube não está disponível';
```

### 2. Modal de Edição de Vídeo (Admin)

Adicionar campo no `VideoModal.tsx` para inserir a URL do Google Drive:

```
┌─────────────────────────────────────────────────────┐
│ URL do YouTube                                      │
│ [https://youtube.com/watch?v=...              ]    │
├─────────────────────────────────────────────────────┤
│ URL do Google Drive (Alternativo)                   │
│ [https://drive.google.com/file/d/...          ]    │
│ ⓘ Usado quando o YouTube bloquear o vídeo          │
└─────────────────────────────────────────────────────┘
```

### 3. Player de Vídeo: Lógica de Fallback

No `CustomVideoPlayer.tsx`, quando ocorrer erro de carregamento:
- Se `google_drive_url` existir, mostrar botão "Assistir no Google Drive"
- Manter o botão "Abrir no YouTube" como segunda opção

### 4. Atualizar o Vídeo Específico

Atualizar o vídeo 20 ("Pare de Fazer, Comece a Delegar") com a URL do Drive:
- **ID**: `38007daa-bf99-409f-993f-d996b595c734`
- **Google Drive URL**: `https://drive.google.com/file/d/12HCoZ_I_k81q5TydookcUfyO8sxaEn-V/view`

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| Migration SQL | Adicionar coluna `google_drive_url` |
| `src/components/admin/content/VideoModal.tsx` | Campo de input para URL do Drive |
| `src/components/video/CustomVideoPlayer.tsx` | Prop `googleDriveUrl` + botão fallback |
| `src/pages/VideoPlayer.tsx` | Passar `googleDriveUrl` para o player |
| `src/pages/TrilhaDetalhes.tsx` | Passar `googleDriveUrl` para o player |

---

## Seção Técnica

### Migration SQL

```sql
-- Adicionar coluna para URL alternativa do Google Drive
ALTER TABLE public.videos 
ADD COLUMN IF NOT EXISTS google_drive_url text;

COMMENT ON COLUMN public.videos.google_drive_url IS 
  'URL alternativa do Google Drive para fallback quando YouTube não estiver disponível';

-- Atualizar o vídeo específico
UPDATE public.videos 
SET google_drive_url = 'https://drive.google.com/file/d/12HCoZ_I_k81q5TydookcUfyO8sxaEn-V/view?usp=sharing'
WHERE id = '38007daa-bf99-409f-993f-d996b595c734';
```

### VideoModal.tsx - Novo Campo

```tsx
<div className="space-y-2">
  <Label>URL do YouTube</Label>
  <Input {...register("youtube_url")} placeholder="https://youtube.com/watch?v=..." required />
</div>

<div className="space-y-2">
  <Label>URL do Google Drive (Alternativo)</Label>
  <Input 
    {...register("google_drive_url")} 
    placeholder="https://drive.google.com/file/d/..." 
  />
  <p className="text-xs text-muted-foreground">
    Usado como fallback quando o YouTube bloquear o vídeo
  </p>
</div>
```

### CustomVideoPlayer.tsx - Props Atualizadas

```tsx
interface CustomVideoPlayerProps {
  videoId: string;
  googleDriveUrl?: string | null;  // Nova prop
  startSeconds?: number;
  // ...resto igual
}
```

### Lógica de Fallback no Erro

```tsx
if (error) {
  return (
    <div className={cn("relative w-full bg-black overflow-hidden rounded-lg flex items-center justify-center", aspectClass)}>
      {/* ...thumbnail overlay... */}
      <div className="relative z-10 text-center space-y-4 p-6">
        <div className="text-red-500 text-lg font-semibold">
          Erro ao carregar vídeo
        </div>
        <p className="text-white/80 text-sm">{error}</p>
        <div className="flex flex-col gap-2">
          {googleDriveUrl && (
            <Button
              onClick={() => window.open(googleDriveUrl, '_blank')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <HardDrive className="h-4 w-4 mr-2" />
              Assistir no Google Drive
            </Button>
          )}
          <Button
            onClick={() => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/30"
          >
            Abrir no YouTube
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### VideoPlayer.tsx - Passando a Prop

```tsx
<CustomVideoPlayer
  videoId={video.youtube_id}
  googleDriveUrl={video.google_drive_url}  // Nova prop
  startSeconds={progresso?.tempo_assistido || 0}
  onTimeUpdate={handleTimeUpdate}
  onEnded={handleVideoEnded}
  thumbnail={video.thumbnail_customizado_url || getYouTubeThumbnail(video.youtube_id)}
  title={video.titulo}
/>
```

---

## Fluxo de Experiência do Usuário

```text
1. Usuário acessa vídeo
   ↓
2. Player tenta carregar YouTube
   ↓
3. ✅ Sucesso → Exibe vídeo normalmente
   ❌ Falha → Verifica se tem URL do Drive
      ↓
4. Se tem Drive URL:
   → Mostra "Assistir no Google Drive" (primário)
   → Mostra "Abrir no YouTube" (secundário)
   
   Se não tem Drive URL:
   → Mostra apenas "Abrir no YouTube"
```

---

## Comportamento Final

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `youtube_url` | text | ✅ | URL principal do YouTube |
| `google_drive_url` | text | ❌ | URL de backup no Google Drive |

O vídeo será exibido via YouTube por padrão. Apenas quando houver erro de carregamento (bloqueio, indisponibilidade), o botão do Google Drive aparecerá como opção prioritária.

