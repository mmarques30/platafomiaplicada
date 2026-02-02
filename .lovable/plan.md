
# Plano: Filtros Avançados + Sub-aba de Gerenciamento de Cupons em Visitantes

## Visão Geral

Reestruturar a página "Gerenciar Visitantes" com:
1. **Sistema de abas** separando "Visitantes" e "Cupons"
2. **Filtros avançados** na aba de Visitantes (por cupom, status, quantidade de acessos)
3. **CRUD completo de cupons** na nova aba "Gerenciar Cupons"

---

## Estrutura Final da Página

```text
┌──────────────────────────────────────────────────────────────────┐
│ Gerenciar Visitantes                                              │
├──────────────────────────────────────────────────────────────────┤
│ [👥 Visitantes]  [🏷️ Cupons]                                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ABA VISITANTES:                                                  │
│  ┌─ Estatísticas ────────────────────────────────────────────┐   │
│  │ Total | Acessos | Únicos | Média                          │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─ Filtros ────────────────────────────────────────────────────┐ │
│  │ [Busca...] [Cupom ▼] [Status ▼] [Acessos ▼] [Limpar]        │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  [Tabelas colapsáveis existentes + Lista de Visitantes]          │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ABA CUPONS:                                                      │
│  ┌─ Lista de Cupons ────────────────────────────────────────────┐ │
│  │ Código     │ Desconto │ Tipo       │ Visitantes │ Ações      │ │
│  │ Academy12  │ 12%      │ Padrão     │ 143        │ [✏️][🗑️]   │ │
│  │ Academy15  │ 15%      │ Engajados  │ 7          │ [✏️][🗑️]   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│  [+ Novo Cupom]                                                   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Parte 1: Alterações no Banco de Dados

### 1.1 Criar tabela `cupons_visitantes`

Nova tabela para gerenciar os cupons de desconto para visitantes:

```sql
CREATE TABLE public.cupons_visitantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) NOT NULL UNIQUE,
  desconto_percentual INTEGER NOT NULL CHECK (desconto_percentual > 0 AND desconto_percentual <= 100),
  descricao TEXT,
  tipo VARCHAR(30) DEFAULT 'manual', -- 'padrao', 'engajados', 'manual'
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir cupons existentes
INSERT INTO public.cupons_visitantes (codigo, desconto_percentual, descricao, tipo)
VALUES 
  ('Academy12', 12, 'Cupom padrão para visitantes', 'padrao'),
  ('Academy15', 15, 'Cupom para visitantes engajados (+2x/semana)', 'engajados');

-- RLS
ALTER TABLE public.cupons_visitantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar cupons" ON public.cupons_visitantes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );
```

---

## Parte 2: Novos Componentes

### 2.1 Hook `useCuponsVisitantes.tsx`

Hook para CRUD de cupons:

```typescript
// src/hooks/admin/useCuponsVisitantes.tsx
export function useCuponsVisitantes() {
  // Listar todos os cupons
  // Criar novo cupom
  // Atualizar cupom existente
  // Excluir cupom
  // Contar visitantes por cupom
}
```

### 2.2 Componente `CuponsTab.tsx`

Nova aba com tabela de cupons e modal de edição:

```typescript
// src/components/admin/visitantes/CuponsTab.tsx
// - Tabela com: Código, Desconto %, Descrição, Tipo, Qtd Visitantes, Ações
// - Modal para criar/editar cupom
// - Confirmação para excluir
```

### 2.3 Componente `VisitantesTab.tsx`

Refatorar conteúdo atual da página para componente separado:

```typescript
// src/components/admin/visitantes/VisitantesTab.tsx
// - Mover toda lógica atual para este componente
// - Adicionar filtros: cupom, status, acessos
```

---

## Parte 3: Filtros na Aba de Visitantes

### 3.1 Novos filtros disponíveis

| Filtro | Opções | Descrição |
|--------|--------|-----------|
| **Cupom** | Academy12, Academy15, Todos | Filtrar por cupom atribuído |
| **Status** | Ativo, Expirando, Expirado, Inativo, Todos | Filtrar por status de acesso |
| **Acessos** | Sem acessos, 1-5, 6-20, 20+, Todos | Filtrar por quantidade de acessos |

### 3.2 Interface dos filtros

```tsx
<div className="flex flex-wrap gap-3 mb-4">
  <Input placeholder="Buscar..." />
  
  <Select>
    <SelectTrigger>Cupom</SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Todos os cupons</SelectItem>
      <SelectItem value="Academy12">Academy12</SelectItem>
      <SelectItem value="Academy15">Academy15</SelectItem>
    </SelectContent>
  </Select>
  
  <Select>
    <SelectTrigger>Status</SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Todos</SelectItem>
      <SelectItem value="ativo">Ativo</SelectItem>
      <SelectItem value="expirando">Expirando</SelectItem>
      <SelectItem value="expirado">Expirado</SelectItem>
      <SelectItem value="inativo">Inativo</SelectItem>
    </SelectContent>
  </Select>
  
  <Select>
    <SelectTrigger>Acessos</SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Todos</SelectItem>
      <SelectItem value="0">Sem acessos</SelectItem>
      <SelectItem value="1-5">1 a 5</SelectItem>
      <SelectItem value="6-20">6 a 20</SelectItem>
      <SelectItem value="20+">20+</SelectItem>
    </SelectContent>
  </Select>
  
  <Button variant="ghost" onClick={clearFilters}>
    <X className="h-4 w-4" /> Limpar
  </Button>
</div>
```

---

## Parte 4: Aba de Gerenciamento de Cupons

### 4.1 Tabela de cupons

| Coluna | Descrição |
|--------|-----------|
| Código | Nome do cupom (ex: Academy12) |
| Desconto | Percentual de desconto |
| Descrição | Texto explicativo |
| Tipo | Padrão / Engajados / Manual |
| Visitantes | Quantidade de visitantes usando este cupom |
| Status | Ativo / Inativo |
| Ações | Editar / Excluir |

### 4.2 Modal de criação/edição

Campos do formulário:
- **Código do cupom** (obrigatório, único)
- **Desconto (%)** (obrigatório, 1-100)
- **Descrição** (opcional)
- **Tipo** (Padrão, Engajados, Manual)
- **Ativo** (switch)

### 4.3 Ação de atribuir cupom a visitantes

Na tabela de visitantes, adicionar ação para alterar o cupom manualmente:
- Dropdown no menu de ações com lista de cupons disponíveis
- Atualização imediata no banco

---

## Parte 5: Arquivos a Serem Criados/Modificados

### Novos arquivos:
| Arquivo | Descrição |
|---------|-----------|
| `src/components/admin/visitantes/VisitantesTab.tsx` | Conteúdo refatorado da aba visitantes |
| `src/components/admin/visitantes/CuponsTab.tsx` | Nova aba de gerenciamento de cupons |
| `src/hooks/admin/useCuponsVisitantes.tsx` | Hook CRUD para cupons |

### Arquivos modificados:
| Arquivo | Alteração |
|---------|-----------|
| `src/pages/admin/GerenciarVisitantes.tsx` | Reestruturar com Tabs (Visitantes + Cupons) |

### Migrações de banco:
| Migração | Descrição |
|----------|-----------|
| Nova migração | Criar tabela `cupons_visitantes` + inserir cupons existentes |

---

## Detalhes Técnicos

### Lógica de filtros

```typescript
const filteredVisitantes = useMemo(() => {
  return visitantes.filter(v => {
    // Filtro por texto
    if (searchTerm && !matchSearch(v, searchTerm)) return false;
    
    // Filtro por cupom
    if (cupomFilter !== 'all' && v.cupom_especial !== cupomFilter) return false;
    
    // Filtro por status
    if (statusFilter !== 'all') {
      const diasRestantes = calcDiasRestantes(v);
      const status = getStatus(v, diasRestantes);
      if (status !== statusFilter) return false;
    }
    
    // Filtro por acessos
    if (acessosFilter !== 'all') {
      const count = metrics?.accessesByUser?.[v.email] || 0;
      if (!matchAcessos(count, acessosFilter)) return false;
    }
    
    return true;
  });
}, [visitantes, searchTerm, cupomFilter, statusFilter, acessosFilter, metrics]);
```

### Contagem de visitantes por cupom

```typescript
const visitantesPorCupom = useMemo(() => {
  const counts: Record<string, number> = {};
  visitantes.forEach(v => {
    const cupom = v.cupom_especial || 'Academy12';
    counts[cupom] = (counts[cupom] || 0) + 1;
  });
  return counts;
}, [visitantes]);
```

---

## Fluxo de Uso

### Administrador quer ver visitantes com cupom Academy15:
1. Acessa "Gerenciar Visitantes"
2. Aba "Visitantes" já está selecionada
3. No filtro "Cupom", seleciona "Academy15"
4. Tabela mostra apenas visitantes com esse cupom

### Administrador quer criar novo cupom:
1. Acessa "Gerenciar Visitantes"
2. Clica na aba "Cupons"
3. Clica em "Novo Cupom"
4. Preenche: Código, Desconto, Descrição, Tipo
5. Salva

### Administrador quer alterar cupom de um visitante:
1. Na aba "Visitantes", localiza o visitante
2. Clica no menu de ações (...)
3. Seleciona "Alterar Cupom"
4. Escolhe o novo cupom da lista
5. Cupom é atualizado imediatamente

