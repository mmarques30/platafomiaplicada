
# Plano: Melhorar Campos Autor e Ordem no Modal de Conteúdo

## Problemas Identificados

### 1. Campo "Autor" é texto livre
Atualmente, o campo "Autor" (linhas 660-666 do `ConteudoModal.tsx`) é um `<Input>` de texto livre:
```tsx
<Input
  {...register('autor')}
  placeholder="Nome do autor"
/>
```

O usuário deseja que seja uma **lista suspensa** baseada nos membros cadastrados (profiles).

### 2. Campo "Ordem de Exibição" é manual
Atualmente, o campo "Ordem" (linhas 668-675) é um input numérico que exige entrada manual:
```tsx
<Input
  {...register('ordem', { valueAsNumber: true })}
  type="number"
  placeholder="0"
/>
```

O usuário deseja que a ordem seja **calculada automaticamente** baseada nos conteúdos já existentes.

---

## Solução

### Correção 1: Autor como Lista Suspensa

Substituir o `<Input>` do campo Autor por um `<Select>` que lista os membros da comunidade (já disponíveis via `useCommunityMembers`):

```tsx
<div className="space-y-2">
  <Label>Autor</Label>
  <Select
    value={watch('autor') || ''}
    onValueChange={(v) => setValue('autor', v || '')}
  >
    <SelectTrigger>
      <SelectValue placeholder="Selecione um autor..." />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="">Nenhum</SelectItem>
      {members.map(member => (
        <SelectItem key={member.id} value={member.nome_completo}>
          {member.nome_completo}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

### Correção 2: Ordem Automática

Modificar o hook `useConteudosDashboardAdmin` para expor a próxima ordem disponível e calcular automaticamente quando um novo conteúdo é criado:

1. **Adicionar função para calcular próxima ordem**:
   - Consultar o valor máximo de `ordem` existente
   - Retornar `maxOrdem + 1` para novos conteúdos

2. **No modal**: 
   - Remover o campo de input manual da ordem
   - Ao criar novo conteúdo, usar a próxima ordem automaticamente
   - Ao editar, manter a ordem existente (ou permitir ajuste via drag-and-drop futuro)

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/hooks/admin/useConteudosDashboardAdmin.tsx` | Adicionar função `getNextOrdem()` que retorna a próxima ordem disponível |
| `src/components/admin/content/ConteudoModal.tsx` | Trocar input de Autor por Select com membros; remover input de Ordem manual e usar valor automático |

---

## Detalhes Técnicos

### Hook - Nova função para próxima ordem

```typescript
export function useNextOrdem() {
  const { data: conteudos } = useConteudosDashboardAdmin();
  
  const nextOrdem = useMemo(() => {
    if (!conteudos?.length) return 1;
    const maxOrdem = Math.max(...conteudos.map(c => c.ordem));
    return maxOrdem + 1;
  }, [conteudos]);
  
  return nextOrdem;
}
```

### Modal - Campo Autor

**Antes:**
```tsx
<div className="space-y-2">
  <Label>Autor</Label>
  <Input
    {...register('autor')}
    placeholder="Nome do autor"
  />
</div>
```

**Depois:**
```tsx
<div className="space-y-2">
  <Label>Autor</Label>
  <Select
    value={watch('autor') || ''}
    onValueChange={(v) => setValue('autor', v || '')}
  >
    <SelectTrigger>
      <SelectValue placeholder="Selecione um autor..." />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="">Nenhum</SelectItem>
      {members.map(member => (
        <SelectItem key={member.id} value={member.nome_completo}>
          {member.nome_completo}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

### Modal - Ordem Automática

**Antes:**
```tsx
<div className="space-y-2">
  <Label>Ordem de Exibição</Label>
  <Input
    {...register('ordem', { valueAsNumber: true })}
    type="number"
    placeholder="0"
  />
</div>
```

**Depois:**
- Remover este campo do formulário
- No `useEffect` de inicialização, definir `ordem` automaticamente para novos conteúdos:

```tsx
// No início do componente
const nextOrdem = useNextOrdem();

// No useEffect quando não é edição
useEffect(() => {
  if (!conteudo) {
    // Novo conteúdo - usar próxima ordem
    setValue('ordem', nextOrdem);
  }
}, [conteudo, nextOrdem, setValue]);
```

---

## Resultado Esperado

### Campo Autor
```text
┌─────────────────────────────────────┐
│ Autor                               │
│ ┌─────────────────────────────────┐ │
│ │ Selecione um autor...         ▼ │ │
│ ├─────────────────────────────────┤ │
│ │ Nenhum                          │ │
│ │ João Silva                      │ │
│ │ Maria Santos                    │ │
│ │ Pedro Oliveira                  │ │
│ │ ...                             │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Ordem de Exibição
- **Novo conteúdo**: Ordem calculada automaticamente (próximo número disponível)
- **Edição**: Mantém a ordem existente
- Campo removido da interface (ordem gerenciada internamente)
