

# Fix: Formatação estruturada do Resumo de Atualizações

## Problema
A mensagem do aviso é renderizada como texto puro (`<p className="text-sm whitespace-pre-wrap">`) na linha 107 do `Notificacoes.tsx`. O conteúdo gerado pela IA contém formatação com `*texto*` (negrito) e categorias como "Dicas", "Newsletters" etc., mas tudo aparece como texto corrido sem estrutura visual.

## Solução
Criar uma função `formatarMensagem` que transforma o texto em JSX estruturado:
- Linhas que são categorias sozinhas (ex: "Dicas", "Newsletters", "Notícias", "Vídeos") → renderizar como `<h4>` com margem superior
- Texto entre `*asteriscos*` → renderizar como `<strong>`
- Linhas normais → renderizar como `<p>`

## Arquivo

| Arquivo | Ação |
|---|---|
| `src/pages/Notificacoes.tsx` | Editar |

## Detalhes

1. Adicionar função `formatarMensagem(texto: string)` que:
   - Divide o texto por `\n`
   - Detecta linhas de categoria (texto curto sem asteriscos, seguido por itens)
   - Converte `*texto*` em `<strong>`
   - Retorna array de elementos JSX com espaçamento adequado

2. Linha 107: trocar `<p className="text-sm whitespace-pre-wrap">{removeEmojis(aviso.mensagem)}</p>` por `<div className="text-sm space-y-1">{formatarMensagem(removeEmojis(aviso.mensagem))}</div>`

