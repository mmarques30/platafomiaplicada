

# Adicionar KPIs ao rodapé do WelcomeHeader

## O que será feito

Mover a lógica de KPIs que hoje vive no `ContextStrip` para dentro do card do `WelcomeHeader`, renderizada abaixo de uma linha divisória. O `ContextStrip` separado será removido do Dashboard já que seus KPIs passam a viver no WelcomeHeader.

## Alterações

### 1. `src/components/dashboard/WelcomeHeader.tsx` — Editado

- Importar hooks adicionais: `useUserRole`, `useEffectivePlan`, `useBusinessUserId`, `useContratosBusiness`, `useEtapasBusiness`, `useTasksByUser`, `useMentoriaSessoes`, `useNavigate`, `useCountUp`
- Reutilizar a mesma lógica de KPIs do ContextStrip (Business/Academy/Skills) com as cores especificadas:
  - KPI 1: cor `#2CBBA6`
  - KPI 2: cor `#E8A43C`  
  - KPI 3: cor `#AFC040`
- Aplicar `useCountUp(valor, 600)` nos 3 valores numéricos
- Dentro do card existente (após linha 84, antes do `</div>` de fechamento do card na linha 85), adicionar:
  - Divider `border-t border-white/10` condicional `!isVisitante`
  - Row flex com 3 KPIs + botão CTA `#AFC040`
- Parte superior do card (saudação + data) permanece intacta

### 2. `src/pages/Dashboard.tsx` — Editado

- Remover import e uso de `<ContextStrip />` (tanto no bloco visitante quanto no autenticado)

### 3. `src/components/dashboard/ContextStrip.tsx` — Pode ser removido ou mantido sem uso

O arquivo deixa de ser importado. Pode ser deletado para limpeza.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/dashboard/WelcomeHeader.tsx` | Editado — adiciona KPIs no rodapé do card |
| `src/pages/Dashboard.tsx` | Editado — remove ContextStrip |

