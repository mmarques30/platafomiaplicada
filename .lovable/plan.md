

# Adicionar alternancia Cards / Tabela na pagina IA Copie e Use

## Contexto

O arquivo ja possui os imports de `LayoutGrid`, `List`, `IACopieUseRow` e o estado `viewMode` declarado (linha 28), mas nao estao sendo usados. Basta adicionar os botoes de alternancia e a renderizacao condicional.

## Alteracoes no arquivo `src/pages/IACopieUse.tsx`

### 1. Botoes de alternancia ao lado do contador de resultados (linhas 92-97)

Substituir o bloco do contador por uma div flex com o contador a esquerda e os botoes de toggle a direita:

```tsx
{filteredIAs && (
  <div className="flex items-center justify-between">
    <p className="text-sm text-muted-foreground">
      {filteredIAs.length} {filteredIAs.length === 1 ? 'resultado' : 'resultados'} encontrados
    </p>
    <div className="flex items-center gap-1">
      <Button
        variant={viewMode === "cards" ? "default" : "ghost"}
        size="icon"
        onClick={() => setViewMode("cards")}
      >
        <LayoutGrid className="w-4 h-4" />
      </Button>
      <Button
        variant={viewMode === "tabela" ? "default" : "ghost"}
        size="icon"
        onClick={() => setViewMode("tabela")}
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  </div>
)}
```

### 2. Renderizacao condicional dos itens (linhas 117-126)

Onde hoje renderiza apenas o grid de cards, adicionar condicao por `viewMode`:

- `"cards"`: manter o grid atual com `IACopieUseCard`
- `"tabela"`: renderizar um `Card` contendo os `IACopieUseRow` empilhados

```tsx
{viewMode === "cards" ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
    {visibleIAs.map((ia) => (
      <IACopieUseCard key={ia.id} ia={ia} onClick={() => setSelectedIA(ia)} />
    ))}
  </div>
) : (
  <Card>
    {visibleIAs.map((ia) => (
      <IACopieUseRow key={ia.id} ia={ia} onClick={() => setSelectedIA(ia)} />
    ))}
  </Card>
)}
```

### 3. Skeletons adaptados (linhas 99-115)

Adicionar condicao para o loading tambem respeitar o `viewMode`:

- `"cards"`: manter o grid de skeletons atual
- `"tabela"`: renderizar skeletons em formato de linhas dentro de um Card

O botao "Ver mais" e o estado vazio continuam funcionando identicamente em ambas as visoes, sem alteracao.

