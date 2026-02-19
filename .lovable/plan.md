
# Agrupar Modulos por Trilha no Dropdown de Videos

## Problema
Ao adicionar ou editar um video, o dropdown de modulos exibe uma lista plana com "Trilha -- Modulo", dificultando a navegacao quando ha muitos modulos. O ideal e agrupar os modulos por trilha, com a trilha como cabecalho visual.

## Solucao
Modificar o `SelectContent` no componente `VideoModal.tsx` para agrupar os modulos por trilha usando `SelectGroup` e `SelectLabel` do Radix UI.

## Detalhes tecnicos

### Arquivo: `src/components/admin/content/VideoModal.tsx`

**O que muda (linhas 296-303)**:

Substituir a listagem plana:
```tsx
{modulos?.map((modulo: any) => (
  <SelectItem key={modulo.id} value={modulo.id}>
    {modulo.trilha?.titulo} — {modulo.titulo}
  </SelectItem>
))}
```

Por uma listagem agrupada:
```tsx
{Object.entries(
  (modulos || []).reduce((groups, modulo) => {
    const trilhaTitulo = modulo.trilha?.titulo || "Sem Trilha";
    if (!groups[trilhaTitulo]) groups[trilhaTitulo] = [];
    groups[trilhaTitulo].push(modulo);
    return groups;
  }, {} as Record<string, any[]>)
).map(([trilhaTitulo, modulosDaTrilha]) => (
  <SelectGroup key={trilhaTitulo}>
    <SelectLabel>{trilhaTitulo}</SelectLabel>
    {modulosDaTrilha.map((modulo) => (
      <SelectItem key={modulo.id} value={modulo.id}>
        {modulo.titulo}
      </SelectItem>
    ))}
  </SelectGroup>
))}
```

**Imports**: Adicionar `SelectGroup` e `SelectLabel` ao import existente do `@/components/ui/select`.

Nenhuma mudanca no hook `useModulos` -- os dados ja vem com a trilha associada e ordenados por `ordem`.
