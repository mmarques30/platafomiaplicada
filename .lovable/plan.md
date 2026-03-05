

# Remover abas Instruções e Tasks do Business Sistemas

## Resumo
Remover as abas "Instruções" e "Tasks" do painel admin Business iAplicada e da visão do mentorado Business Sistemas, mantendo-as nos demais planos (Business Parceria, Academy).

## Alterações

### 1. Admin — `MentoriaBusinessIAplicadaPage.tsx`
- Remover os dois `TabsTrigger` (Instruções e Tasks) — linhas 193-200
- Remover os dois `TabsContent` correspondentes — linhas 352-387
- Remover imports não utilizados: `InstrucoesBusinessManager`, `TasksBusinessManager`, `ListChecks`, `ClipboardCheck`

### 2. Mentee — `BusinessAcessoRapido.tsx`
- Esse componente é usado por todos os Business (Parceria e Sistemas)
- Torná-lo ciente do plano: receber prop ou usar `useEffectivePlan` para filtrar os itens "Instruções" e "Tasks" quando o usuário for `business_sistemas`
- Alternativa mais simples: usar o hook `useEffectivePlan` internamente e filtrar os itens

### 3. Mentee — Rotas em `App.tsx`
- As rotas `/mentoria/instrucoes-business` e `/mentoria/tasks-business` devem ser mantidas (servem Business Parceria)
- A filtragem ocorre apenas na navegação (BusinessAcessoRapido), não nas rotas

### Impacto na geração com IA
- Nenhum impacto — a geração de entregas/etapas/instruções/tasks pela IA (edge function `gerar-entregas-business`) continua funcionando normalmente no backend
- Os dados gerados ficam no banco; apenas a interface admin e mentee de Business Sistemas não exibirá essas abas

### Arquivos alterados
1. `src/pages/admin/mentoria/MentoriaBusinessIAplicadaPage.tsx` — remover tabs e imports
2. `src/components/mentoria/business/BusinessAcessoRapido.tsx` — filtrar itens por plano

