
# Plano: Página de Serviços com Efeito Parallax

## Resumo

Criar uma nova página `/servicos` que apresenta os produtos da IAplicada (Academy, Skills e Business) usando um efeito de scroll parallax imersivo. Cada produto terá sua própria seção com imagem sticky, texto animado que aparece conforme o usuário faz scroll, e descrição detalhada.

## Estrutura das Seções

A página terá 3 seções principais com o conteúdo especificado:

### Seção 1 - IAplicada Academy
- **Subtítulo**: Academy
- **Título**: A escola que transforma sua carreira.
- **Descrição**: "A escola que transforma sua carreira e decola ela em 90 dias: APLICA+ e ferramentas IA testadas pra você produzir 2-3x mais, sem programação, sem tentativa e erro, atualizado todo mês com as novas IAs."

### Seção 2 - IAplicada Skills
- **Subtítulo**: Skills
- **Título**: Elimine 10-20h/semana de tarefas manuais.
- **Descrição**: "A solução que elimina especificamente 10-20h/semana de tarefas manuais de equipes operacionais de 3-15 pessoas em empresas em crescimento, trocando planilhas + processos repetitivos por automações práticas que rodam no dia a dia, em 12 semanas, sem exigir conhecimento técnico ou consultoria cara."

### Seção 3 - IAplicada Business
- **Subtítulo**: Business
- **Título**: A única solução que organiza sua operação.
- **Descrição**: "É a única solução que organiza especificamente a operação, trocando o caos de planilhas + WhatsApp + sistemas desconectados por uma plataforma centralizada que automatiza tarefas e dá visibilidade total, em 30 dias, sem enrolação, sem soluções engessadas, sem dev."

## Design Visual

O efeito parallax funcionará assim:
1. Uma imagem de fundo fica "sticky" (fixa) enquanto o usuário faz scroll
2. A imagem escala sutilmente e faz fade out conforme o progresso do scroll
3. Texto com subheading e heading anima para dentro da tela
4. Ao continuar scrollando, o texto sai e aparece um card com mais detalhes

## Arquivos a Criar/Modificar

1. **Novo arquivo**: `src/components/ui/text-parallax-content.tsx`
   - Componente reutilizável de parallax scroll
   - Usa Framer Motion (`useScroll`, `useTransform`)
   - Sub-componentes: StickyImage, OverlayCopy, ExampleContent

2. **Novo arquivo**: `src/pages/Servicos.tsx`
   - Página principal com as 3 seções de produtos
   - Usa o componente TextParallaxContent
   - Header com navegação similar à Auth page

3. **Modificar**: `src/App.tsx`
   - Adicionar rota `/servicos`

4. **Modificar**: `src/components/auth/AuthHeader.tsx`
   - Atualizar link "Serviços" para apontar para `/servicos`

## Detalhes Técnicos

### Componente TextParallaxContent

```text
┌──────────────────────────────────────────────────────────┐
│                    StickyImage                            │
│   ┌─────────────────────────────────────────────────┐    │
│   │  Imagem de fundo sticky                          │    │
│   │  (escala + opacity animados via scroll)          │    │
│   │                                                  │    │
│   │         ┌────────────────────┐                   │    │
│   │         │  OverlayCopy       │                   │    │
│   │         │  - Subheading      │                   │    │
│   │         │  - Heading         │                   │    │
│   │         └────────────────────┘                   │    │
│   │                                                  │    │
│   └─────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│                 ExampleContent                            │
│   Descrição detalhada do produto + CTA                   │
└──────────────────────────────────────────────────────────┘
```

### Animações (via Framer Motion)
- **StickyImage**: 
  - `scale`: transforma de 1 para 0.85 conforme scroll
  - `opacity`: transforma de 1 para 0 conforme scroll
- **OverlayCopy**:
  - `y`: texto desliza verticalmente
  - `opacity`: fade in/out baseado na posição do scroll

### Imagens
Usar imagens representativas para cada produto (podem ser placeholders ou as imagens já cadastradas no banco de dados dos produtos).

## Cores e Estilo

Seguir a paleta existente do projeto:
- Background escuro: `#2a2c28` ou similar
- Verde marca: `#9EB038` / `#C5D63D`
- Texto branco com variações de opacidade

## Responsividade

- Desktop: Efeito parallax completo
- Mobile: Versão simplificada com animações mais sutis para performance
