

# Vídeos de Instrução — Lens Preview + Admin Manager

## O que será feito

### 1. Refatorar seção de Vídeos na view do cliente (`MeuSistemaEntregas.tsx`)

A seção de vídeos já usa o componente `Lens` com thumbnail estática. Vou ajustar para que, no lugar da imagem, o conteúdo dentro do Lens seja o próprio vídeo do Google Drive em iframe (embed/preview), mantendo o efeito de lupa ao passar o mouse. Ao clicar, abre o Dialog com o vídeo em tamanho completo + descrição.

- Cards em grid (sm:2 lg:3) com `Lens` envolvendo um iframe do Google Drive (usando `getGoogleDriveEmbedUrl`)
- Fallback: se não tiver `video_url`, mostra placeholder com ícone Play
- Se tiver `thumbnail_url`, usa a thumbnail como capa; se não, usa o iframe do Drive como preview direto
- Ao clicar no card, abre Dialog com player completo + descrição

### 2. Criar admin manager `VideosInstrucaoManager.tsx`

Componente CRUD para `videos_instrucao_business`:
- Listar vídeos com título, descrição e thumbnail preview
- Modal criar/editar: título, descrição, URL do vídeo (Google Drive), URL da thumbnail (upload para bucket `contratos-business`)
- Reordenação por setas up/down
- Excluir com confirmação
- Seguir padrão do `ProcessosMapeadosManager` e `TelasSistemaManager`

### 3. Adicionar aba "Vídeos" no admin Business

Inserir aba "Vídeos" em `MentoriaBusinessPage.tsx` e `MentoriaBusinessIAplicadaPage.tsx`.

## Arquivos

- **Criar:** `src/components/admin/business/VideosInstrucaoManager.tsx`
- **Editar:** `src/pages/MeuSistemaEntregas.tsx` (ajustar Lens para usar iframe do Drive como conteúdo), `src/pages/admin/mentoria/MentoriaBusinessPage.tsx`, `src/pages/admin/mentoria/MentoriaBusinessIAplicadaPage.tsx`

