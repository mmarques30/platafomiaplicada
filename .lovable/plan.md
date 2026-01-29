

# Plano: Permitir Mentorados Adicionar Ferramentas na Aba "Criadores"

## Contexto

Atualmente, a aba **Criadores** em `/videos-bonus?tab=criadores` exibe materiais da tabela `materiais_comunidade`, mas as políticas RLS permitem INSERT apenas para admins. Mentorados (Academy/Business) precisam poder compartilhar suas próprias ferramentas com a comunidade.

## Problemas Identificados

1. **Política RLS bloqueando mentorados**: A tabela `materiais_comunidade` tem RLS que só permite INSERT para admins
2. **Sem botão "Adicionar"**: O componente `CriadoresComunidadeTab.tsx` não tem opção para mentorados adicionarem materiais
3. **Modal existe apenas no admin**: O modal de criação `MaterialCriadoresModal.tsx` está em `/admin/comunidade` e é muito complexo

---

## Solução

### 1. Atualizar Políticas RLS da Tabela `materiais_comunidade`

Permitir que mentorados possam inserir materiais onde eles são o criador:

```sql
-- Remover política antiga de INSERT
DROP POLICY IF EXISTS "materiais_comunidade_insert_policy" ON materiais_comunidade;

-- Nova política: Admin pode inserir qualquer coisa, mentorados podem inserir como criador
CREATE POLICY "materiais_comunidade_insert_policy"
ON materiais_comunidade FOR INSERT TO authenticated
WITH CHECK (
  -- Admin pode inserir qualquer registro
  (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')) 
  OR 
  -- Mentorados podem inserir apenas onde são o criador
  (criador_id = auth.uid() AND has_role(auth.uid(), 'mentorado'))
);

-- Mentorados podem atualizar seus próprios materiais
DROP POLICY IF EXISTS "materiais_comunidade_update_policy" ON materiais_comunidade;

CREATE POLICY "materiais_comunidade_update_policy"
ON materiais_comunidade FOR UPDATE TO authenticated
USING (
  (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  OR
  (criador_id = auth.uid())
)
WITH CHECK (
  (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  OR
  (criador_id = auth.uid())
);
```

---

### 2. Criar Hook para Mentorados Adicionarem Materiais

**Arquivo:** `src/hooks/useMaterialComunidadeSubmit.tsx`

Hook simplificado para mentorados enviarem materiais:
- Buscar materiais do próprio usuário
- Mutation para criar material
- Upload de arquivos para storage

```typescript
export function useMaterialComunidadeSubmit() {
  const { user } = useAuth();
  
  // Meus materiais
  const { data: meusMateriais } = useQuery({...});
  
  // Criar material
  const createMaterial = useMutation({
    mutationFn: async (material) => {
      await supabase.from("materiais_comunidade").insert({
        ...material,
        criador_id: user.id,
        adicionado_por: user.id,
        ativo: false, // Pendente de aprovação
      });
    },
  });
  
  return { meusMateriais, createMaterial };
}
```

---

### 3. Criar Modal Simplificado para Mentorados

**Arquivo:** `src/components/comunidade/AdicionarMaterialModal.tsx`

Modal mais simples que o do admin, com campos:
- **Nome** (obrigatório)
- **Categoria** (ChatGPT, Claude, Notion, Canva, etc.)
- **Tipo** (Prompt, Documento, Template, etc.)
- **Prompt/Orientação** (textarea para conteúdo)
- **Upload de arquivos** (PDF, PPTX, links)
- **Links externos** (opcional)

Interface com avatar do usuário exibindo iniciais.

---

### 4. Atualizar `CriadoresComunidadeTab.tsx`

Adicionar botão "Contribuir com a Comunidade" para mentorados (Academy/Business):

```typescript
// No header, ao lado dos filtros
{(isAcademy || isBusiness) && !isVisitante && (
  <Button onClick={() => setShowAddModal(true)}>
    <Plus className="w-4 h-4 mr-2" />
    Contribuir
  </Button>
)}

// Modal de adição
<AdicionarMaterialModal 
  open={showAddModal} 
  onOpenChange={setShowAddModal} 
/>
```

---

### 5. Fluxo de Moderação

Os materiais criados por mentorados:
1. São inseridos com `ativo = false` (pendente)
2. Admin vê na aba "Criadores" do painel admin
3. Admin ativa/aprova o material
4. Material aparece para toda a comunidade

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| Migration SQL | Atualizar RLS policies |
| `src/hooks/useMaterialComunidadeSubmit.tsx` | **CRIAR** - Hook para mentorados |
| `src/components/comunidade/AdicionarMaterialModal.tsx` | **CRIAR** - Modal simplificado |
| `src/components/comunidade/CriadoresComunidadeTab.tsx` | **MODIFICAR** - Adicionar botão |

---

## Fluxo para Usuários

```text
Mentorado (Academy/Business):
  ├─ Acessa Comunidade > Sala de Aula > Criadores
  ├─ Clica em "Contribuir"
  ├─ Preenche: Nome, Categoria, Tipo, Prompt/Orientação
  ├─ Faz upload de PDF/PPTX ou adiciona links
  ├─ Envia → Material fica pendente de aprovação
  └─ Avatar com iniciais do nome aparece no card após aprovação

Admin:
  ├─ Acessa Comunicações > Comunidade > Criadores
  ├─ Vê materiais pendentes (ativo=false)
  ├─ Ativa o material
  └─ Material visível para toda a comunidade

Visitante:
  ├─ Acessa Sala de Aula > Criadores
  └─ Apenas visualiza (sem botão "Contribuir")
```

---

## Categorias Disponíveis

Mantendo consistência com o sistema existente:
- ChatGPT
- Claude
- Midjourney
- Canva
- Notion
- Excel
- Outro

## Tipos de Material

- Prompt
- Imagem
- Documento
- Template
- Outro

---

## Resultado Esperado

- Mentorados Academy e Business podem contribuir com ferramentas
- Materiais ficam pendentes até aprovação do admin
- Avatar do criador aparece com as iniciais (como já funciona)
- Sistema de moderação evita spam/conteúdo inadequado
- Visitantes podem visualizar mas não contribuir

