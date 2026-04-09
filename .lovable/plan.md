

# Reestruturar MeuSistemaDocumentos — Interativo e Visual

## Problemas identificados

1. **Arquivos e Anotações em `readOnly`** — A página passa `readOnly` para `ArquivosProjetoSection` e `NotasProjetoSection`, impedindo o mentorado de fazer upload de arquivos ou criar anotações
2. **Dados do Contrato como Collapsible** — Fica escondido e pouco acessível. Deveria ser uma sub-aba junto com as outras
3. **Página pouco interativa** — Falta uma visão 360 do projeto. Abaixo das tabs, poderia ter um resumo visual com contadores e status

## Solução

**Arquivo**: `src/pages/MeuSistemaDocumentos.tsx`

### 1. Remover `readOnly` dos componentes
- `ArquivosProjetoSection` → sem `readOnly` (permite upload/delete)
- `NotasProjetoSection` → sem `readOnly` (permite criar/editar/excluir anotações)
- Links → manter somente leitura (links são geridos pelo admin)

### 2. Dados do Contrato → Nova tab "Contrato"
- Remover o `Collapsible` do final da página
- Adicionar uma 5ª tab "Contrato" com ícone `Shield` após "Reports"
- Mover todo o conteúdo do contrato (empresa, datas, valores, módulos, garantias) para dentro dessa tab

### 3. Painel de resumo visual abaixo das tabs
Adicionar uma seção fixa abaixo das tabs com 4 mini-cards de métricas:
- **Arquivos** — contador com ícone FileText
- **Anotações** — contador com ícone StickyNote
- **Links** — contador com ícone Link2
- **Reports** — contador com ícone FileText

Esses cards ficam sempre visíveis independente da tab ativa, dando a visão 360 do estado documental do projeto.

### Mudanças concretas

**Linha 102**: `<ArquivosProjetoSection contratoId={contrato.id} readOnly />` → `<ArquivosProjetoSection contratoId={contrato.id} />`

**Linha 106**: `<NotasProjetoSection contratoId={contrato.id} readOnly />` → `<NotasProjetoSection contratoId={contrato.id} />`

**Linhas 82-98 (TabsList)**: Adicionar 5ª tab "Contrato" com ícone Shield

**Após linha 201**: Adicionar `<TabsContent value="contrato">` com o conteúdo que está no Collapsible (linhas 214-261)

**Linhas 204-262**: Remover todo o bloco Collapsible

**Antes das Tabs (após PageTitle)**: Inserir grid de 4 mini stat-cards com contadores (arquivos, notas, links, reports) usando fundo escuro sólido conforme padrão Sistemas

