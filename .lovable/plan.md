

# Criar Monitor de Onboarding no Admin

## Resumo
Página admin para acompanhar o funil de onboarding de cada usuário, com KPIs, tabela detalhada, filtros por plano e funil visual de conversão.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/pages/admin/OnboardingMonitor.tsx` | Criar — página completa |
| `src/App.tsx` | Editar — importar e adicionar rota `onboarding-monitor` |
| `src/components/admin/AdminSidebar.tsx` | Editar — adicionar item no grupo "Gestão" |

## Detalhes técnicos

### OnboardingMonitor.tsx
- **Queries paralelas**: `profiles` (id, nome_completo, email, plano_mentoria, primeiro_acesso, created_at) e `onboarding_eventos` (user_id, evento, plano, created_at)
- **Cálculo por usuário**: função `calcularStatus` conforme especificado (status, etapaAtual, diasParado, parado3dias, acaoConcluida)
- **Filtros pill**: Todos, Academy, Business Parceria, Business Sistemas, Skills, Gratuito, Parados 3+ dias
- **4 KPI cards** no topo: Total, Completos (%), Em andamento, Parados 3+ dias (coral)
- **Tabela** com adminTheme: Usuário (iniciais + nome + email), Plano (badge), Status (StatusBadge: completo→verde, em_andamento→âmbar, nao_iniciou→cinza), Parado em, Dias parado (vermelho se ≥3), Ação (Ver perfil/Notificar)
- **Botão Notificar**: insert em `notificacoes` com tipo 'sistema'
- **Funil**: barras horizontais proporcionais com cores #AFC040, #2CBBA6, #4A9FE0, #E8A43C, #AFC040

### App.tsx
- Import `OnboardingMonitor` de `./pages/admin/OnboardingMonitor`
- Rota: `<Route path="onboarding-monitor" element={<OnboardingMonitor />} />` dentro do bloco admin

### AdminSidebar.tsx
- Adicionar `{ path: "/admin/onboarding-monitor", label: "Monitor de Onboarding" }` no grupo "Gestão"

