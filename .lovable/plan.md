
# Plano: Ranking Dinâmico de Ferramentas Baseado em Avaliações

## Situação Atual

O sistema de avaliações já está funcionando:
- Tabela `avaliacoes_ferramentas_ia` criada
- Trigger `update_ferramenta_rating_stats()` atualiza automaticamente `avaliacao_comunidade` e `total_avaliacoes_comunidade` na tabela `ferramentas_ia`
- Modal de detalhes permite avaliar ferramentas

**Problema:** O componente `FerramentasRanking.tsx` usa uma lista **hardcoded** de ferramentas:
```typescript
const ranking = ['claude', 'manus', 'gamma', 'chatgpt', 'perplexity'];
```

Isso ignora completamente as avaliações da comunidade e do mentor.

---

## Solução

Criar um ranking dinâmico que ordena ferramentas por uma **pontuação combinada**:

**Fórmula do Score:**
```
score = (avaliacao_mentor * peso_mentor) + (avaliacao_comunidade * peso_comunidade * fator_relevancia)
```

Onde:
- `peso_mentor` = 0.6 (60%)
- `peso_comunidade` = 0.4 (40%)
- `fator_relevancia` = min(1, total_avaliacoes / 10) - quanto mais avaliações, mais peso

Isso garante que ferramentas com poucas avaliações não dominem o ranking imediatamente.

---

## Mudanças Necessárias

### 1. Hook `useFerramentas.tsx`

Atualizar a query para ordenar por score combinado:

```typescript
export function useFerramentasIA() {
  return useQuery({
    queryKey: ["ferramentas-ia"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ferramentas_ia")
        .select("*")
        .eq("ativo", true)
        .order("avaliacao", { ascending: false }); // mantém ordem base

      if (error) throw error;
      
      // Calcular score combinado para ranking
      return data?.map(f => ({
        ...f,
        score_ranking: calcularScoreRanking(f)
      })).sort((a, b) => b.score_ranking - a.score_ranking);
    },
  });
}

function calcularScoreRanking(ferramenta: any): number {
  const avaliacaoMentor = ferramenta.avaliacao || 0;
  const avaliacaoComunidade = ferramenta.avaliacao_comunidade || 0;
  const totalAvaliacoes = ferramenta.total_avaliacoes_comunidade || 0;
  
  // Peso base: mentor 60%, comunidade 40%
  const pesoMentor = 0.6;
  const pesoComunidade = 0.4;
  
  // Fator de relevância: mais avaliações = mais confiável
  const fatorRelevancia = Math.min(1, totalAvaliacoes / 10);
  
  // Se não tem avaliações da comunidade, usa só do mentor
  if (totalAvaliacoes === 0) {
    return avaliacaoMentor;
  }
  
  return (avaliacaoMentor * pesoMentor) + 
         (avaliacaoComunidade * pesoComunidade * fatorRelevancia);
}
```

### 2. Componente `FerramentasRanking.tsx`

Remover a lista hardcoded e usar ordenação dinâmica:

```typescript
// ANTES (hardcoded):
const top5 = useMemo(() => {
  const ranking = ['claude', 'manus', 'gamma', 'chatgpt', 'perplexity'];
  return ranking.map(name => ferramentas.find(f => f.nome.toLowerCase().includes(name))).filter(Boolean);
}, [ferramentas]);

// DEPOIS (dinâmico):
const top5 = useMemo(() => {
  // Ferramentas já vêm ordenadas por score_ranking do hook
  // Pegar as 5 primeiras com avaliação válida
  return ferramentas
    .filter(f => (f.avaliacao || 0) > 0 || (f.avaliacao_comunidade || 0) > 0)
    .slice(0, 5);
}, [ferramentas]);
```

### 3. Exibir Score Combinado no Card

Atualizar o card para mostrar a avaliação combinada:

```typescript
{/* Avaliação Combinada */}
<div className="flex items-center gap-1.5 mt-3">
  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
  <span className="font-semibold text-sm">
    {ferramenta.score_ranking?.toFixed(1) || ferramenta.avaliacao_mari || 0}
  </span>
  <span className="text-xs text-muted-foreground">/ 5</span>
  {ferramenta.total_avaliacoes_comunidade > 0 && (
    <span className="text-xs text-muted-foreground ml-1">
      ({ferramenta.total_avaliacoes_comunidade} votos)
    </span>
  )}
</div>
```

---

## Fluxo do Ranking

```text
1. Usuário avalia ferramenta (1-5 estrelas)
        ↓
2. Trigger atualiza avaliacao_comunidade e total_avaliacoes na tabela
        ↓
3. Hook useFerramentasIA busca ferramentas e calcula score_ranking
        ↓
4. Componente FerramentasRanking exibe Top 5 ordenado por score
        ↓
5. Ranking atualiza dinamicamente conforme novas avaliações
```

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/hooks/useFerramentas.tsx` | Adicionar cálculo de `score_ranking` |
| `src/components/bibliotecas/FerramentasRanking.tsx` | Remover lista hardcoded, usar ordenação dinâmica |

---

## Resultado Esperado

- Ferramentas bem avaliadas pela comunidade sobem no ranking
- Avaliação do mentor ainda tem peso significativo (60%)
- Conforme mais pessoas avaliam, o peso da comunidade aumenta
- Top 5 muda dinamicamente baseado nas avaliações reais
- Cards mostram score combinado e número de votos da comunidade
