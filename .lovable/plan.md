

## Tornar a seção "Documentos" recolhível

### O que muda

Na página `/mentoria/projeto/.../documentos` (e equivalente em "Meu Sistema"), o bloco com as tabs **Arquivos / Anotações / Links / Reports / Contrato** ocupa muito espaço vertical. Vou transformar esse bloco inteiro num painel **expandir/recolher**, com estado persistido em `localStorage` para lembrar a preferência do usuário entre sessões.

### Comportamento

- Header clicável acima das tabs com:
  - Ícone `FolderOpen` + título **"Documentos do Projeto"**
  - Resumo à direita: badges com contagens (ex.: `3 arquivos · 0 anotações · 1 link`)
  - Ícone `ChevronDown` que gira 180° quando expandido
- Clique no header → recolhe/expande todo o conteúdo (TabsList + TabsContent).
- Estado padrão: **expandido**.
- Persistência: chave `documentos-projeto-expandido-{contratoId}` em `localStorage`.
- Animação suave de altura (Tailwind `transition-all` + `max-h`).

### Implementação

Usar o componente `Collapsible` (Radix) que já existe em `@/components/ui/collapsible`:

```tsx
<Collapsible open={expandido} onOpenChange={setExpandido}>
  <CollapsibleTrigger asChild>
    <button className="w-full flex items-center justify-between ...">
      ...header...
    </button>
  </CollapsibleTrigger>
  <CollapsibleContent>
    <Tabs defaultValue="arquivos">...</Tabs>
  </CollapsibleContent>
</Collapsible>
```

### Arquivos editados

1. `src/pages/MentoriaDocumentos.tsx` — envolver o bloco `<Tabs>` (linhas ~225–...) em `<Collapsible>` com header próprio e estado persistido.
2. `src/pages/MeuSistemaDocumentos.tsx` — mesma alteração, idêntica.

Sem mudanças em hooks, banco ou outros componentes. As tabs internas continuam funcionando exatamente como hoje.

### Resultado esperado

- Usuário pode **recolher** toda a seção de documentos com 1 clique para focar no "Resumo do Projeto" abaixo.
- Ao reabrir a página, o estado anterior (recolhido/expandido) é lembrado por projeto.
- Resumo no header dá visibilidade rápida das contagens mesmo com a seção recolhida.

