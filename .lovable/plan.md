

# Transformar Métodos em Arsenal IA

## Banco de dados

**Migration** — adicionar 4 colunas à tabela `metodos_aplicar`:

```sql
ALTER TABLE metodos_aplicar ADD COLUMN tipo text DEFAULT 'skill';
ALTER TABLE metodos_aplicar ADD COLUMN ferramenta text;
ALTER TABLE metodos_aplicar ADD COLUMN nivel text DEFAULT 'intermediario';
ALTER TABLE metodos_aplicar ADD COLUMN imagem_url text;
```

- `tipo`: skill | prompt_master | artigo | documento
- `ferramenta`: Claude, ChatGPT, Gemini, Copilot, Perplexity, Midjourney
- `nivel`: iniciante, intermediario, avancado

## Arquivos a modificar

| Arquivo | Ação |
|---|---|
| `src/lib/metodosCategories.ts` | Reescrever — exportar constantes de tipos, ferramentas e níveis |
| `src/components/admin/bibliotecas/MetodoModal.tsx` | Adicionar campos: tipo, ferramenta, nível, imagem_url |
| `src/components/admin/bibliotecas/MetodosTab.tsx` | Atualizar filtros (tipo + ferramenta), renomear label |
| `src/pages/MetodosAplicar.tsx` | Reescrever completo — hub visual com 2 abas |
| `src/pages/admin/GerenciarBibliotecas.tsx` | Label da aba Métodos → "Arsenal IA" |
| `src/components/layout/AppSidebar.tsx` | Label do menu lateral → "Arsenal IA" |

## Página do usuário (MetodosAplicar.tsx)

**Header**: PageTitle primary="Arsenal" secondary="IA" com subtítulo descritivo

### Aba Skills (default)
- Grid de 6 cards grandes, um por ferramenta (Claude, ChatGPT, Gemini, Copilot, Perplexity, Midjourney)
- Cada card mostra ícone/logo da ferramenta, nome e contagem de skills disponíveis
- Ao clicar numa ferramenta, filtra e exibe os cards de skills daquela ferramenta abaixo
- Cards de skill: título, descrição curta, badge de nível, botão "Acessar"

### Aba Biblioteca
- Sub-filtro por tipo: Prompt Masters, Artigos, Documentos
- Cards visuais com título, descrição, badge de tipo, botão acessar
- Aba Materiais mantida como está (terceira aba)

## Admin (MetodoModal.tsx)

Novos campos no formulário:
- **Tipo** (select): Skill, Prompt Master, Artigo, Documento
- **Ferramenta** (select, visível quando tipo = Skill): 6 ferramentas
- **Nível** (select): Iniciante, Intermediário, Avançado
- **Imagem URL** (input opcional)

## Detalhes técnicos

- Rota permanece `/metodos-aplicar` para não quebrar links
- Hooks existentes continuam funcionando, passam a incluir novos campos
- Campo `categoria` mantido para compatibilidade, filtro principal agora é `tipo` + `ferramenta`
- Sidebar label muda de "Métodos" para "Arsenal IA"

