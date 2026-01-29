
# Plano: Gerenciamento de Formulários Ativos na Dashboard

## Contexto

O componente `PendenciasOnboarding` exibe pendências de preenchimento no Dashboard abaixo do header de boas-vindas. Atualmente, os formulários são **hardcoded**:

```typescript
// src/components/dashboard/PendenciasOnboarding.tsx
const PESQUISA_APLICA_ID = "9a357821-4e62-4176-9f6c-46b0668cb450";

const pendencias: PendenciaItem[] = [
  { key: "diagnostico", label: "Diagnóstico Estratégico", link: "/meu-diagnostico" },
  { key: "pesquisa", label: "Pesquisa de Perfil", link: "/formulario-aplica" },
];
```

O admin precisa poder ativar/desativar dinamicamente quais formulários aparecem como pendências para os mentorados.

---

## Solução

### 1. Criar Tabela de Configuração de Pendências

Nova tabela `pendencias_dashboard` para controlar quais itens aparecem na seção de pendências:

```sql
CREATE TABLE public.pendencias_dashboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('diagnostico', 'pesquisa', 'formulario')),
  referencia_id UUID, -- ID do formulário/pesquisa (opcional)
  titulo TEXT NOT NULL,
  descricao TEXT,
  link TEXT NOT NULL,
  icone TEXT DEFAULT 'FileText',
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  planos_aplicaveis TEXT[] DEFAULT ARRAY['academy', 'business', 'skills'], -- Quais planos veem
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.pendencias_dashboard ENABLE ROW LEVEL SECURITY;

-- Todos autenticados podem ler pendências ativas
CREATE POLICY "pendencias_select" ON public.pendencias_dashboard
  FOR SELECT TO authenticated USING (ativo = true);

-- Apenas admins podem gerenciar
CREATE POLICY "pendencias_admin" ON public.pendencias_dashboard
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Dados iniciais
INSERT INTO public.pendencias_dashboard (tipo, titulo, link, ordem, planos_aplicaveis) VALUES
  ('diagnostico', 'Diagnóstico Estratégico', '/meu-diagnostico', 1, ARRAY['academy', 'business', 'skills']),
  ('pesquisa', 'Pesquisa de Perfil', '/formulario-aplica', 2, ARRAY['academy', 'business', 'skills']);
```

---

### 2. Criar Componente Admin para Gerenciar Pendências

**Arquivo:** `src/components/admin/dashboard/GerenciarPendencias.tsx`

Interface com:
- Lista de todas as pendências com Switch para ativar/desativar
- Opção de reordenar (drag-and-drop ou setas)
- Modal para adicionar nova pendência
- Seletor de planos aplicáveis

```text
+----------------------------------------------------------+
| ⚙️ Gerenciar Pendências da Dashboard                      |
+----------------------------------------------------------+
| [+ Adicionar Pendência]                                   |
+----------------------------------------------------------+
| ○━━━━○ Diagnóstico Estratégico      [Academy/Business]    |
| ○━━━━○ Pesquisa de Perfil           [Academy/Business]    |
| ○━━━━○ Termo de Aceite              [Inativo]            |
+----------------------------------------------------------+
```

---

### 3. Adicionar Aba no Admin Dashboard ou Página Dedicada

Opção 1: Adicionar como aba em `GerenciarAvisos.tsx` (já gerencia avisos da dashboard)

Opção 2: Criar seção em `AdminDashboard.tsx` com acesso rápido

**Recomendação:** Adicionar em `GerenciarAvisos.tsx` como nova aba "Pendências" já que é relacionado ao que aparece na Dashboard.

---

### 4. Atualizar `PendenciasOnboarding.tsx`

Substituir itens hardcoded por query dinâmica:

```typescript
// Buscar pendências ativas do banco
const { data: pendenciasConfig } = useQuery({
  queryKey: ["pendencias-dashboard"],
  queryFn: async () => {
    const { data } = await supabase
      .from("pendencias_dashboard")
      .select("*")
      .eq("ativo", true)
      .order("ordem", { ascending: true });
    return data;
  },
});

// Verificar se usuário já completou cada pendência
const verificarCompletado = async (tipo: string) => {
  if (tipo === 'diagnostico') {
    const { data } = await supabase
      .from("formulario_diagnostico")
      .select("completado")
      .eq("user_id", user.id)
      .maybeSingle();
    return data?.completado === true;
  }
  if (tipo === 'pesquisa') {
    const { data } = await supabase
      .from("respostas_pesquisas")
      .select("completado")
      .eq("pesquisa_id", PESQUISA_APLICA_ID)
      .eq("user_id", user.id)
      .eq("completado", true)
      .maybeSingle();
    return !!data;
  }
  return false;
};
```

---

## Arquivos a Criar/Modificar

| Arquivo | Acao |
|---------|------|
| Migration SQL | **CRIAR** - Tabela `pendencias_dashboard` |
| `src/hooks/usePendenciasDashboard.tsx` | **CRIAR** - Hook para admin gerenciar |
| `src/components/admin/dashboard/GerenciarPendencias.tsx` | **CRIAR** - Componente admin |
| `src/pages/admin/GerenciarAvisos.tsx` | **MODIFICAR** - Adicionar aba "Pendências" |
| `src/components/dashboard/PendenciasOnboarding.tsx` | **MODIFICAR** - Usar config dinâmica |

---

## Fluxo de Uso

```text
Admin:
  ├─ Acessa /admin/avisos
  ├─ Clica na aba "Pendências"
  ├─ Vê lista de pendências com switch ativo/inativo
  ├─ Desativa "Pesquisa de Perfil" → Toggle OFF
  └─ Mudança reflete imediatamente na Dashboard dos mentorados

Mentorado:
  ├─ Acessa Dashboard (/)
  ├─ Vê seção "Complete seu perfil" abaixo do Welcome
  └─ Vê apenas pendências ativas configuradas pelo admin
```

---

## Interface do Admin

```text
┌─────────────────────────────────────────────────────────┐
│ 📋 Avisos                                               │
├─────────────────────────────────────────────────────────┤
│ [Avisos] [Encontros] [Pendências]                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Pendências da Dashboard                                │
│  Configure quais formulários aparecem para os usuários  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ [ON] Diagnóstico Estratégico                    │    │
│  │      /meu-diagnostico                           │    │
│  │      Academy, Business, Skills                  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ [ON] Pesquisa de Perfil                         │    │
│  │      /formulario-aplica                         │    │
│  │      Academy, Business                          │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  [+ Adicionar Pendência]                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Resultado Esperado

- Admin pode ativar/desativar formulários que aparecem na Dashboard
- Mentorados veem apenas pendências ativas
- Sistema flexível para adicionar novas pendências no futuro
- Controle granular por plano (Academy, Business, Skills)
