

# Ajustar Telas do Sistema — Carousel Card + Admin Manager

## 1. Melhorar o carrossel de Telas (client view)

Refatorar a seção "Telas do Sistema" em `MeuSistemaEntregas.tsx` para um estilo inspirado no carousel-card do 21st.dev:

- Cards maiores com imagem screenshot em destaque (aspect-video, rounded, shadow)
- Hover com scale sutil + elevação (framer-motion `whileHover`)
- Overlay sutil com título sobre a imagem na parte inferior (gradiente escuro)
- Navegação com botões prev/next nas laterais do carrossel (setas Embla)
- Ao clicar no card, abre Dialog com:
  - Screenshot em tamanho maior
  - Título e descrição completa
  - Botão "Acessar Sistema" com link externo (se houver `link_sistema`)

A implementação atual já tem o Dialog e o Embla. As mudanças são visuais: cards com overlay de título, setas de navegação, e estilo mais polido.

## 2. Criar admin manager `TelasSistemaManager.tsx`

Componente CRUD em `src/components/admin/business/TelasSistemaManager.tsx` para o admin gerenciar telas de cada contrato Business:

- Listar telas com thumbnail, título e descrição
- Modal para criar/editar: título, descrição, screenshot (upload para bucket `contratos-business`), link do sistema (URL)
- Reordenação por setas up/down
- Excluir com confirmação
- Seguir padrão visual do `ProcessosMapeadosManager`

## 3. Adicionar aba "Telas" no admin Business

Inserir aba "Telas" em `MentoriaBusinessPage.tsx` e `MentoriaBusinessIAplicadaPage.tsx`, renderizando o `TelasSistemaManager`.

## Arquivos

- **Criar:** `src/components/admin/business/TelasSistemaManager.tsx`
- **Editar:** `src/pages/MeuSistemaEntregas.tsx` (refatorar carrossel), `src/pages/admin/mentoria/MentoriaBusinessPage.tsx`, `src/pages/admin/mentoria/MentoriaBusinessIAplicadaPage.tsx`

