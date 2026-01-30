

# Plano: Seção "Sobre" com Carrossel de Logos

## Resumo

Adicionar uma seção "Sobre" na página Aplique.tsx seguindo o estilo do about-section-1, porém com as logos das empresas parceiras exibidas em formato de **carrossel infinito** (ticker animado) em vez de grid estático.

## Estrutura Visual

```text
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                         SOBRE                               │
│                    (label em verde)                         │
│                                                             │
│                      IAplicada                              │
│               (título grande, destaque)                     │
│                                                             │
│   A IAplicada nasceu da experiência prática em operações    │
│   complexas de empresas como Mercado Livre, Suzano e        │
│   AngloGold Ashanti. Depois de anos lidando com rotinas,    │
│   indicadores e gargalos em negócios líderes em e-commerce, │
│   indústria e mineração, transformamos o que funciona lá    │
│   fora em uma plataforma acessível para a sua empresa.      │
│                                                             │
│              [Conheça nossos serviços →]                    │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│      Empresas que já fazem parte da IAplicada:              │
│                                                             │
│  ← [Nubank] [Raízen] [Unimed] [Itaú] [Klabin] [Coca-Cola] → │
│     [USP] [Vivo] [iFood] [Mercado Livre] (loop infinito)    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Arquivos a Criar/Modificar

### 1. Salvar logos na pasta `public/logos/partners/`

Copiar as 10 logos fornecidas:
- nubank-logo.png
- raizen-logo.png
- unimed-logo.png
- itau-logo.png
- klabin-logo.png
- coca-cola-logo.png
- usp-logo.png
- vivo-logo.png
- ifood-logo.png
- mercado-livre-logo.png

### 2. Criar `src/components/ui/about-section.tsx`

Componente com:
- Label "SOBRE" em verde (#9EB038)
- Título "IAplicada" grande e destacado
- Parágrafo descritivo centralizado
- Botão CTA "Conheça nossos serviços"
- Subtítulo "Empresas que já fazem parte da IAplicada:"
- **Carrossel infinito de logos** usando Framer Motion (similar ao LogosTicker existente)

### 3. Modificar `src/pages/Aplique.tsx`

Adicionar a seção AboutSection após o Hero e antes do LogosTicker existente (ou substituir o LogosTicker pelo novo carrossel de parceiros).

## Detalhes Técnicos

### Carrossel de Logos (PartnersLogosTicker)

Baseado no componente `LogosTicker` já existente:

```text
Configuração:
- Array com as 10 logos parceiras
- Triplicar array para loop infinito suave
- Animação: translateX de 0 até -(n * largura)
- Transição: duration 25-30s, repeat Infinity, ease linear
- Logos com filtro grayscale (ou coloridas, conforme preferência)
- Suporte a tema claro/escuro
```

### Cores e Estilo

- Label "SOBRE": text-[#9EB038] uppercase tracking-wide
- Título: text-4xl md:text-5xl font-bold text-foreground
- Descrição: text-lg text-muted-foreground max-w-3xl mx-auto
- Botão: bg-[#C5D63D] hover:bg-[#B5C62D] text-zinc-900
- Fundo seção: bg-background ou bg-muted/30 para destaque sutil

### Responsividade

- Desktop: Carrossel com 6-7 logos visíveis
- Tablet: Carrossel com 4-5 logos visíveis
- Mobile: Carrossel com 2-3 logos visíveis
- Velocidade do carrossel ajustada para cada breakpoint

## Resultado Final

A seção "Sobre" terá um visual clean e profissional, com as logos das empresas parceiras passando continuamente em loop, transmitindo credibilidade e mostrando a experiência da IAplicada com grandes empresas.

