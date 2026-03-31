

# Análise Detalhada do Sidebar — Estado Atual e Propostas

## O que o screenshot mostra (Business Parceria)

```text
┌────────────────────────────────┐
│ 🏠 Início                     │  ← menu_config (menu_key: 'inicio')
│ 📖 Aprender            ▾      │  ← menu_config (menu_key: 'aprender'), expansível
│ 📚 Bibliotecas          ▾      │  ← hardcoded no sidebar (linhas 430-543)
│ 📈 Meu Progresso        ▾      │  ← menu_config (menu_key: 'meu_progresso') — PROBLEMA
│ 🗺️ MINHA JORNADA        ▾      │  ← hardcoded Business Group (biz_jornada)
│ 📦 ENTREGAS E TAREFAS   ▾      │  ← hardcoded Business Group (biz_entregas)
│ 💬 COMUNICAÇÃO           ▾      │  ← hardcoded Business Group (biz_comunicacao)
│                                │
│ ADMINISTRAÇÃO                  │
│ 🛡️ Painel Admin                │
└────────────────────────────────┘
```

## Problemas Identificados

### 1. "Meu Progresso" ainda aparece para Business (GRAVE)
Apesar de termos adicionado `meu_progresso` ao `hiddenByEnvironment` de `business_parceria`, o screenshot mostra que ele ainda está visível. Causa provável: o `effectiveEnvironment` não está resolvendo para `business_parceria` corretamente (pode estar caindo no fallback `null` quando `currentEnvironment` não está setado), fazendo o filtro não atuar.

**Correção**: Na lógica de `effectiveEnvironment` (linha 64-96), adicionar fallback para `business_parceria` quando `effectivePlan === 'business_parceria'` — já existe para `business_sistemas` (linha 67) mas falta para parceria.

Linha 68, após o bloco `business_sistemas`, adicionar:
```typescript
if (effectivePlan === 'business_parceria') {
  return 'business_parceria';
}
```

### 2. Dois estilos visuais conflitantes no mesmo sidebar
- **Menus dinâmicos** (Início, Aprender, Bibliotecas, Meu Progresso): ícone 16px + texto 14px + barra lateral ativa preta + chevron no canto
- **Business Groups** (MINHA JORNADA, ENTREGAS, COMUNICAÇÃO): labels em UPPERCASE 10px tracking-widest + ícone 14px + sem barra lateral ativa

Isso cria uma hierarquia visual confusa — os Business Groups parecem section headers mas são clicáveis/expansíveis como menus.

### 3. Redundância "Aprender" para Business
O grupo "Aprender" (Trilhas, Calendário) já é filtrado pelo `hiddenByEnvironment` para Business, mas o parent "Aprender" pode aparecer vazio ou com apenas Calendário. Se tem 0-1 subitens, o grupo expansível é desnecessário.

### 4. "Comunidade" oculta para Business (`!isBusiness`)
Correto pela regra de negócio, mas Business Parceria perde acesso ao Feed. Verificar se isso é intencional.

## Propostas de Melhoria

### Proposta 1: Corrigir o bug de visibilidade (URGENTE)
Adicionar `business_parceria` ao fallback de `effectiveEnvironment` para que o `hiddenByEnvironment` funcione. Isso elimina "Meu Progresso" para Business Parceria.

### Proposta 2: Unificar estilo visual dos Business Groups
Mudar os Business Groups para usar o mesmo padrão visual dos menus dinâmicos:
- Ícone 16px + texto 14px (não uppercase 10px)
- Barra lateral preta no item ativo
- Labels em sentence case: "Minha Jornada", "Entregas e Tarefas", "Comunicação"

Isso elimina a dissonância visual entre as duas seções.

### Proposta 3: Simplificar "Aprender" para Business
Se "Aprender" para Business Parceria tem apenas "Calendário" como subitem visível, renderizá-lo como item direto (sem expansível) ou ocultá-lo e mover Calendário para "Minha Jornada".

### Proposta 4: Refatorar sidebar em componentes (futuro)
Extrair 3 componentes:
- `SidebarDynamicMenus` — menus do menu_config
- `SidebarBusinessGroups` — os 3 grupos hardcoded
- `SidebarStaticMenus` — Bibliotecas, Comunidade, Admin

Reduz as 807 linhas para ~200 no arquivo principal.

## Ordem de Implementação Sugerida

| Prioridade | Ação | Impacto |
|---|---|---|
| 1 | Corrigir effectiveEnvironment para business_parceria | Elimina "Meu Progresso" duplicado |
| 2 | Unificar estilo visual dos Business Groups | Consistência visual |
| 3 | Simplificar "Aprender" quando tem ≤1 subitem | UX mais limpa |
| 4 | Refatorar em componentes | Manutenibilidade (pode ser depois) |

## Arquivos afetados
- `src/components/layout/AppSidebar.tsx` — fix effectiveEnvironment + estilo Business Groups
- Nenhuma migração SQL necessária

