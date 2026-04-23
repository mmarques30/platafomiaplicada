

## Plano: Reformular seção "Resumo do Projeto"

Aplicar exatamente as mesmas alterações em `src/pages/MeuSistemaDocumentos.tsx` e `src/pages/MentoriaDocumentos.tsx`. Nenhum outro arquivo será tocado.

### 1. Card "Evolução das Entregas"

- Calcular `saudeProjeto` comparando `progresso.percentual` vs `cronograma.percentual`:
  - sem `cronograma` → badge cinza "Sem cronograma definido"
  - `progresso >= cronograma` → badge verde "No prazo"
  - `progresso >= cronograma - 15` → badge amarelo "Atenção"
  - caso contrário → badge vermelho "Atrasado"
- Mover "X dias restantes" para um badge destacado no topo do card (ao lado do título), usando `Clock` + `bg-muted`.
- Manter as duas barras de progresso (entregas + cronograma) abaixo.

### 2. Card "Atividade Recente"

- Reduzir o `slice` de 5 para 4 itens no `useMemo` de `atividadeRecente`.
- Trocar formato de data para `"dd/MM HH:mm"` via date-fns.
- Estado vazio mais amigável e contextual:
  - Ícone `Clock` cinza centralizado + "Nenhuma atividade ainda" + linha secundária "Adicione um arquivo, anotação ou link para começar."

### 3. Card "Insights do Projeto" → "Painel do Projeto"

Substituir o array `insights: string[]` (frases hardcoded) por um array tipado:

```ts
const insights: { label: string; valor: string; tipo: "info" | "warning" | "success" }[] = [];
```

Calcular dinamicamente:
- Completude das entregas (success/info/warning conforme `progresso.percentual`)
- Cronograma (`warning` se ≤30 dias, senão `info`)
- Total de documentos (`totalArquivos + totalNotas + totalLinks`)
- Aviso se `totalNotas === 0`
- Reports gerados (`success`) se `reports.length > 0`

Renderização: cada linha com
- Bolinha/ícone colorido à esquerda (`CheckCircle2` verde para success, `AlertCircle` amarelo para warning, `Info` azul para info)
- `label` em texto normal (text-foreground)
- `valor` em negrito alinhado à direita (`font-semibold text-foreground`)
- Layout: `flex items-center justify-between`, divisores sutis entre linhas

Renomear título do card para **"Painel do Projeto"** mantendo o ícone `Lightbulb`.

### Detalhes técnicos

- Imports adicionais por arquivo: `AlertCircle`, `Info` de `lucide-react`.
- Tipagem dos itens de `atividadeRecente` ganha campo opcional `data` já formatável (mantém `created_at` cru e formata na renderização).
- Cores dos insights via classes Tailwind:
  - success → `text-emerald-500`
  - warning → `text-amber-500`
  - info → `text-sky-500`
- Badge de saúde usa o componente existente `Badge` com `variant` + classes utilitárias (verde/vermelho/cinza/âmbar) para evitar criar variantes novas.
- Badge de "dias restantes" no topo: `<Badge variant="outline">` com ícone `Clock`.
- Toda lógica derivada (insights, saúde, totais) calculada antes do `return`, dentro do componente, usando os dados já disponíveis (`contrato`, `progresso`, `cronograma`, `documentos`, `notas`, `links`, `reports`).

### Resultado esperado

- Card 1 mostra imediatamente se o projeto está saudável, com prazo destacado.
- Card 2 lista 4 atividades recentes com data + hora e estado vazio amigável.
- Card 3 (renomeado para "Painel do Projeto") apresenta métricas reais com hierarquia visual clara (label à esquerda, valor à direita, ícone colorido por tipo).
- Sem mudanças em hooks, rotas ou outros arquivos.

