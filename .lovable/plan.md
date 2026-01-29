

# Implementar Toggle Ativar/Desativar Formulários do Sistema

## Problema Identificado
O componente `FormulariosDoSistema.tsx` atualmente:
1. **Filtra apenas formulários ativos** (linha 53: `.eq('ativo', true)`)
2. **Não possui Switch** para ativar/desativar
3. **Tem emojis nos labels** de categoria (linhas 106-110)

---

## Mudanças a Implementar

### Arquivo: `src/components/admin/formularios/FormulariosDoSistema.tsx`

| Item | Ação |
|------|------|
| Query de formulários | Remover filtro `.eq('ativo', true)` para mostrar todos |
| Importar Switch | Adicionar `import { Switch } from "@/components/ui/switch"` |
| Importar useMutation | Adicionar `useMutation` e `useQueryClient` |
| Labels de categoria | Remover emojis |
| Toggle Switch | Adicionar no header de cada card |
| Visual de inativos | Cards inativos com opacidade reduzida + badge "Inativo" |
| Mutation | Criar função para atualizar status `ativo` na tabela |

---

## Código Atualizado

### 1. Remover filtro `.eq('ativo', true)`
```typescript
// ANTES (linha 53)
.eq('ativo', true)

// DEPOIS
// Sem filtro - mostra todos os formulários
```

### 2. Remover emojis dos labels
```typescript
// ANTES
const categoriaLabels: Record<string, string> = {
  'diagnostico': '📊 Diagnósticos',
  'pesquisa': '📝 Pesquisas',
  'candidatura': '👑 Candidaturas',
};

// DEPOIS
const categoriaLabels: Record<string, string> = {
  'diagnostico': 'Diagnósticos',
  'pesquisa': 'Pesquisas',
  'candidatura': 'Candidaturas',
};
```

### 3. Adicionar Switch no header do card
```typescript
<CardHeader className="pb-3">
  <div className="flex items-start justify-between">
    <div className="p-2 rounded-lg bg-primary/10">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div className="flex items-center gap-2">
      {!form.ativo && (
        <Badge variant="secondary" className="text-xs">
          Inativo
        </Badge>
      )}
      <Switch
        checked={form.ativo}
        onCheckedChange={(ativo) => toggleAtivo.mutate({ id: form.id, ativo })}
      />
    </div>
  </div>
  ...
</CardHeader>
```

### 4. Card com visual diferenciado quando inativo
```typescript
<Card 
  className={cn(
    "border border-primary/20 hover:border-primary/40 transition-colors",
    !form.ativo && "opacity-60"
  )}
>
```

### 5. Mutation para toggle
```typescript
const queryClient = useQueryClient();

const toggleAtivo = useMutation({
  mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
    const { error } = await supabase
      .from('formularios_sistema')
      .update({ ativo })
      .eq('id', id);
    
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['formularios-sistema'] });
    toast.success("Status atualizado!");
  },
  onError: () => {
    toast.error("Erro ao atualizar status");
  },
});
```

---

## Resultado Esperado

```text
┌─────────────────────────────────────────┐
│ [Icon]           [Inativo] [Switch ⚪] │
│ ─────────────────────────────────────── │
│ Titulo do Formulario                    │
│ ─────────────────────────────────────── │
│ Descricao...                            │
│ 👥 X respostas    [Y completos]         │
│ [Respostas] [📄] [📊]                    │
└─────────────────────────────────────────┘
```

- **Switch ON (verde)**: Formulário ativo - aparece no dashboard do usuário
- **Switch OFF (cinza)**: Formulário inativo - não aparece no dashboard, card com opacidade reduzida
- **Labels sem emojis**: "Diagnósticos", "Pesquisas", "Candidaturas"

---

## Fluxo de Funcionamento

1. Admin acessa `/admin/bibliotecas?tab=formularios`
2. Vê **todos** os formulários (ativos e inativos)
3. Formulários inativos aparecem com opacidade reduzida + badge "Inativo"
4. Admin clica no Switch para ativar/desativar
5. Tabela `formularios_sistema` é atualizada
6. No dashboard do usuário, apenas formulários com `ativo = true` aparecem

