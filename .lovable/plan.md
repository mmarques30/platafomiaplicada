

# Corrigir Entregas Equipe no Admin e Tamanho dos Cards

## Problemas Identificados

### 1. Entregas Equipe no Admin fica carregando para sempre

A coluna `responsavel_id` na tabela `entregas_equipe_skills` **nao tem foreign key** para a tabela `profiles`. O hook `useEntregasEquipe` faz um join `profiles:responsavel_id (nome_completo, avatar_url)` que requer essa FK para funcionar. O PostgREST retorna erro porque nao consegue resolver o relacionamento, e o componente so verifica `isLoading` sem tratar o estado de erro -- resultado: spinner eterno.

Da mesma forma, tambem falta FK para `editado_por` -> `profiles`, embora nao seja usada no select atual.

**Solucao**: Criar migration adicionando a FK de `responsavel_id` para `profiles(id)` e tratar o estado de erro no componente.

### 2. Cards muito grandes na view dos membros

Os cards de entregas em `ProjetoSkillsEntregas.tsx` usam layout `grid gap-3` em coluna unica, ocupando toda a largura da pagina. Isso faz com que cada card se estenda horizontalmente alem do necessario.

**Solucao**: Alterar o grid para usar 2 colunas em telas medias e 3 em telas grandes, com cards mais compactos.

## Detalhes Tecnicos

### Migration SQL

```text
ALTER TABLE public.entregas_equipe_skills
ADD CONSTRAINT entregas_equipe_skills_responsavel_id_fkey
FOREIGN KEY (responsavel_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
```

### Tratar erro no componente `SkillsEntregasEquipeTab.tsx`

Adicionar verificacao de estado de erro alem de `isLoading` para exibir mensagem adequada ao inves de spinner infinito.

### Tratar erro no hook `useEntregasEquipe.ts`

Expor `isError` do useQuery para os componentes consumidores.

### Layout dos cards em `ProjetoSkillsEntregas.tsx`

Mudar de:
```text
<div className="grid gap-3">
```

Para:
```text
<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
```

E ajustar o conteudo interno dos cards para funcionar bem em tamanhos menores (truncar textos, reduzir paddings).

## Arquivos Modificados

- **Migration SQL**: adicionar FK de `responsavel_id` para `profiles(id)`
- `src/hooks/useEntregasEquipe.ts` -- expor `isError` do useQuery
- `src/components/admin/skills/SkillsEntregasEquipeTab.tsx` -- tratar estado de erro
- `src/components/skills/ProjetoSkillsEntregas.tsx` -- layout grid responsivo para cards menores

## Resultado

- Aba "Entregas Equipe" no admin carrega corretamente (ou mostra mensagem vazia se nao houver dados)
- Cards de entregas no painel dos membros ficam menores e organizados em grid responsivo
- Erros de query sao tratados com mensagem amigavel ao inves de spinner infinito

