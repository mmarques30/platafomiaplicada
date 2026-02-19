

# Incluir Melhorias da Plataforma no Resumo de Atualizacoes

## Problema

O sistema de auditoria captura apenas alteracoes em tabelas de conteudo (videos, prompts, trilhas, etc.). Melhorias de plataforma como "chat da MarIAna com historico", "melhoria de performance" ou "novo layout lateral" sao mudancas de codigo que nao sao registradas em nenhuma tabela -- por isso nunca aparecem no resumo gerado pela IA.

## Solucao

Criar uma tabela `melhorias_plataforma` para o admin registrar manualmente essas atualizacoes, e incluir esses registros no resumo gerado pela edge function.

## Etapas

### 1. Criar tabela `melhorias_plataforma`

Nova tabela com os campos:
- `id` (uuid, PK)
- `titulo` (text) -- ex: "Chat MarIAna com historico persistente"
- `descricao` (text, opcional) -- detalhes da melhoria
- `categoria` (text) -- ex: "Funcionalidade", "Performance", "Interface", "Correcao"
- `created_by` (uuid, referencia profiles)
- `created_at` (timestamptz)

RLS: somente admins podem inserir/editar/visualizar.

### 2. Adicionar mini-formulario na ResumoTab (admin)

No componente `src/components/admin/dashboard/ResumoTab.tsx`, adicionar uma secao acima do botao "Gerar Resumo" com:
- Um botao "Registrar Melhoria" que abre um dialog simples
- Campos: titulo (obrigatorio), descricao (opcional), categoria (select)
- Lista das melhorias registradas nos ultimos 30 dias com opcao de remover

### 3. Atualizar a edge function `gerar-resumo-atualizacoes`

Na edge function, alem de buscar `auditoria_conteudo`, tambem buscar os registros de `melhorias_plataforma` do periodo selecionado e inclui-los no JSON enviado para a IA, numa secao separada chamada "Melhorias da Plataforma".

### 4. Atualizar o prompt da IA

Adicionar no system prompt a instrucao para tratar a secao "Melhorias da Plataforma" com o emoji adequado (ex: "Melhorias da Plataforma") e listar cada melhoria registrada.

## Resultado esperado

O admin registra "Novo chat MarIAna com historico" e "Melhoria de performance". Ao gerar o resumo, a IA inclui uma secao como:

```
⚡ Melhorias da Plataforma
- Chat da MarIAna agora com historico persistente e acesso lateral
- Melhorias gerais de performance
```

## Secao tecnica

### SQL da migracao

```sql
CREATE TABLE public.melhorias_plataforma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL DEFAULT 'Funcionalidade',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.melhorias_plataforma ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar melhorias"
  ON public.melhorias_plataforma
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

### Alteracao na edge function

Adicionar query apos buscar `auditoria_conteudo`:

```typescript
const { data: melhorias } = await supabase
  .from("melhorias_plataforma")
  .select("titulo, descricao, categoria")
  .gte("created_at", dataLimite.toISOString())
  .order("created_at", { ascending: false });
```

E incluir no payload enviado a IA:

```typescript
const userPrompt = JSON.stringify({
  periodo: `${dias} dias`,
  total_alteracoes: registros.length,
  por_categoria: porCategoria,
  melhorias_plataforma: melhorias || [],
});
```

### Arquivos modificados

- **Migracao SQL**: criar tabela `melhorias_plataforma`
- **`src/components/admin/dashboard/ResumoTab.tsx`**: adicionar formulario de registro de melhorias
- **`supabase/functions/gerar-resumo-atualizacoes/index.ts`**: buscar melhorias e incluir no prompt

