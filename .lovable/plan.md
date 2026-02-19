

# Explorar Todas as Trilhas com Filtros

## Problema atual
A pagina `/trilhas` mostra apenas as **3 trilhas mais recentes** com no maximo 20 videos. Existem **5 trilhas ativas** com **46 videos** no total, mas o mentorado nao consegue acessar trilhas mais antigas.

## Solucao

Reestruturar a pagina `/trilhas` para ter **duas secoes**:

### 1. Secao "Ultimos conteudos" (topo)
Manter o comportamento atual como preview -- os 3 carrosseis mais recentes com os cards no formato Reels (aspecto 9/16), sem alterar tamanhos.

### 2. Nova secao "Todas as Trilhas" (abaixo)
Uma grade com **todas as 5 trilhas ativas**, cada uma como um card visual (usando imagem da trilha) com:
- Nome da trilha
- Categoria (nucleo, profissao, aulas semanais)
- Numero da trilha na ordem (Trilha 1, 2, 3...)
- Quantidade de videos
- Link para acessar a trilha completa

### 3. Barra de filtros
Acima da grade "Todas as Trilhas", incluir filtros simples:
- **Ordenar por**: Mais recentes / Mais antigos / Ordem padrao
- **Filtrar por categoria**: Todas / nucleo / profissao / aulas semanais

## Detalhes tecnicos

### Arquivo: `src/pages/Trilhas.tsx`
- Adicionar a secao "Todas as Trilhas" abaixo do componente `UltimosConteudos`
- Importar o novo componente `TodasAsTrilhas`

### Novo arquivo: `src/components/dashboard/TodasAsTrilhas.tsx`
- Query: buscar todas as trilhas ativas com `visivel_mentorados = true`, incluindo contagem de videos
- Filtros locais (useState) para ordenacao e categoria
- Renderizar usando o componente `TrilhaCard` existente (que ja tem o visual com imagem e aspect ratio grande)
- Exibir label "Trilha N" baseado no campo `ordem`
- Grid responsivo: 1 coluna mobile, 2 tablet, 3-4 desktop

### Componentes mantidos sem alteracao
- `VideoCardVertical` -- formato Reels preservado
- `TrilhaCarousel` -- carrosseis preservados
- `UltimosConteudos` -- secao de recentes inalterada
- `TrilhaCard` -- card visual reutilizado na grade

### O que NAO muda
- Nenhum card tera seu tamanho reduzido
- O formato Reels (9/16) dos video cards continua identico
- Os carrosseis existentes continuam funcionando normalmente

