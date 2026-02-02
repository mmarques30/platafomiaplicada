
# Plano: Tornar URL do YouTube Opcional

## Problema Identificado

No arquivo `src/components/admin/content/VideoModal.tsx`, linha 244:

```typescript
<Input {...register("youtube_url")} placeholder="https://youtube.com/watch?v=..." required />
```

O atributo `required` no campo de URL do YouTube impede a criação de vídeos que usam apenas Google Drive como fonte.

---

## Solução

Remover o atributo `required` do campo `youtube_url` e adicionar validação customizada para exigir **pelo menos uma** das URLs (YouTube ou Google Drive).

---

## Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/admin/content/VideoModal.tsx` | Remover `required` e adicionar validação customizada |

---

## Seção Técnica

### Linha 244 - Remover `required`

```typescript
// ANTES
<Input {...register("youtube_url")} placeholder="https://youtube.com/watch?v=..." required />

// DEPOIS
<Input {...register("youtube_url")} placeholder="https://youtube.com/watch?v=..." />
```

### Adicionar Validação no `onSubmit` (linha ~192)

```typescript
// Validar se pelo menos uma URL foi fornecida
const youtubeUrl = data.youtube_url?.trim();
const driveUrl = data.google_drive_url?.trim();

if (!youtubeUrl && !driveUrl) {
  toast.error("Informe pelo menos uma URL: YouTube ou Google Drive");
  return;
}
```

### Atualizar Texto de Ajuda (linhas 243-244)

```typescript
<div className="space-y-2">
  <Label>URL do YouTube (opcional se usar Drive)</Label>
  <Input {...register("youtube_url")} placeholder="https://youtube.com/watch?v=..." />
</div>
```

---

## Resultado Esperado

| Cenário | Antes | Depois |
|---------|-------|--------|
| Apenas YouTube | ✅ Funciona | ✅ Funciona |
| YouTube + Drive | ✅ Funciona | ✅ Funciona |
| Apenas Drive | ❌ Erro "required" | ✅ Funciona |
| Nenhuma URL | ❌ Erro "required" | ❌ Toast "Informe pelo menos uma URL" |
