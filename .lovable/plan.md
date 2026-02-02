
# Novo Design dos Cards de Seleção de Ambiente

## Objetivo
Modernizar a tela de seleção de ambientes com um design mais visual e clean, usando imagens nos cards em vez de ícones, com títulos posicionados abaixo dos cards.

## Design Proposto

### Estrutura Visual
- **Card**: Imagem quadrada ocupando todo o espaço, sem textos internos
- **Título**: Posicionado abaixo do card, centralizado
- **Descrição**: Removida ou mostrada apenas no hover para manter o visual limpo
- **Efeito hover**: Glow sutil + "Acessar" aparece

### Mudanças de Layout

**Antes:**
```text
┌─────────────────────┐
│     ┌───────┐       │
│     │ Ícone │       │
│     └───────┘       │
│      Título         │
│    Descrição...     │
│     [Acessar]       │
└─────────────────────┘
```

**Depois:**
```text
┌─────────────────────┐
│                     │
│      [Imagem]       │
│                     │
└─────────────────────┘
       Título
```

## Alterações Técnicas

### 1. Adicionar Imagem ao Projeto
- Copiar `user-uploads://icon_business_clean.jpg` para `src/assets/env-business.jpg`
- Para os outros ambientes, usarei ícones Lucide estilizados até que imagens sejam fornecidas

### 2. Modificar `src/pages/EnvironmentSelector.tsx`

**Alterações no card:**
- Remover descrição e CTA de dentro do card
- Card mostra apenas a imagem (para Business) ou ícone estilizado (outros)
- Título movido para fora do card, abaixo dele
- Descrição aparece no hover (tooltip ou fade-in)

**Novo mapeamento de assets:**
```tsx
const ENVIRONMENT_IMAGES: Partial<Record<Environment, string>> = {
  business: envBusinessImage, // Imagem fornecida
};
```

**Nova estrutura do card:**
```tsx
<motion.button className="flex flex-col items-center gap-3">
  {/* Card com imagem/ícone */}
  <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden">
    {ENVIRONMENT_IMAGES[env] ? (
      <img src={ENVIRONMENT_IMAGES[env]} className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-white/5">
        <Icon className="h-10 w-10" style={{ color: config.color }} />
      </div>
    )}
  </div>
  
  {/* Título abaixo */}
  <span className="text-white font-medium">{config.label}</span>
</motion.button>
```

### 3. Ajustes de Espaçamento
- Grid com `gap-8` para dar mais respiro entre cards
- Cards com tamanho fixo para consistência
- Descrição visível apenas no hover via tooltip ou opacity transition

## Resultado Esperado
- Visual mais clean e moderno
- Cards com aparência de "app icons"
- Business com a imagem premium fornecida
- Outros ambientes mantêm ícones até receberem imagens próprias
- Experiência mais visual e menos textual
