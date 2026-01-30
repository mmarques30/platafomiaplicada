

# Plano: Redesign da Página Sobre com Vídeo

## Resumo

Redesenhar a página "Sobre" seguindo o layout de referência do PrebuiltUI (imagem/vídeo à esquerda, conteúdo à direita), com as cores da marca IAplicada e integrando o vídeo fornecido.

## Importante sobre o Vídeo do Google Drive

O link do Google Drive não pode ser usado diretamente em um player de vídeo HTML porque:
- Links do Drive são para download/visualização no próprio Drive
- Não fornecem um stream de vídeo compatível com `<video>` ou `react-player`

**Soluções disponíveis:**

1. **Fazer download do vídeo e hospedar na pasta `public/`** - Recomendado para melhor performance
2. **Usar serviço como YouTube/Vimeo** - Se o vídeo já estiver hospedado lá
3. **Usar Storage do Lovable Cloud** - Para hospedar o arquivo de vídeo

Para prosseguir, vou preparar o layout com um placeholder de vídeo e você pode fazer o upload do arquivo de vídeo para a pasta `public/` do projeto.

## Layout Visual Proposto

```text
┌──────────────────────────────────────────────────────────────┐
│  [← Voltar]                                        (escuro)  │
│                                                              │
│  ┌─────────────────────┐    ┌─────────────────────────────┐  │
│  │                     │    │  [Logo IAplicada]           │  │
│  │                     │    │                             │  │
│  │       [VÍDEO]       │    │  IAPLICADA                  │  │
│  │         ▶           │    │  ─────────                  │  │
│  │   (aspect-video)    │    │                             │  │
│  │                     │    │  Descrição...               │  │
│  │                     │    │                             │  │
│  └─────────────────────┘    │  [Conheça a IAplicada →]    │  │
│                              └─────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Mudanças Planejadas

### 1. Atualizar `src/pages/Sobre.tsx`

- Background escuro: `bg-[#1a1c19]` (igual à página Serviços)
- Ajustar botão "Voltar" para tema escuro (`text-white`)

### 2. Redesenhar `src/components/ui/about-section.tsx`

**Remover:**
- Carrossel de logos (`PartnersLogosTicker`)
- Constantes `partnerLogos` e `triplicatedLogos`
- Seção full-bleed do carrossel

**Novo Layout:**
- Layout flexbox: coluna no mobile, linha no desktop (`flex-col lg:flex-row`)
- Background escuro consistente

**Lado Esquerdo - Container de Vídeo:**
- Proporção 16:9 (`aspect-video`) para evitar bordas pretas
- Cantos arredondados (`rounded-2xl`)
- Sombra verde da marca (`shadow-[#9EB038]/40`)
- Player de vídeo com `react-player` (já instalado no projeto)
- Fallback: imagem com botão de play centralizado

**Lado Direito - Conteúdo:**
- Logo IAplicada (mantido)
- Título "IAplicada" com "IA" em verde
- Barra de destaque verde (gradient)
- Descrição (mantida)
- Botão CTA verde

## Cores e Estilos (Consistentes com Serviços)

| Elemento | Valor |
|----------|-------|
| Background página | `#1a1c19` |
| Sombra do vídeo | `shadow-[#9EB038]/40` |
| Barra de destaque | `bg-gradient-to-r from-[#9EB038] to-[#9EB038]/30` |
| Título "IA" | `text-[#9EB038]` |
| Título resto | `text-white` |
| Descrição | `text-neutral-400` |
| Botão CTA | `bg-gradient-to-r from-[#9EB038] to-[#7A8A2A]` |

## Sobre o Aspect Ratio do Vídeo

Para evitar bordas pretas:
- O container usará `aspect-video` (16:9)
- O vídeo terá `object-cover` para preencher todo o espaço
- Se o vídeo original tiver proporção diferente, ele será cortado para caber

Se o vídeo original for quadrado ou vertical, posso ajustar o container para `aspect-square` ou `aspect-[4/5]` conforme necessário.

## Arquivos Afetados

1. `src/pages/Sobre.tsx` - Background escuro e botão claro
2. `src/components/ui/about-section.tsx` - Redesign completo

## Próximos Passos após Implementação

1. Fazer upload do arquivo de vídeo (MP4) para `public/videos/`
2. Atualizar o caminho do vídeo no componente

