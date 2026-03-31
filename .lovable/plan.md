

# Varredura Completa — Estado Atual + Problemas Identificados

## 1. Arquitetura da Página Mentoria (`/mentoria`)

A página `/mentoria` é o hub central, renderizada diferentemente por plano:

```text
┌─────────────────────────────────────────────┐
│  MentoriaHeroDashboard (TODOS os planos)    │  ← "Olá, [nome]" + 4 KPIs
├─────────────────────────────────────────────┤
│  BusinessAcessoRapido (só Business)         │  ← Barra de atalhos escura
├─────────────────────────────────────────────┤
│  Tabs: [Visão Geral] [Roadmap] [Evolução*] │  ← *Evolução só Parceria
├─────────────────────────────────────────────┤
│  Conteúdo da aba ativa                      │
└─────────────────────────────────────────────┘
```

---

## 2. PROBLEMAS DE DUPLICIDADE IDENTIFICADOS

### 2.1 — Saudação duplicada (Hero + VisaoRapida)
- `MentoriaHeroDashboard` (linha 52): "Olá, {firstName}!" + KPIs (fase atual, tarefas, sessão, progresso)
- `BusinessVisaoRapida` (linha 91): "Olá, {nome} — Semana X da sua jornada" + badge status + progresso + grid 3 cards

**Resultado para Business Parceria**: O usuário vê dois headers de boas-vindas empilhados com informações sobrepostas (progresso, próxima sessão, tarefas). O Hero mostra dados Academy (fases_processo) que não se aplicam a Business.

### 2.2 — Acesso rápido duplicado (AcessoRapido + Sidebar Groups)
- `BusinessAcessoRapido`: barra preta com 7 ícones (Diagnóstico, Sessões, Etapas, Instruções, Entregas, Tasks, Documentos)
- Sidebar Business Groups: 3 grupos colapsáveis com exatamente os mesmos destinos (Etapas, Entregas, Tarefas, Tasks, Sessões, Documentos, etc.)

**Resultado**: Navegação redundante — mesmos links em 2 lugares diferentes na tela.

### 2.3 — Progresso de conteúdo duplicado entre abas
- Aba "Visão Geral": renderiza `BusinessProgressoConteudo` (vídeos, prompts, interações)
- Aba "Evolução Aprendizado": renderiza `BusinessProgressoConteudo` **novamente** + `BusinessEvolucaoAprendizado`

**Código em Mentoria.tsx:**
```
Visão Geral (linha 112):    <BusinessProgressoConteudo />
Evolução (linha 143):       <BusinessProgressoConteudo />  ← DUPLICADO
                            <BusinessEvolucaoAprendizado />
```

### 2.4 — Dados de próxima sessão em 3 lugares
- `MentoriaHeroDashboard`: "Próx. sessão em X dias" (KPI card)
- `BusinessVisaoRapida`: Card "Próxima Sessão" com data/hora + botão entrar
- `BusinessAcessoRapido`: Atalho para `/mentoria/sessoes`

### 2.5 — MentoriaHeroDashboard usa dados Academy para Business
O Hero usa `useFasesProcesso` (tabela `fases_processo` — Academy) e `useMentoriaTarefas` (tabela `tarefas_mentoria`) para todos os planos. Business Parceria usa `etapas_business`, `contratos_business`, `entregas_business` — tabelas diferentes. Os KPIs do Hero mostram dados incorretos ou zerados para Business.

---

## 3. PROBLEMAS DE LAYOUT E ALINHAMENTO

### 3.1 — Aba "Evolução Aprendizado" com estilo inconsistente
- `BusinessEvolucaoAprendizado`: Cards usam `bg-aplicada-green-100 border-aplicada-green-300` (fundo verde claro)
- `BusinessProgressoConteudo`: Cards usam `bg-gradient-to-br from-blue-500/5` (gradientes suaves)
- `BusinessVisaoRapida`: Cards usam `bg-card border-border` (padrão do sistema)

3 estilos diferentes de cards na mesma área. O green-100/300 do EvolucaoAprendizado é especialmente dissonante em dark mode.

### 3.2 — IAplicadaVisaoGeral é placeholder estático
Para Business Sistemas, a aba Visão Geral mostra `IAplicadaVisaoGeral` com 3 cards contendo apenas "-" e "Em breve". Sem dados reais conectados.

### 3.3 — BusinessExecutiveRoadmap sem dados reais
O Roadmap Business mostra fases do contrato (`fases_projeto`) que raramente são preenchidas. Quando vazias, mostra 4 fases de exemplo hardcoded com opacidade 60%.

---

## 4. SIDEBAR (804 linhas)

### Estrutura atual para Business:
```text
[Menus do menu_config (Início, Minha Trajetória, Aprender, etc.)]
  └─ Submenus via menu_config
[Bibliotecas] (hardcoded após Aprender)
[Business Groups] (hardcoded)
  ├─ MINHA JORNADA: Etapas, Roadmap, Instruções
  ├─ ENTREGAS E TAREFAS: Entregas, Tarefas, Tasks, Validações, Projetos
  └─ COMUNICAÇÃO: Sessões, Dúvidas, Documentos, Recursos, Reports
[Comunidade] (oculta para Business)
[Admin / Simulação]
```

**Problema**: Os Business Groups são hardcoded no componente (linhas 108-143) e coexistem com os menus dinâmicos do `menu_config`. Se a tabela `menu_config` também tiver entradas para "Entregas", "Sessões", etc. visíveis para Business, haverá itens duplicados no sidebar.

### Complexidade excessiva
804 linhas com: menus dinâmicos, submenus de 3 níveis, bibliotecas hardcoded, business groups hardcoded, comunidade hardcoded, admin, simulação — tudo num único componente.

---

## 5. RECOMENDAÇÕES PRIORIZADAS

| # | Problema | Impacto | Ação |
|---|----------|---------|------|
| 1 | Hero duplica VisaoRapida | Alto — confuso para Business | Ocultar `MentoriaHeroDashboard` para Business (já tem VisaoRapida) |
| 2 | AcessoRapido duplica Sidebar | Médio — redundância visual | Remover `BusinessAcessoRapido` (sidebar groups cumprem o mesmo papel) |
| 3 | ProgressoConteudo duplicado nas abas | Alto — mesmo componente 2x | Remover de "Visão Geral", manter só na "Evolução" |
| 4 | Estilos inconsistentes nos cards | Médio — visual desalinhado | Unificar para `bg-card border-border` (padrão do sistema) |
| 5 | Hero usa dados Academy para Business | Alto — KPIs errados | Condicionar queries do Hero ao plano ou substituir por VisaoRapida |
| 6 | IAplicadaVisaoGeral placeholder | Baixo — funcional mas vazio | Conectar dados reais do contrato/entregas Business Sistemas |
| 7 | Sidebar 804 linhas | Médio — manutenção difícil | Extrair BusinessSidebarGroups, BibliotecasMenu, ComunidadeMenu |

Quer que eu implemente essas correções?

