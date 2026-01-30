

# Plano: Simplificar Página de Serviços

## Problema
A implementação atual adicionou elementos extras que não estavam no design de referência:
- Hero section no topo (desnecessário)
- Ícones decorativos (Sparkles, Zap, Building2)
- Tags/badges verdes com destaques
- Cards elaborados com bordas e backgrounds
- Footer CTA section
- Textos com spans coloridos

## Solução
Simplificar a página para seguir exatamente o layout de referência do componente `text-parallax-content-scroll`.

## Mudanças

### 1. Simplificar `src/pages/Servicos.tsx`

**Remover:**
- Hero section do topo
- Importações de ícones (Sparkles, Zap, Building2, ArrowRight)
- Importação do motion (não será mais usado na página)
- Footer CTA section
- Cards elaborados com bordas e ícones
- Tags/badges

**Manter:**
- AuthHeader
- 3 seções TextParallaxContent com os textos corretos
- Layout simples seguindo o exemplo de referência

### 2. Conteúdo Simplificado de Cada Seção

Cada seção terá apenas:
- Título pequeno (h2 ou similar)
- Parágrafo com descrição
- Link "Saiba mais" simples com seta

**Academy:**
- Título: "IAplicada Academy"
- Descrição completa conforme especificado
- Link: "Saiba mais"

**Skills:**
- Título: "IAplicada Skills"  
- Descrição completa conforme especificado
- Link: "Saiba mais"

**Business:**
- Título: "IAplicada Business"
- Descrição completa conforme especificado
- Link: "Saiba mais"

## Arquivos a Modificar

1. **`src/pages/Servicos.tsx`** - Reescrever para ficar simples como o exemplo de referência

O componente `text-parallax-content.tsx` já está correto e não precisa de alterações.

