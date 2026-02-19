
# Nova classificacao para trilhas + layout carrossel

## 1. Nova coluna `classificacao` na tabela `trilhas`

Adicionar um campo `classificacao` (text, nullable) na tabela `trilhas`. Este campo serve como um rotulo visivel para o aluno, descrevendo o que ele vai aprender -- diferente da `categoria` atual que e organizacional/interna.

**Valores sugeridos iniciais:**
- Aprendizado Inicial
- Produtividade
- Rotina
- Carreira
- Avancado
- Bonus

A coluna `categoria` existente permanece intacta.

## 2. Painel Admin - campo de classificacao no TrilhaModal

No modal de criacao/edicao de trilhas (`TrilhaModal.tsx`), adicionar um novo campo "Classificacao" com o mesmo sistema hibrido (Select + Input para nova classificacao), posicionado logo abaixo do campo de categoria existente.

## 3. Layout carrossel na pagina de Trilhas

Substituir o grid atual (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`) por um carrossel horizontal usando o componente Embla Carousel ja existente no projeto (`src/components/ui/carousel.tsx`).

- Cards mantém o mesmo tamanho e altura atuais
- Setas de navegacao (esquerda/direita) para rolar horizontalmente
- Em telas grandes, mostra 3-4 cards visiveis por vez
- Em mobile, mostra 1 card por vez com swipe
- Quando ha filtro de classificacao ativo, o carrossel mostra apenas as trilhas filtradas

## 4. Filtro por classificacao na pagina do aluno

Trocar o filtro de `categoria` atual por `classificacao` no dropdown de filtros da pagina de trilhas do aluno. Isso permite filtrar por "Produtividade", "Aprendizado Inicial", etc. ao inves de "nucleo", "profissao".

## Detalhes tecnicos

### Migracao SQL
```sql
ALTER TABLE trilhas ADD COLUMN classificacao text;
```

### Arquivos modificados

1. **`src/components/admin/content/TrilhaModal.tsx`**
   - Novo campo Select + Input para `classificacao`
   - Busca classificacoes existentes do banco (mesmo padrao da categoria)

2. **`src/components/dashboard/TodasAsTrilhas.tsx`**
   - Buscar campo `classificacao` na query
   - Substituir grid por Carousel/CarouselContent/CarouselItem com CarouselPrevious e CarouselNext
   - Trocar filtro de `categoria` por `classificacao`
   - Cada CarouselItem mostra um card de trilha com informacoes abaixo (titulo, classificacao, total de videos)
   - Configurar Embla para mostrar multiplos slides por vez (basis parcial)

3. **`src/components/shared/TrilhaCard.tsx`**
   - Sem alteracoes

### Resultado visual

```text
+--------------------------------------------------+
|  Trilhas de Aprendizado    [Ordenar] [Classif.]  |
+--------------------------------------------------+
|                                                    |
|  <  [Card 1]  [Card 2]  [Card 3]  [Card 4]  >   |
|                                                    |
+--------------------------------------------------+
```

Setas laterais para navegar. Swipe em mobile.
