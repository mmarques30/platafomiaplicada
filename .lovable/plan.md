

# Adicionar setas de carrossel em Telas do Sistema e Vídeos de Instrução

## Problemas

1. **Telas do Sistema**: As setas só aparecem quando `telas.length > 1` (line 173). No empty state, não há setas.
2. **Vídeos de Instrução**: Não tem carrossel implementado — usa grid estático. Precisa de um segundo Embla carousel com suas próprias setas.

## Solução

### 1. Telas do Sistema — Setas sempre visíveis
- Remover a condição `telas.length > 1` das setas (line 173)
- Mostrar setas sempre (mesmo no empty state, em `opacity-50`)

### 2. Vídeos de Instrução — Converter para carrossel com setas
- Criar um segundo Embla carousel (`emblaRefVideos`, `emblaApiVideos`)
- Adicionar setas ChevronLeft/ChevronRight no header da seção (igual a Telas)
- Converter o grid para layout horizontal com `flex gap-4` dentro do Embla container
- Cards com `flex-none w-[280px] md:w-[320px]`
- Aplicar mesmo padrão no empty state placeholder

### Arquivo
- **Editar:** `src/pages/MeuSistemaEntregas.tsx`
  - Adicionar segundo `useEmblaCarousel` + callbacks `scrollPrevVideos`/`scrollNextVideos`
  - Mover setas de Telas para fora do condicional
  - Refatorar seção Vídeos de grid para carrossel Embla com setas

