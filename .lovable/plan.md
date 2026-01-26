
## Plano: Corrigir Visão do Mentorado Business

### Problemas Identificados

| # | Problema | Causa Raiz |
|---|----------|------------|
| 1 | Instruções da Etapa desconfiguradas e ocupando parte da página | `MentoriaEtapa.tsx` usa `useInstrucoesEtapa(etapaId)` que busca instruções apenas pela etapa, não organiza por Entrega como no admin |
| 2 | Botão "Etapas" leva para `/mentoria/processo` (roadmap genérico) | `BusinessAcessoRapido.tsx` rota incorreta - deveria ir para página específica de etapas Business |
| 3 | Botão "Instruções" leva para "Recursos e Ferramentas" | `BusinessAcessoRapido.tsx` aponta para `/mentoria/recursos` que mostra biblioteca de ferramentas, não instruções de execução |
| 4 | Página "Meus Documentos" sem botão de voltar | `MentoriaDocumentos.tsx` falta o componente `ArrowLeft` padrão |

---

### PARTE 1: Corrigir Página MentoriaDocumentos (Botão Voltar)

**Arquivo:** `src/pages/MentoriaDocumentos.tsx`

Adicionar botão de voltar padrão antes do título, igual às outras páginas:

```tsx
<Button variant="ghost" onClick={() => navigate("/mentoria")} className="mb-6">
  <ArrowLeft className="h-4 w-4 mr-2" />
  Voltar para Mentoria
</Button>
```

---

### PARTE 2: Corrigir Rotas do BusinessAcessoRapido

**Arquivo:** `src/components/mentoria/business/BusinessAcessoRapido.tsx`

**Mudanças nas rotas:**

| Botão | Rota Atual | Rota Correta | Motivo |
|-------|------------|--------------|--------|
| Etapas | `/mentoria/processo` | `/mentoria/etapas-business` | Nova página específica para roadmap Business |
| Instruções | `/mentoria/recursos` | `/mentoria/instrucoes-business` | Nova página com instruções agrupadas por Fase/Entrega |

```tsx
const navItems: QuickNavItem[] = [
  { title: "Diagnóstico", path: "/mentoria/diagnostico", icon: ClipboardCheck },
  { title: "Sessões", path: "/mentoria/sessoes", icon: Calendar },
  { title: "Etapas", path: "/mentoria/etapas-business", icon: Route },  // ALTERADO
  { title: "Instruções", path: "/mentoria/instrucoes-business", icon: FileText },  // ALTERADO
  { title: "Entregas", path: "/mentoria/entregas", icon: Package },
  { title: "Tasks", path: "/mentoria/tarefas", icon: CheckSquare },
  { title: "Documentos", path: "/mentoria/documentos", icon: FolderOpen },
];
```

---

### PARTE 3: Criar Página de Etapas Business para Mentorado

**Novo arquivo:** `src/pages/MentoriaEtapasBusiness.tsx`

Página que mostra as etapas/fases do contrato Business com estrutura similar ao `BusinessExecutiveRoadmap`, mas em página dedicada com mais detalhes:

**Estrutura:**
- Header com título e botão voltar
- Progresso geral do projeto (barra de progresso)
- Lista de Fases (cada fase clicável leva a `/mentoria/etapa/:etapaId`)
- Cada fase mostra: número, título, status, data prevista, e número de entregas associadas

**Fluxo de dados:**
```tsx
const businessUserId = useBusinessUserId();
const { contrato } = useContratosBusiness(businessUserId);
const { data: etapas } = useEtapasBusiness(contrato?.id);
const { entregas } = useEntregasBusiness(contrato?.id);
```

---

### PARTE 4: Criar Página de Instruções Business para Mentorado

**Novo arquivo:** `src/pages/MentoriaInstrucoesBusiness.tsx`

Página que exibe TODAS as instruções do mentorado, organizadas hierarquicamente por **Fase > Entrega**, similar ao `InstrucoesBusinessManager` do admin, mas em modo somente leitura com progresso:

**Estrutura:**
- Header com título, botão voltar e progresso geral
- Seções colapsáveis por Fase
- Dentro de cada Fase, subseções por Entrega (com link para `/mentoria/entrega/:id`)
- Cada instrução usa o `InstrucaoCard` existente com checkbox funcional

**Layout:**
```
Fase 1: Documentação e Processos
  └─ Entrega: Entregas em Conjunto (16 instruções) - [Ver Detalhes]
  └─ Entrega: Upload de Documentação (3 instruções) - [Ver Detalhes]

Fase 2: Financeiro e Expansão  
  └─ Entrega: Módulo de Gestão Financeira (13 instruções) - [Ver Detalhes]
  └─ Entrega: Módulo de Gestão de Canais (13 instruções) - [Ver Detalhes]

Fase 3: Gestão de Alunos
  └─ ...
```

**Fluxo de dados (hook existente reutilizado):**
```tsx
// Criar novo hook useInstrucoesByContrato exportado
const businessUserId = useBusinessUserId();
const { contrato } = useContratosBusiness(businessUserId);
// Buscar todas instruções do contrato agrupadas por etapa/entrega
```

---

### PARTE 5: Melhorar Página MentoriaEtapa (Detalhe da Fase)

**Arquivo:** `src/pages/MentoriaEtapa.tsx`

A página atual mostra instruções flat, sem contexto de entregas. Melhorar para:

1. Adicionar seção de **Entregas da Fase** com links para `/mentoria/entrega/:id`
2. Agrupar instruções por entrega (quando tiver `entrega_id`)
3. Manter layout full-width (remover `max-w-4xl` restritivo se necessário)
4. Adicionar estatísticas: X entregas, Y instruções, Z% concluído

**Nova estrutura:**
```tsx
<div className="container mx-auto py-8 px-4 max-w-6xl">  {/* Largura maior */}
  <EtapaHeader etapa={etapa} />
  
  {/* Entregas desta Fase */}
  <Card>
    <CardHeader>
      <CardTitle>Entregas desta Fase ({entregasDaFase.length})</CardTitle>
    </CardHeader>
    <CardContent>
      {entregasDaFase.map(entrega => (
        <div 
          key={entrega.id}
          onClick={() => navigate(`/mentoria/entrega/${entrega.id}`)}
          className="cursor-pointer hover:bg-muted/50 p-3 rounded-lg"
        >
          <span>{entrega.titulo}</span>
          <Badge>{entrega.status}</Badge>
        </div>
      ))}
    </CardContent>
  </Card>

  {/* Instruções agrupadas */}
  ...
</div>
```

---

### PARTE 6: Registrar Novas Rotas

**Arquivo:** `src/App.tsx`

Adicionar as novas rotas:

```tsx
import MentoriaEtapasBusiness from "./pages/MentoriaEtapasBusiness";
import MentoriaInstrucoesBusiness from "./pages/MentoriaInstrucoesBusiness";

// Dentro das rotas protegidas:
<Route path="/mentoria/etapas-business" element={<MentoriaEtapasBusiness />} />
<Route path="/mentoria/instrucoes-business" element={<MentoriaInstrucoesBusiness />} />
```

---

### PARTE 7: Criar Hook para Instruções por Contrato (Mentorado)

**Arquivo:** `src/hooks/useEtapasBusiness.tsx`

Exportar um hook para buscar todas instruções do contrato do mentorado:

```tsx
export function useInstrucoesByContrato(contratoId?: string) {
  return useQuery({
    queryKey: ['instrucoes-contrato-mentorado', contratoId],
    queryFn: async () => {
      const { data: etapas } = await supabase
        .from('etapas_business')
        .select('id')
        .eq('contrato_id', contratoId);
      
      if (!etapas?.length) return [];
      
      const etapaIds = etapas.map(e => e.id);
      
      const { data, error } = await supabase
        .from('instrucoes_etapa')
        .select(`
          *,
          etapas_business (id, numero_etapa, titulo),
          entregas_business (id, titulo, numero_entrega, etapa_id)
        `)
        .in('etapa_id', etapaIds)
        .order('ordem', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!contratoId,
  });
}
```

---

### Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/MentoriaDocumentos.tsx` | **MODIFICAR** - Adicionar botão voltar |
| `src/components/mentoria/business/BusinessAcessoRapido.tsx` | **MODIFICAR** - Corrigir rotas Etapas/Instruções |
| `src/pages/MentoriaEtapasBusiness.tsx` | **CRIAR** - Nova página de etapas Business |
| `src/pages/MentoriaInstrucoesBusiness.tsx` | **CRIAR** - Nova página de instruções Business |
| `src/pages/MentoriaEtapa.tsx` | **MODIFICAR** - Melhorar layout e adicionar entregas |
| `src/hooks/useEtapasBusiness.tsx` | **MODIFICAR** - Adicionar hook useInstrucoesByContrato |
| `src/App.tsx` | **MODIFICAR** - Registrar novas rotas |

---

### Resultado Esperado

**Fluxo do Mentorado Business:**

```
Dashboard Business
  ├── [Etapas] → /mentoria/etapas-business → Lista todas as fases com progresso
  │     └── Clique em Fase → /mentoria/etapa/:id → Detalhes da fase + entregas
  │           └── Clique em Entrega → /mentoria/entrega/:id → Instruções da entrega
  │
  ├── [Instruções] → /mentoria/instrucoes-business → Todas instruções por Fase > Entrega
  │
  ├── [Entregas] → /mentoria/entregas → Lista todas entregas
  │     └── Clique → /mentoria/entrega/:id
  │
  └── [Documentos] → /mentoria/documentos → Downloads + Links (COM botão voltar)
```

**Consistência com Admin:**
- Mentorado vê mesma estrutura hierárquica (Fase > Entrega > Instrução)
- Instruções agrupadas corretamente por entrega
- Navegação intuitiva entre níveis
- Botão voltar padrão em todas as páginas
