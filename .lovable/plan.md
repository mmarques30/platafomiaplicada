
# Plano: Separar Diagnósticos por Tipo de Plano do Usuário

## Problema Identificado

Baseado na análise do banco de dados e código:

1. **Dados reais do banco:**
   - 17 respostas de usuários Academy (8 completados)
   - 5 respostas de usuários Business (4 completados)
   - Total: 22 respostas (12 completados)

2. **Problema atual:**
   - Todos os 3 cards de diagnóstico mostram "22 respostas, 12 completos" 
   - As estatísticas usam `stats[form.categoria]` em vez de `stats[form.tipo]`
   - O `RespostasDiagnosticoDrawer` recebe o `tipo` mas não filtra por plano do usuário
   - O `DiagnosticoEstatisticasDrawer` ignora completamente o parâmetro `tipo`

3. **Formulários cadastrados:**
   - Diagnóstico Academy (tipo: `academy`) - 5 etapas
   - Diagnóstico Business (tipo: `business`) - 6 etapas  
   - Diagnóstico Mentoria (tipo: `legacy`) - 7 etapas (legado)

---

## Regra de Mapeamento

| Formulário | Planos Incluídos |
|------------|------------------|
| Academy | `plano_mentoria = 'academy'` ou `'skills'` |
| Business | `plano_mentoria = 'business'` |
| Legacy (Mentoria) | Usuários sem plano (`null`) ou planos antigos (`lab`, `club`, etc.) |

---

## Mudanças Necessárias

### 1. `FormulariosDoSistema.tsx` - Estatísticas Separadas

**Problema (linhas 87-116):**
```typescript
// Busca todos os diagnósticos sem separar por tipo
const { data: diagnosticos } = await supabase
  .from('formulario_diagnostico')
  .select('id, completado');
```

**Solução:**
```typescript
// Buscar diagnósticos COM profiles para separar por plano
const { data: diagnosticos } = await supabase
  .from('formulario_diagnostico')
  .select('id, completado, user_id');

// Buscar planos dos usuários
const userIds = diagnosticos?.map(d => d.user_id).filter(Boolean) || [];
let profiles: { id: string; plano_mentoria: string | null }[] = [];
if (userIds.length > 0) {
  const { data } = await supabase
    .from('profiles')
    .select('id, plano_mentoria')
    .in('id', userIds);
  profiles = data || [];
}

// Separar por tipo de plano
const diagnosticosAcademy = diagnosticos?.filter(d => {
  const plano = profiles.find(p => p.id === d.user_id)?.plano_mentoria;
  return plano === 'academy' || plano === 'skills';
}) || [];

const diagnosticosBusiness = diagnosticos?.filter(d => {
  const plano = profiles.find(p => p.id === d.user_id)?.plano_mentoria;
  return plano === 'business';
}) || [];

const diagnosticosLegacy = diagnosticos?.filter(d => {
  const plano = profiles.find(p => p.id === d.user_id)?.plano_mentoria;
  return !plano || !['academy', 'business', 'skills'].includes(plano);
}) || [];

return {
  'diagnostico-academy': { 
    total: diagnosticosAcademy.length, 
    completados: diagnosticosAcademy.filter(d => d.completado).length 
  },
  'diagnostico-business': { 
    total: diagnosticosBusiness.length, 
    completados: diagnosticosBusiness.filter(d => d.completado).length 
  },
  'diagnostico-legacy': { 
    total: diagnosticosLegacy.length, 
    completados: diagnosticosLegacy.filter(d => d.completado).length 
  },
  // ... manter outros
};
```

**Atualizar uso das estatísticas (linha 182):**
```typescript
// ANTES
const stats = estatisticas?.[form.categoria];

// DEPOIS (para diagnósticos, usar o tipo; para outros, usar categoria)
const stats = isDiagnostico 
  ? estatisticas?.[`diagnostico-${form.tipo}`]
  : estatisticas?.[form.categoria];
```

---

### 2. `RespostasDiagnosticoDrawer.tsx` - Filtrar por Plano

**Problema (linhas 48-49):**
```typescript
// Não filtra pelo tipo, mostra todos
const respostas = formularios || [];
```

**Solução:**
```typescript
// Filtrar por plano do usuário baseado no tipo selecionado
const respostas = formularios?.filter(f => {
  const plano = f.profiles?.plano_mentoria;
  
  if (tipo === 'business') {
    return plano === 'business';
  } else if (tipo === 'academy') {
    return plano === 'academy' || plano === 'skills';
  } else {
    // legacy - usuários sem plano específico
    return !plano || !['academy', 'business', 'skills'].includes(plano);
  }
}) || [];
```

---

### 3. `DiagnosticoEstatisticasDrawer.tsx` - Filtrar Estatísticas

**Problema (linhas 39-43):**
```typescript
// Busca TODOS os formulários, não filtra por tipo
const { data: formularios, error } = await supabase
  .from('formulario_diagnostico')
  .select('id, completado, ...');
```

**Solução:**
```typescript
// Buscar formulários COM user_id
const { data: formularios, error } = await supabase
  .from('formulario_diagnostico')
  .select('id, completado, created_at, updated_at, insight_gerado_em, nivel_comprometimento, nivel_ia, area_atuacao, ferramentas_ia, user_id');

if (error) throw error;

// Buscar planos dos usuários
const userIds = formularios?.map(f => f.user_id).filter(Boolean) || [];
let profiles: { id: string; plano_mentoria: string | null }[] = [];
if (userIds.length > 0) {
  const { data } = await supabase
    .from('profiles')
    .select('id, plano_mentoria')
    .in('id', userIds);
  profiles = data || [];
}

// Filtrar por tipo do plano
const formsFiltrados = formularios?.filter(f => {
  const plano = profiles.find(p => p.id === f.user_id)?.plano_mentoria;
  
  if (tipo === 'business') {
    return plano === 'business';
  } else if (tipo === 'academy') {
    return plano === 'academy' || plano === 'skills';
  } else {
    return !plano || !['academy', 'business', 'skills'].includes(plano);
  }
}) || [];

// Usar formsFiltrados em vez de formularios para todas as estatísticas
const total = formsFiltrados.length;
const completados = formsFiltrados.filter(f => f.completado).length;
// ...
```

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/admin/formularios/FormulariosDoSistema.tsx` | Separar estatísticas por tipo de plano |
| `src/components/admin/formularios/RespostasDiagnosticoDrawer.tsx` | Filtrar respostas pelo plano do usuário |
| `src/components/admin/formularios/DiagnosticoEstatisticasDrawer.tsx` | Filtrar estatísticas pelo plano do usuário |

---

## Resultado Esperado

### Cards de Diagnóstico

| Card | Respostas | Completos |
|------|-----------|-----------|
| Diagnóstico Academy | 17 | 8 |
| Diagnóstico Business | 5 | 4 |
| Diagnóstico Mentoria (Legacy) | 0 | 0 |

### Drawer de Respostas
- **Academy**: Mostra apenas Debora, Géssina, Claudia, Pietra, Alessandro, Renato, etc.
- **Business**: Mostra apenas Paula, Meire, Gilberto, Tania, Mariana

### Drawer de Estatísticas
- Cada drawer mostra métricas específicas do seu tipo de usuário

---

## Fluxo Visual

```text
┌─────────────────────────────────────────────────────────────────┐
│                      Formulários do Sistema                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Diagnósticos                                                   │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│  │ 🎓 Academy       │ │ 🏢 Business      │ │ 👥 Mentoria      │ │
│  │ ────────────────│ │ ────────────────│ │ ────────────────│ │
│  │ 17 respostas    │ │ 5 respostas     │ │ 0 respostas     │ │
│  │ 8 completos     │ │ 4 completos     │ │ 0 completos     │ │
│  │ ────────────────│ │ ────────────────│ │ ────────────────│ │
│  │ [Respostas][📄]│ │ [Respostas][📄]│ │ [Respostas][📄]│ │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Observação sobre Diagnóstico Mentoria (Legacy)

O "Diagnóstico Mentoria" é o formulário original de 7 etapas. Atualmente não há usuários com planos legados (`lab`, `club`, `null`) que preencheram o diagnóstico, então aparecerá vazio.

Se quiser **remover** ou **desativar** este formulário, basta usar o toggle que implementamos anteriormente.

