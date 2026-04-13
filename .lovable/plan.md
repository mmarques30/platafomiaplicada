

# Melhorias no Dashboard Administrativo

5 mudanças sequenciais nos arquivos do dashboard admin.

---

## Mudança 1: Separar business_parceria e business_sistemas

**useAdminDashboard.tsx** (linhas 125-130): Trocar o campo `business` por `business_parceria` e `business_sistemas`:
```ts
const distribuicaoPlanos = {
  academy: users?.filter(u => u.plano_mentoria === "academy").length || 0,
  skills: users?.filter(u => u.plano_mentoria === "skills").length || 0,
  business_parceria: users?.filter(u => u.plano_mentoria === "business_parceria").length || 0,
  business_sistemas: users?.filter(u => u.plano_mentoria === "business_sistemas").length || 0,
  sem_plano: users?.filter(u => !u.plano_mentoria).length || 0,
};
```

**DistribuicaoPlanos.tsx**: Atualizar COLORS, LABELS e interface para incluir `business_parceria` (roxo `#8b5cf6`) e `business_sistemas` (indigo `#6366f1`), removendo `business`.

**VisaoGeralTab.tsx**: Atualizar a interface `distribuicaoPlanos` para refletir os novos campos.

---

## Mudança 2: Remover gráfico simulado do UsuariosTab

**UsuariosTab.tsx**: Remover o bloco `chartData`, o `<Card>` "Evolução de Usuários" com o `LineChart`, e os imports de recharts (`LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`). Manter cards de métricas, visitantes e tabela top usuários.

---

## Mudança 3: Consolidar de 7 para 4 abas

**AdminDashboard.tsx**: Manter apenas 4 abas:
- **Visão Geral** (existente)
- **Usuários & Conversão** (juntar UsuariosTab + conteúdo do MentoriaTab)
- **Engajamento** (existente)
- **Resumo IA** (existente ResumoTab)

Remover TabsTrigger/TabsContent de: Página Gratuita, Conteúdo, Mentoria. Remover imports não usados.

**UsuariosTab.tsx**: Adicionar seção de mentoria no final (projetos em andamento, tarefas por status, sessões agendadas, taxa de conclusão). Atualizar interface para receber `data.mentoria` e `data.alertas`.

---

## Mudança 4: Tendências e melhorias na Visão Geral

**useAdminDashboard.tsx**: Adicionar cálculos de tendência:
- `fourteenDaysAgo = subDays(now, 14)`
- Calcular `novosUsuariosPrev7d` (criados entre 14d e 7d atrás)
- Calcular `usuariosAtivosPrev7d` (último acesso entre 14d e 7d atrás)
- Calcular `usuariosInativos` (conta_ativa = true, ultimo_acesso < 30d atrás ou null)
- Retornar objeto `tendencias` com variação percentual e direção (up/down/stable)
- Retornar `usuariosInativos` count

**VisaoGeralTab.tsx**:
- Substituir 3 AlertCards por um banner compacto com badges clicáveis (ex: "🔴 3 Tarefas Atrasadas | 🟡 2 Dúvidas | 🟡 1 Diagnóstico") usando um Card com flex row de Badge components
- Nos StatsCards de KPI, adicionar indicador de tendência (seta + percentual) via prop `trend`
- Criar `StatsCard` com suporte a `trend?: { direction: 'up'|'down'|'stable', value: number }`
- Adicionar card "Usuários Inativos" 
- Adicionar funil visual: 3 barras horizontais (Visitantes → Convertidos → Ativos) com largura proporcional e percentuais

---

## Mudança 5: Métricas da Mari (chatbot IA)

**useAdminDashboard.tsx**: Nova query na tabela `chat_messages`:
- Filtrar `created_at >= 60 dias atrás`
- Usar try/catch para não bloquear o dashboard se falhar
- Calcular: total de usuários distintos, mensagens nos últimos 7d, taxa de adoção (usuários Mari / total usuários), média de mensagens por usuário

Retornar objeto `mari`:
```ts
mari: {
  totalUsuarios: number,
  mensagens7d: number,
  taxaAdocao: number, // percentual
  mediaMensagensPorUsuario: number,
}
```

**VisaoGeralTab.tsx**: Adicionar seção "Mari - Mentora IA" com 4 StatsCards mostrando essas métricas, usando ícone `Bot` ou `Sparkles`.

---

## Arquivos modificados

| Arquivo | Mudanças |
|---------|----------|
| `src/hooks/useAdminDashboard.tsx` | Separar business, tendências, inativos, métricas Mari |
| `src/components/admin/DistribuicaoPlanos.tsx` | Novos campos business_parceria/sistemas |
| `src/components/admin/StatsCard.tsx` | Adicionar prop `trend` opcional |
| `src/components/admin/dashboard/VisaoGeralTab.tsx` | Banner alertas, tendências, inativos, funil, Mari |
| `src/components/admin/dashboard/UsuariosTab.tsx` | Remover gráfico, adicionar seção mentoria |
| `src/pages/admin/AdminDashboard.tsx` | 4 abas ao invés de 7 |

Nenhum arquivo será deletado. Nenhum arquivo fora do dashboard admin será modificado.

