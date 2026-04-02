

# Criar página "Minha Trajetória" com timeline cronológica

## Resumo
Página nova `/minha-historia` que agrega eventos de múltiplas tabelas do usuário e renderiza uma timeline vertical com marcadores coloridos por tipo.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/pages/MinhaHistoria.tsx` | Criar — página com timeline cronológica |
| `src/App.tsx` | Editar — adicionar rota `/minha-historia` dentro do bloco ProtectedRoute+MainLayout |

## Detalhes técnicos

### MinhaHistoria.tsx

**Busca de dados** — `useQuery` com `Promise.all` em paralelo:

1. `profiles` → `created_at` do usuário → evento 'cadastro'
2. `progresso_videos` → `select("id, created_at, video_id")` com `completado = true`, ordenado por `created_at` → evento 'modulo'
3. `sessoes_mentoria` → `status = 'realizada'` → evento 'sessao'
4. `etapas_business` → `status = 'concluida'` (via contrato do usuário, usar `contratos_business` para obter `contrato_id`) → evento 'etapa'
5. `entregas_business` → `status = 'aprovada'` (pelo contrato) → evento 'entrega'
6. `certificados_mentorado` → certificados emitidos → evento 'conquista' (se tabela não existir, usar conquistas calculadas do `EvolucaoConquistas` — primeira aula, sequência, etc.)

**Nota sobre conquistas**: Como não existe tabela de conquistas, serão derivadas dos dados existentes (primeira aula completada, certificados emitidos via `useMeusCertificados`).

**Tipagem**:
```typescript
type EventoTimeline = {
  id: string;
  tipo: 'cadastro' | 'modulo' | 'sessao' | 'etapa' | 'entrega' | 'conquista';
  titulo: string;
  subtitulo?: string;
  data: string; // ISO date
};
```

**Ordenação**: `data` desc (mais recente primeiro).

**UI — Timeline vertical** (mesmo padrão de `MentoriaEtapasBusiness`):
- Linha vertical `absolute left-5 w-0.5 bg-border`
- Marcadores circulares `h-10 w-10 rounded-full` com ícone Lucide centralizado
- Card ao lado com título, subtítulo e data formatada

**Cores e ícones por tipo**:
- cadastro: `Sparkles` cor `#AFC040`
- modulo: `BookOpen` cor `#2CBBA6`
- sessao: `Video` cor `#4A9FE0`
- etapa: `CheckCircle` cor `#AFC040`
- entrega: `Package` cor `#2CBBA6`
- conquista: `Trophy` cor `#E8A43C`

**Cabeçalho**: PageTitle "Minha Trajetória" + subtítulo "Tudo que você construiu desde que começou." + data de início formatada (`format(profile.created_at, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })`).

**Loading**: `PageSkeleton` enquanto carrega.

### App.tsx
Adicionar após a rota `/evolucao/certificados` (linha ~165):
```tsx
<Route path="/minha-historia" element={<MinhaHistoria />} />
```

Import no topo do arquivo.

### Sidebar
Não será adicionado hardcoded ao sidebar — a rota ficará acessível via menu_config existente (o admin pode adicionar via `/admin/menus`). A página fica funcional pela URL direta e pode ser linkada de qualquer lugar.

