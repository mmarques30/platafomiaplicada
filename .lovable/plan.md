
# Card de Documentos e Links na Visao Geral

Novo card abaixo do grafico e calendario na pagina "Visao Geral" do Projeto Skills, exibindo documentos e links importados pelo administrador em formato de tabela com paginacao de 3 itens por vez.

## O que sera exibido

O card combina dados de duas fontes ja existentes no banco:
- **documentos_skills** - arquivos enviados pelo admin (PDF, planilhas, etc.)
- **links_skills** - links uteis adicionados pelo admin

Ambos filtrados pela equipe do usuario logado (`equipeId`).

## Layout

```
+--------------------------------------------------+
| Documentos e Recursos             [Ver todos ->] |
|--------------------------------------------------|
| Tipo  | Titulo            | Data                 |
|-------|-------------------|----------------------|
| PDF   | Manual de IA      | 15/02/2026           |
| Link  | Guia Pratico      | 12/02/2026           |
| DOC   | Relatorio Q1      | 10/02/2026           |
+--------------------------------------------------+
  Mostrando 3 de 8
```

- Cada linha e clicavel: documentos abrem o arquivo, links abrem a URL
- Maximo 3 itens visiveis
- Botao "Ver todos" abre um Dialog/modal com a lista completa (tabela paginada ou scroll)
- Se nao houver documentos, exibe mensagem "Nenhum documento disponivel"

## Alteracoes

### 1. Novo componente: `DocumentosRecursosCard.tsx`

Caminho: `src/components/skills/visao-geral/DocumentosRecursosCard.tsx`

- Usa os hooks existentes `useDocumentosSkills` e `useLinksSkills` com o `equipeId` do `useSkillsMembro`
- Combina documentos e links em uma lista unica ordenada por data
- Exibe os 3 mais recentes em tabela
- Links clicaveis abrindo em nova aba (`target="_blank"`)
- Para documentos com `arquivo_url`, gera URL publica do bucket `documentos-skills`
- Botao "Ver todos" abre um `Dialog` com a lista completa

### 2. Alterar `ProjetoSkills.tsx`

Adicionar o novo componente abaixo de `GraficoCalendarioSection`.

## Detalhes tecnicos

| Arquivo | Alteracao |
|---|---|
| `src/components/skills/visao-geral/DocumentosRecursosCard.tsx` | Novo componente - card com tabela de documentos/links, 3 por vez, dialog para ver todos |
| `src/pages/skills/ProjetoSkills.tsx` | Importar e renderizar `DocumentosRecursosCard` abaixo do grafico |

### Dependencias reutilizadas (sem criar nada novo no backend)

- `useDocumentosSkills(equipeId)` - ja existe
- `useLinksSkills(equipeId)` - ja existe
- `useSkillsMembro()` - para obter `equipeId`
- Componentes UI: `Card`, `Dialog`, `Table` do shadcn
