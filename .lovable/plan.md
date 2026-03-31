

# Varredura Completa — Plataforma IAplicada

## 1. Visão Geral da Arquitetura

```text
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND (React 18 + Vite 5)          │
│  Tailwind CSS v3 · TypeScript 5 · Sora font             │
│  React Query · Framer Motion · Recharts · shadcn/ui      │
├──────────────────────────────────────────────────────────┤
│                    BACKEND (Lovable Cloud)                │
│  Supabase: Auth · RLS · Triggers · Storage · Realtime    │
│  40+ Edge Functions (AI, parsing, reports)                │
│  21 Storage Buckets                                      │
└──────────────────────────────────────────────────────────┘
```

**Stack**: React 18, Vite 5, Tailwind v3, shadcn/ui, React Query, Framer Motion, Recharts, react-router-dom v6, next-themes (dark/light), react-markdown, date-fns (pt-BR).

**Fonte**: Sora (system-ui fallback). Cores: brand green `#9EB038` (HSL 73 55% 47%) como primary em ambos os modos.

---

## 2. Ambientes e Planos

A plataforma suporta **5 ambientes** via `EnvironmentContext` + `useEffectivePlan`:

| Ambiente | Plano DB | Descrição |
|----------|----------|-----------|
| Gratuito | `is_visitante=true` | Visitante com 30 dias de acesso, conteúdo limitado |
| Academy | `academy` | Mentorado com trilhas, diagnóstico, comunidade |
| Skills | `skills` | Equipes com líder, backlog, entregas, roadmap |
| Business Parceria | `business_parceria` | Consultoria 1:1, ROI, etapas, entregas, sessões |
| Business Sistemas | `business_sistemas` | IAplicada, visão própria (Meu Sistema) |

**Admin** pode simular qualquer plano via `AdminViewSelector` + `AdminViewContext`.

---

## 3. Estrutura de Páginas (70+ rotas)

### Área do Mentorado
- **Dashboard** (`/`): Cards de boas-vindas, progresso semanal, central de conteúdo, ranking
- **Trilhas** (`/trilhas`): Grade de trilhas com módulos e vídeos
- **Mentoria** (`/mentoria`): Hub com tabs (Visão Geral, Roadmap, Evolução)
- **Sub-páginas**: Sessões, Tarefas, Entregas, Dúvidas, Projetos, Etapas, Validações, Reports, Documentos, Recursos, Instruções, Tasks Business
- **Skills**: Equipe, Backlog, Roadmap, Entregas, Líder Dashboard, Projeto Skills (com sub-páginas)
- **Meu Sistema** (Business Sistemas): Visão própria com etapas, entregas, documentos
- **Ecossistema, Comunidade, Bibliotecas** (Ferramentas, Prompts, IA Copie&Use, Métodos)
- **Evolução**: Conquistas, Certificados
- **Chat**: MarIAna (página completa) + Drawer flutuante

### Área Admin (20+ páginas)
- Dashboard, Usuários, Visitantes, Conteúdo, Bibliotecas, Avisos, Conhecimento
- Mentoria: Academy, Business, Business IAplicada, Skills, Bonus, Preview Painéis
- Dúvidas, Produtos, Materiais, Formulários, Menus, Auditoria, Importar Usuários, Comunidade, Políticas, Pesquisas, Histórico Senhas, Permissões Equipe

---

## 4. Atualizações Recentes (Sessão Atual)

| Feature | Status | Arquivos |
|---------|--------|----------|
| **Fluxo Business Welcome** | Implementado | `BusinessWelcome.tsx`, `NovoUsuarioModal.tsx`, `Dashboard.tsx` (redirect), migração `mensagem_boas_vindas` |
| **Banner ROI fictício** | Implementado | `BusinessROIChart.tsx` — opacidade 40% + banner âmbar quando `!contrato?.data_inicio` |
| **BusinessVisaoRapida** | Implementado | Componente com header contextual (semana X), grid 3 cards (sessão, tarefas críticas, última entrega) |
| **Notificações por triggers** | Implementado | 4 funções SQL + triggers: nova entrega, tarefa urgente, sessão agendada/alterada, status entrega. Hook `useNotificacoesPessoais`, sino no `TopHeader`, página `Notificacoes.tsx` |
| **Sidebar Business reorganizada** | Implementado | 3 grupos colapsáveis (Minha Jornada, Entregas e Tarefas, Comunicação) com section headers uppercase |
| **Link reunião nas sessões** | Implementado | Coluna `link_reuniao` em `sessoes_mentoria`, input no admin, botões contextuais (24h = destaque, >24h = discreto) em `MentoriaSessoes.tsx` e `BusinessVisaoRapida.tsx` |
| **MarIAna contextual** | Implementado | Context de mentoria (entrega, sessão, etapa, tarefas críticas) injetado no system prompt do edge function `ai-chat-user`. Sugestões contextuais no drawer |

---

## 5. Design System

### Tokens
- **Light**: Background branco, cards `#F5F5F3`, border verde suave `hsl(73 20% 85%)`
- **Dark**: Background `#1E1F1C`, cards `#2F302B`, muted `#38392F`
- **Primary**: `#9EB038` em ambos os modos
- **Sidebar**: Independente com tokens próprios (dark: `#1A1B17`)
- **Radius**: `0.75rem` (padrão)

### Componentes Reutilizáveis
- `PainelCard` / `PainelCardHeader` / `PainelSeparator` com `painelTheme.ts` (Academy vs Business)
- `PageTitle` padronizado
- `PageSkeleton` com variantes
- `PWAInstallBanner` / `PWAUpdatePrompt`
- `MarIAnaChatDrawer` (chat flutuante global)

### Padrões de UI
- Cards com `bg-card border-border rounded-xl`
- Badges com variantes semânticas (emerald para sucesso, amber para warning)
- Tabs com estilo customizado (`bg-primary/20`, active `bg-[#0D0D0D]`)
- Collapsible groups no sidebar com `text-[10px] uppercase tracking-widest`

---

## 6. Backend — Edge Functions (40+)

**IA/AI**: `ai-chat-user`, `gerar-insight-mentoria`, `gerar-resumo-atualizacoes`, `gerar-report-business`, `gerar-report-skills`, `gerar-instrucoes-etapa`, `personalizar-instrucao`, `personalizar-projeto-skills`, `recomendar-conteudo-projeto`, `analisar-respostas-formulario`, `gerar-perguntas-formulario`

**Processamento**: `processar-documento`, `processar-documentos-business`, `processar-contrato-skills`, `parse-contrato-texto`, `parse-documento-contrato`, `parse-aditivo-contrato`, `extrair-texto-documento`

**Admin**: `create-user-admin`, `delete-user`, `reset-user-password`, `import-users-batch`, `get-users-auth-providers`

**Skills**: `gerar-projetos-skills`, `gerar-entregas-skills`, `gerar-metricas-skills`, `consolidar-diagnosticos-skills`, `associar-membros-skills`, `processar-diagnostico-skills`

**Outros**: `api-visitantes`, `process-visitor-expirations`, `verificar-google-login`, `generate-reset-token`, `reset-password-with-token`, `organizar-backlog`, `formatar-direcional`, `formatar-texto-conteudo`, `gerar-metadados-material`, `regenerar-instrucoes-entrega`, `atualizar-conteudos-projeto`

---

## 7. Hooks (100+)

Organização por domínio: `useAuth`, `useUserRole`, `useUserProfile`, `useEffectivePlan`, `useEnvironment`, `useMenuConfig`, `useBusinessUserId`, `useContratosBusiness`, `useEtapasBusiness`, `useEntregasBusiness`, `useMentoriaSessoes`, `useMentoriaTarefas`, `useNotificacoesPessoais`, `useCommunityPosts`, etc.

---

## 8. Segurança

- RLS em todas as tabelas públicas
- `has_role()` SECURITY DEFINER para checar roles
- Roles em tabela separada `user_roles` (enum: admin, moderator, user, visitante, equipe, parceiro)
- `handle_google_auth` bloqueia cadastro via Google para emails não existentes
- `throttle_password_reset` limita 3 resets por 15 min
- Idle logout via `useIdleLogout` (admin)
- Auditoria automática via trigger `registrar_auditoria`

---

## 9. Pontos de Atenção / Oportunidades de Melhoria

1. **Triggers sem registro no DB info**: O sistema reporta "no triggers" mas existem ~15+ triggers via funções. Pode ser questão de schema visibility.

2. **Dados fictícios em múltiplos componentes**: BusinessROIChart já tem banner. Verificar se `BusinessKPICards`, `BusinessPerformanceCharts` e `BusinessDashboard` também usam dados hardcoded sem aviso.

3. **Sidebar com 804 linhas**: `AppSidebar.tsx` é complexo — lógica de Business groups, Skills, menus dinâmicos e simulação admin tudo no mesmo arquivo. Candidato a refatoração em sub-componentes.

4. **Consistência de tema**: `painelTheme.ts` existe para Painel de Diagnóstico mas não é usado nos componentes Business recentes (BusinessVisaoRapida, BusinessROIChart usam classes diretas). Oportunidade de unificar.

5. **MarIAna contextual**: Funciona em `/mentoria/*` mas depende de `useBusinessUserId` — se o usuário Academy estiver em `/mentoria`, pode não ter contrato/entregas. Garantir fallback gracioso.

6. **Notificações**: Triggers SQL criados mas schema info diz "no triggers" — validar se estão efetivamente ativos no banco.

7. **PWA**: Tem install banner + update prompt, mas sem service worker visível no scan. Verificar se PWA está configurado corretamente.

8. **Performance**: 70+ rotas importadas diretamente no App.tsx sem lazy loading. Em apps grandes, isso impacta o bundle inicial.

9. **Tipagem**: Uso de `as any` em vários pontos (ex: `(profile as any)?.mensagem_boas_vindas` no BusinessWelcome) — indica que os types do Supabase ainda não refletem colunas recém-adicionadas até o rebuild.

10. **Mobile**: Sidebar colapsável + TopHeader responsivo existem. Verificar se os novos componentes (BusinessVisaoRapida grid 3 cols, sidebar groups) funcionam bem em telas pequenas.

