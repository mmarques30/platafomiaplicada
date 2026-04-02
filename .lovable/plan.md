

# Saudação e tagline adaptativos no WelcomeHeader

## Alteração

**Arquivo**: `src/components/dashboard/WelcomeHeader.tsx`

1. Após `primeiroNome` (linha 58), calcular `diasSemAcesso` via localStorage e `temEntregaUrgente` a partir do `kpi2Raw` já computado (tarefas críticas business) — reposicionar o cálculo da saudação para após os KPIs
2. Substituir a saudação estática (linha 61) pela lógica contextual:
   - `temEntregaUrgente` → `"Atenção, {nome}"`
   - `diasSemAcesso >= 4` → `"Que bom te ver de volta, {nome}"`
   - default → `"Boa {período}, {nome}!"`
3. Criar variável `tagline` com a mesma lógica condicional
4. No JSX (linhas 202-213), substituir `{saudacao}, <span>{primeiroNome}</span>!` por `{saudacao}` (já inclui o nome) e substituir o bloco `aulaAtiva ? ... : "Aplique, replique e domine IA"` por `aulaAtiva ? aula.tema : tagline`

### Detalhe técnico
- `diasSemAcesso` usa `localStorage.getItem(\`ultimo_acesso_\${user?.id}\`)` (já gravado pelo MarIAnaFloatingButton)
- `temEntregaUrgente` reutiliza `kpi2Raw > 0` (tarefas críticas já calculadas nos KPIs business), sem precisar de novo hook
- `periodo` reutiliza a variável `hora` já existente
- KPIs, data, estrutura e layout permanecem intactos

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/dashboard/WelcomeHeader.tsx` | Editar — saudação e tagline contextuais |

