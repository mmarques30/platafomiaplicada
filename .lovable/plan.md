
## Padronizar Sub-abas do Projeto Skills com Design Pill

### Objetivo
Aplicar o design de botoes pill (arredondado, fundo bege claro, ativo em preto) consistentemente em todas as sub-abas internas do ambiente Skills, conforme o padrao visual da imagem de referencia.

### Abordagem

Criar uma classe CSS utilitaria reutilizavel para o estilo pill e aplica-la em todos os locais que usam `TabsList` / `TabsTrigger` dentro do ambiente Skills.

### Arquivos a modificar

**1. `src/index.css`** -- Adicionar classes utilitarias

Criar classes `.skills-tabs-list` e `.skills-tabs-trigger` com o design pill:
- Container: `rounded-full`, `bg-[#F5F5DC]`, `p-1`, `inline-flex`, `gap-0.5`
- Trigger inativo: `rounded-full`, `text-muted-foreground`, `px-4 py-1.5`, `text-sm`
- Trigger ativo: `bg-[#0D0D0D]`, `text-white`, `rounded-full`, `shadow-sm`

**2. `src/pages/skills/ProjetoSkillsProjetosPage.tsx`** -- Projetos (Acompanhamento / Backlog)

Aplicar as classes no `TabsList` e `TabsTrigger` existentes (linhas 68-71).

**3. `src/pages/skills/SkillsEntregas.tsx`** -- Entregas (Pendentes / Aguardando / Aprovadas)

Aplicar as classes no `TabsList` e `TabsTrigger` existentes (linhas 92-103).

**4. `src/components/skills/diagnostico/DiagnosticoResults.tsx`** -- Diagnostico (Minha Analise / Analise da Equipe)

Aplicar as classes no `TabsList` e `TabsTrigger` existentes (linhas 61-63).

### Detalhes Tecnicos

As classes CSS serao definidas uma unica vez em `index.css`:

```css
.skills-tabs-list {
  @apply inline-flex items-center gap-0.5 rounded-full bg-[#F5F5DC] p-1;
}
.skills-tabs-trigger {
  @apply rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all;
}
.skills-tabs-trigger[data-state="active"] {
  @apply bg-[#0D0D0D] text-white shadow-sm;
}
```

Cada pagina tera o `TabsList` e `TabsTrigger` atualizados para usar essas classes, substituindo os estilos default do shadcn/ui.
