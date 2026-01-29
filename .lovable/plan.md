
# Ajuste de Layout do Diagnóstico Business

## Entendimento do Pedido

O usuário quer um tema visual específico para o formulário Business:

| Elemento | Cor Desejada |
|----------|--------------|
| Card principal (wrapper do formulário) | Fundo **preto** |
| Cards de info/respostas (inputs, textareas) | Fundo **cinza** |
| Perguntas e labels fora dos cards | Texto **branco** |
| Respostas dentro dos cards | Texto **preto** |

---

## Estrutura Atual

O formulário Business usa:
- `FormularioWizard.tsx` → Card wrapper principal
- `BusinessStep1Perfil.tsx` até `BusinessStep6Expectativas.tsx` → Conteúdo dos steps

Atualmente, o Card usa cores padrão do tema (card background/foreground).

---

## Arquivos a Modificar

### 1. `FormularioWizard.tsx`

Adicionar classe condicional para tema Business:

```tsx
// Linha 237 - Card principal
<Card className={cn(
  "w-full max-w-4xl mx-auto relative overflow-hidden",
  isBusiness && "bg-zinc-900 border-zinc-700"
)}>
  <CardContent className={cn("pt-6", isBusiness && "text-white")}>
```

### 2. Todos os Steps Business (6 arquivos)

Aplicar estilos consistentes para o tema Business Premium:

**Headers:**
```tsx
<div className="flex items-center gap-3 mb-6">
  <div className="p-2 rounded-lg bg-primary/10">
    <Icon className="h-5 w-5 text-primary" />
  </div>
  <div>
    <h3 className="text-lg font-semibold text-white">Título</h3>
    <p className="text-sm text-zinc-400">Subtítulo</p>
  </div>
</div>
```

**Inputs/Textareas (cards cinza com texto preto):**
```tsx
<Input 
  className="bg-zinc-200 text-zinc-900 border-zinc-300 placeholder:text-zinc-500"
  {...field} 
/>

<Textarea 
  className="bg-zinc-200 text-zinc-900 border-zinc-300 placeholder:text-zinc-500"
  {...field} 
/>
```

**Labels (texto branco):**
```tsx
<FormLabel className="text-white">Pergunta</FormLabel>
```

**Radio/Checkbox labels:**
```tsx
<label className="text-sm cursor-pointer text-zinc-200">
```

**Cards informativos:**
```tsx
<div className="p-4 rounded-lg bg-zinc-800 border border-zinc-700 mb-6">
  <p className="text-sm text-zinc-300">...</p>
</div>
```

---

## Resumo das Mudanças por Arquivo

| Arquivo | Mudança |
|---------|---------|
| `FormularioWizard.tsx` | Card wrapper preto quando `isBusiness` |
| `BusinessStep1Perfil.tsx` | Labels brancos, inputs cinza |
| `BusinessStep2Construir.tsx` | Labels brancos, textareas cinza |
| `BusinessStep3Contexto.tsx` | Labels brancos, inputs/radios cinza |
| `BusinessStep4Acompanhamento.tsx` | Labels brancos, radios cinza |
| `BusinessStep5Aprendizado.tsx` | Labels brancos, checkboxes cinza |
| `BusinessStep6Expectativas.tsx` | Labels brancos, inputs/slider cinza |

---

## Resultado Visual Esperado

```text
┌─────────────────────────────────────────────────┐
│  [BUSINESS Badge]           [Cancelar]          │  ← Header
│─────────────────────────────────────────────────│
│  ▢▢▢▢▢▢ Progress Bar                            │
│─────────────────────────────────────────────────│
│                                                  │
│  [Icon] Título da Etapa (branco)                │
│         Subtítulo (cinza claro)                  │
│                                                  │
│  Pergunta 1? (texto branco)                      │
│  ┌────────────────────────────────────────────┐ │
│  │ Resposta do usuário (texto preto)          │ │  ← Card cinza
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Pergunta 2? (texto branco)                      │
│  ┌────────────────────────────────────────────┐ │
│  │ Resposta do usuário (texto preto)          │ │  ← Card cinza
│  └────────────────────────────────────────────┘ │
│                                                  │
│  [Anterior]              [Próximo]               │
│                                                  │
└─────────────────────────────────────────────────┘
        ↑ Fundo preto (bg-zinc-900)
```

---

## Cores Utilizadas

| Elemento | Classe Tailwind | Cor |
|----------|-----------------|-----|
| Card principal | `bg-zinc-900` | Preto |
| Inputs/Textareas | `bg-zinc-200` | Cinza claro |
| Texto inputs | `text-zinc-900` | Preto |
| Labels/Perguntas | `text-white` | Branco |
| Subtítulos | `text-zinc-400` | Cinza médio |
| Bordas | `border-zinc-700` | Cinza escuro |

