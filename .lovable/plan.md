

# Nova sub-aba "Entregas" em Meu Projeto

## Visão geral

Criar a página `/meu-sistema/entregas` como sub-aba entre "Sistema" e "Documentos" no menu lateral. A página terá 3 seções: Processos Mapeados (SOPs), Telas do Sistema (carrossel com preview), e Vídeos de Instrução (preview com lens effect).

## 1. Novas tabelas no banco de dados

### `processos_mapeados_business`
Armazena links/documentos de processos e SOPs do projeto.
- `id`, `contrato_id` (FK contratos_business), `titulo`, `descricao`, `tipo` (link/documento), `url`, `arquivo_path` (storage), `ordem`, `created_at`

### `telas_sistema_business`
Armazena as telas/screenshots do sistema com descrição e link.
- `id`, `contrato_id` (FK contratos_business), `titulo`, `descricao`, `screenshot_url` (imagem de preview), `link_sistema` (URL para acessar a tela), `ordem`, `created_at`

### `videos_instrucao_business`
Armazena vídeos de instrução hospedados no Google Drive.
- `id`, `contrato_id` (FK contratos_business), `titulo`, `descricao`, `video_url` (link Google Drive), `thumbnail_url` (capa do vídeo), `ordem`, `created_at`

RLS: leitura para o dono do contrato (user_id via join) e admins. Escrita apenas para admins.

## 2. Menu lateral - Adicionar "Entregas"

Inserir novo registro em `menu_config` com `menu_key: 'meu_sistema_entregas'`, `parent_key: 'meu_sistema'`, `url: '/meu-sistema/entregas'`, `ordem: 1.5` (entre Sistema e Documentos).

## 3. Nova página `src/pages/MeuSistemaEntregas.tsx`

Layout com 3 seções:

### Processos Mapeados
- Lista de cards com título, descrição e botão para abrir link/baixar documento
- Ícone de tipo (link externo vs documento)

### Telas do Sistema
- Carrossel horizontal (Embla Carousel, já instalado) com cards mostrando screenshot
- Ao clicar em uma tela, abre um Dialog com descrição completa e botão "Acessar Sistema" (link)
- Inspirado no carousel-card do 21st.dev: cards com imagem + hover effect

### Vídeos de Instrução  
- Grid de cards com thumbnail/capa do vídeo
- Efeito lens (zoom on hover) usando framer-motion (já instalado) — ao passar o mouse, amplia a área sob o cursor
- Ao clicar, abre Dialog com iframe do Google Drive (usando `getGoogleDriveEmbedUrl` existente)

## 4. Rota no App.tsx

Adicionar: `<Route path="/meu-sistema/entregas" element={<MeuSistemaEntregas />} />`

## 5. Hook `useEntregasBusinessView.tsx`

Hook para buscar processos, telas e vídeos de instrução pelo `contrato_id`.

## 6. Componente Lens

Componente `src/components/ui/lens.tsx` inspirado no Aceternity Lens: div com efeito de zoom magnético via framer-motion, usado como wrapper dos thumbnails de vídeo.

## Arquivos

- **Criar:** `src/pages/MeuSistemaEntregas.tsx`, `src/hooks/useEntregasBusinessView.tsx`, `src/components/ui/lens.tsx`
- **Editar:** `src/App.tsx` (nova rota)
- **Migração:** 3 tabelas + RLS + insert menu_config

