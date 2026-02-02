
# Plano: Corrigir Erro ao Editar Conteúdo de Criador

## Problema Identificado

O erro ocorre porque o componente `Select` do Radix UI **não aceita strings vazias** como valor em `SelectItem`. No código atual:

**Linha 672 do ConteudoModal.tsx:**
```tsx
<SelectItem value="">Nenhum</SelectItem>
```

Quando o usuário tenta editar um conteúdo do tipo "criador", o modal tenta renderizar o `Select` de Autor e quebra porque:
1. O valor `""` (string vazia) não é válido para `SelectItem`
2. Isso causa um erro de renderização que trava toda a página

## Solução

Substituir a string vazia por um valor placeholder como `"none"` ou `"_none"`, e ajustar a lógica para converter esse valor de volta para `null`/`""` ao salvar.

### Correção no Campo Autor (linhas 664-679):

**Antes:**
```tsx
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
```

**Depois:**
```tsx
<Select
  value={watch('autor') || '_none'}
  onValueChange={(v) => setValue('autor', v === '_none' ? '' : v)}
>
  <SelectTrigger>
    <SelectValue placeholder="Selecione um autor..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="_none">Nenhum</SelectItem>
    {members.map(member => (
      <SelectItem key={member.id} value={member.nome_completo}>
        {member.nome_completo}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

A mesma correção deve ser aplicada ao Select de "Criador" (criador_id) que está nas linhas 349-368.

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/admin/content/ConteudoModal.tsx` | Substituir `value=""` por `value="_none"` nos dois Select (Autor e Criador) e ajustar a lógica de conversão |

---

## Resultado Esperado

Após a correção:
- O modal de edição abrirá normalmente para conteúdos do tipo "criador"
- A opção "Nenhum" funcionará corretamente sem causar erros
- O campo será salvo como string vazia ou null no banco quando "Nenhum" for selecionado
