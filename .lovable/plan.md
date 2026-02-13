

# Correcao Definitiva das Cores dos Titulos no Painel Lider

## Problema

Os titulos "Impacto vs ROI" e "Ranking de Entregas por Colaborador" continuam invisiveis (cinza claro sobre fundo preto). A classe Tailwind `!text-white` esta sendo sobrescrita pela variavel CSS `text-card-foreground` definida no componente `Card` pai, que usa `@layer` com alta especificidade.

## Causa Raiz

O componente `Card` aplica `text-card-foreground` no elemento wrapper. Em modo claro, essa variavel resolve para uma cor escura, mas o `tailwind-merge` dentro de `cn()` pode estar removendo ou conflitando com `!text-white`. Mesmo com `!important`, a cascata CSS com variaveis customizadas do tema pode prevalecer.

## Solucao Definitiva

Usar `style={{ color: "#FFFFFF" }}` inline nos `CardTitle` e `style={{ color: "rgba(255,255,255,0.5)" }}` nos `CardDescription` dentro dos headers escuros. Inline styles tem a maior especificidade CSS possivel e nao podem ser sobrescritos por classes.

### Arquivos a modificar:

1. **`src/components/skills/performance/MemberDonutCharts.tsx`** (linhas 125, 126, 140, 141)
   - CardTitle: adicionar `style={{ color: "#FFFFFF" }}`
   - CardDescription: adicionar `style={{ color: "rgba(255,255,255,0.5)" }}`

2. **`src/components/skills/ProjetoSkillsPerformance.tsx`** (linhas 155, 156)
   - CardTitle do Ranking: adicionar `style={{ color: "#FFFFFF" }}`
   - CardDescription do Ranking: adicionar `style={{ color: "rgba(255,255,255,0.5)" }}`

### Exemplo da mudanca:

Antes:
```tsx
<CardTitle className="!text-white">Impacto vs ROI</CardTitle>
<CardDescription className="!text-white/50">Efetividade por membro</CardDescription>
```

Depois:
```tsx
<CardTitle style={{ color: "#FFFFFF" }}>Impacto vs ROI</CardTitle>
<CardDescription style={{ color: "rgba(255,255,255,0.5)" }}>Efetividade por membro</CardDescription>
```

Isso garante que nenhuma classe CSS, variavel de tema ou cascata possa sobrescrever a cor branca dos titulos sobre fundo escuro.
