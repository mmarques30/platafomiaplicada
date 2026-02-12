

# Corrigir Distribuicao de Entregas e Projetos entre Membros

## Problema

Todos os projetos (backlog_skills) e entregas (entregas_skills) estao atribuidos exclusivamente ao Erich. Os demais membros (Antonio, Livia, Lucio) nao tem nenhum projeto ou entrega atribuida, apesar de terem diagnosticos completos.

**Causa raiz**: As edge functions `gerar-projetos-skills` e `gerar-entregas-skills` dependem da IA para distribuir responsaveis, mas a IA ignora as instrucoes de distribuicao e concentra tudo em um unico membro. Alem disso, a funcao `associar-membros-skills` so reatribui itens SEM responsavel (IS NULL), entao nao corrige itens ja atribuidos incorretamente.

## Solucao

### 1. Adicionar validacao pos-IA nas edge functions

Apos receber a resposta da IA, ambas as functions (`gerar-projetos-skills` e `gerar-entregas-skills`) devem validar a distribuicao e redistribuir automaticamente se um membro tiver mais que sua cota justa.

**Logica de redistribuicao**:
- Calcular cota maxima por membro: `Math.ceil(totalItens / totalMembros)`
- Se um membro exceder a cota, redistribuir o excesso para membros com menos atribuicoes
- Priorizar membros cuja area/processos tenham relacao com o projeto

### 2. Corrigir `associar-membros-skills`

Remover o filtro `.is("responsavel_id", null)` e permitir que a funcao re-associe TODOS os itens, nao apenas os sem responsavel. Adicionar um parametro `force` para forcar redistribuicao.

### 3. Corrigir dados atuais

Executar um SQL para limpar os responsaveis atuais dos projetos e entregas, para que a funcao de associacao possa redistribuir corretamente.

## Detalhes Tecnicos

### Edge Function: `gerar-projetos-skills/index.ts`

Adicionar funcao de balanceamento apos receber resposta da IA:

```text
function balancearResponsaveis(projetos, membrosInfo) {
  const membrosIds = membrosInfo.map(m => m.user_id);
  const maxPorMembro = Math.ceil(projetos.length / membrosIds.length);
  const contagem = {};
  membrosIds.forEach(id => contagem[id] = 0);
  
  // Contar atribuicoes
  projetos.forEach(p => {
    if (p.responsavel_id) contagem[p.responsavel_id] = (contagem[p.responsavel_id] || 0) + 1;
  });
  
  // Redistribuir excesso
  for (const p of projetos) {
    if (p.responsavel_id && contagem[p.responsavel_id] > maxPorMembro) {
      // Encontrar membro com menos atribuicoes
      const membroMenosOcupado = membrosIds
        .filter(id => (contagem[id] || 0) < maxPorMembro)
        .sort((a, b) => (contagem[a] || 0) - (contagem[b] || 0))[0];
      
      if (membroMenosOcupado) {
        contagem[p.responsavel_id]--;
        p.responsavel_id = membroMenosOcupado;
        contagem[membroMenosOcupado] = (contagem[membroMenosOcupado] || 0) + 1;
      }
    }
  }
  
  // Garantir que membros sem atribuicao recebam pelo menos 1
  for (const id of membrosIds) {
    if ((contagem[id] || 0) === 0) {
      const membroMaisOcupado = membrosIds
        .sort((a, b) => (contagem[b] || 0) - (contagem[a] || 0))[0];
      if (contagem[membroMaisOcupado] > 1) {
        const projetoParaReatribuir = projetos.find(p => p.responsavel_id === membroMaisOcupado);
        if (projetoParaReatribuir) {
          contagem[membroMaisOcupado]--;
          projetoParaReatribuir.responsavel_id = id;
          contagem[id] = 1;
        }
      }
    }
  }
  
  return projetos;
}
```

### Edge Function: `gerar-entregas-skills/index.ts`

Mesma logica de balanceamento aplicada apos mapeamento de nomes para user_ids.

### Edge Function: `associar-membros-skills/index.ts`

- Adicionar parametro `force: boolean` no body
- Quando `force = true`, buscar TODOS os itens (remover filtro `.is("responsavel_id", null)`)
- Adicionar botao "Redistribuir Membros" no admin que chama com `force: true`

### Admin UI: `SkillsEntregasTab.tsx`

- Adicionar botao "Redistribuir" que chama `associar-membros-skills` com `{ force: true }`
- Mostrar contagem de itens por membro para dar visibilidade

### Correcao imediata dos dados

Executar SQL para limpar responsaveis e permitir redistribuicao:

```text
-- Limpar responsaveis dos projetos para redistribuicao
UPDATE backlog_skills SET responsavel_id = NULL WHERE equipe_id = (SELECT id FROM equipes_skills LIMIT 1);

-- Limpar responsaveis das entregas para redistribuicao  
UPDATE entregas_skills SET responsavel_id = NULL WHERE equipe_id = (SELECT id FROM equipes_skills LIMIT 1);
```

Depois, clicar "Associar Membros" no admin para redistribuir via IA.

## Arquivos Modificados

- `supabase/functions/gerar-projetos-skills/index.ts` -- adicionar balanceamento pos-IA
- `supabase/functions/gerar-entregas-skills/index.ts` -- adicionar balanceamento pos-IA
- `supabase/functions/associar-membros-skills/index.ts` -- suportar parametro `force` para redistribuir todos
- `src/components/admin/skills/SkillsEntregasTab.tsx` -- botao "Redistribuir Membros"

## Resultado

- Projetos e entregas serao distribuidos proporcionalmente entre TODOS os membros
- Nenhum membro ficara sem atribuicoes
- Funcao de balanceamento impede que a IA concentre tudo em um unico membro
- Admin pode forcar redistribuicao a qualquer momento
- Dados atuais serao corrigidos via limpeza + reassociacao

