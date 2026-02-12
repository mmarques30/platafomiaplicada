

# Corrigir Exibicao dos Dados de IA no Diagnostico Consolidado

## Problemas Identificados

### 1. "Dores Comuns da Equipe" mostra JSON bruto
Os objetos de dor possuem a estrutura `{dor, impacto, membros_afetados}`, mas o codigo procura por `dor.descricao` ou `dor.nome` (que nao existem), caindo no fallback `JSON.stringify(dor)`.

### 2. "Insights da IA" mostra Markdown como texto puro
O campo `insights_ia` contem texto em Markdown (com `#`, `##`, `**bold**`, listas), mas e renderizado dentro de uma tag `<p>` simples, sem interpretacao do Markdown.

## Solucao

### Arquivo: `src/components/skills/diagnostico/EquipeConsolidadoView.tsx`

**Correcao 1 — Dores Comuns (linha 88):**
Alterar o fallback para reconhecer o campo `dor.dor` e exibir tambem `dor.impacto` e `dor.membros_afetados` de forma formatada:

```typescript
// ANTES:
{typeof dor === "string" ? dor : dor.descricao || dor.nome || JSON.stringify(dor)}

// DEPOIS:
{typeof dor === "string" ? dor : (
  <div>
    <span className="font-medium">{dor.dor || dor.descricao || dor.nome}</span>
    {dor.impacto && <p className="text-xs text-muted-foreground mt-0.5">{dor.impacto}</p>}
    {dor.membros_afetados && (
      <span className="text-xs text-muted-foreground">{dor.membros_afetados} membro(s) afetado(s)</span>
    )}
  </div>
)}
```

**Correcao 2 — Insights da IA (linhas 186-188):**
Substituir o `<p>` por `ReactMarkdown` com `remark-gfm` para renderizar titulos, listas e negrito corretamente:

```typescript
// ANTES:
<p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
  {consolidado.insights_ia}
</p>

// DEPOIS:
<ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm max-w-none dark:prose-invert">
  {consolidado.insights_ia}
</ReactMarkdown>
```

Adicionar os imports de `ReactMarkdown` e `remarkGfm` no topo do arquivo.

### Arquivo: `src/pages/skills/SkillsEquipe.tsx` (mesmo problema duplicado)

A pagina `SkillsEquipe.tsx` tambem renderiza `consolidado.insights_ia` como texto puro na linha 152. Aplicar a mesma correcao com ReactMarkdown.

## Arquivos modificados:
- `src/components/skills/diagnostico/EquipeConsolidadoView.tsx` — corrigir dores + insights markdown
- `src/pages/skills/SkillsEquipe.tsx` — corrigir insights markdown

## Resultado
- "Dores Comuns" exibira nome da dor em negrito, impacto abaixo e quantidade de membros afetados
- "Insights da IA" renderizara titulos, listas e formatacao Markdown corretamente

