

# Ajustes no Formulario de IA Copie e Use (Admin)

## Resumo
Duas alteracoes no modal de criacao/edicao de itens "IA Copie e Use":

1. **Remover o campo "IA Recomendada (opcional)"** - e redundante com o seletor de "Ferramentas Recomendadas" que ja existe logo abaixo.
2. **Transformar o campo "Categoria" de texto livre para dropdown com categorias fixas.**

## Alteracoes

### Arquivo: `src/components/admin/bibliotecas/IACopieUseModal.tsx`

**1. Remover campo "IA Recomendada"**
- Remover as linhas 247-249 (label + input do campo `ia_recomendada`)
- Remover `ia_recomendada: ""` do reset do formulario (linha 90)

**2. Substituir Input de Categoria por Select dropdown**
- Importar `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` do componente UI
- Substituir o `<Input>` de categoria (linhas 243-245) por um `<Select>` com opcoes fixas
- Categorias fixas baseadas nas existentes + categorias uteis:
  - Automacao
  - Comunicacao
  - Criacao de Conteudo
  - Financas
  - Gestao de Projetos
  - Marketing
  - Produtividade
  - Templates / Carreira / Coaching
  - Vendas
  - Analise de Dados
  - Atendimento ao Cliente
  - Recursos Humanos

### Arquivo novo: `src/lib/iaCopieUseCategories.ts`
- Criar arquivo com a lista de categorias fixas exportada como constante (mesmo padrao do `src/lib/metodosCategories.ts` ja existente)

## Resultado
- Formulario mais limpo sem campo redundante
- Categorias padronizadas via dropdown, evitando inconsistencias de digitacao

