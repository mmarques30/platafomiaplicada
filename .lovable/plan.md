

# Correcao Definitiva: Distribuicao de Entregas entre Membros

## Causa Raiz

O problema persiste porque a logica de balanceamento atual depende da IA para atribuir nomes de responsaveis, e depois tenta corrigir com `balancearResponsaveis`. Mas:

1. A IA atribui quase tudo ao mesmo membro (Erich)
2. O mapeamento nome-para-user_id falha para nomes nao reconhecidos (ficam NULL)
3. A funcao de balanceamento roda, mas nao consegue corrigir adequadamente porque muitos itens ja chegam com o mesmo user_id

**Dados atuais**: 23 entregas com Erich, 17 com NULL. Zero para Lucio, Livia e Antonio.

## Solucao Definitiva

Remover completamente a dependencia da IA para distribuicao. A IA gera o conteudo das entregas, mas a atribuicao de responsaveis e feita 100% em codigo, de forma deterministica e equilibrada.

### 1. Refatorar `gerar-entregas-skills/index.ts`

- Remover `responsavel_nome` do schema da IA (nao pedir mais para a IA atribuir membros)
- Apos receber as entregas da IA, atribuir responsaveis usando round-robin simples entre todos os membros ativos
- Logica: percorrer a lista de entregas e atribuir ciclicamente `membros[i % totalMembros]`

### 2. Refatorar `associar-membros-skills/index.ts`

- Remover a chamada de IA completamente
- Implementar redistribuicao deterministica:
  - Buscar todos os projetos e entregas da equipe
  - Distribuir em round-robin entre os membros ativos
  - Quando `force=true`, redistribuir TUDO; caso contrario, so itens sem responsavel

### 3. Corrigir dados existentes

- Executar UPDATE para limpar todos os `responsavel_id` das entregas e projetos
- A redistribuicao sera feita ao clicar "Redistribuir Membros" no admin

## Detalhes Tecnicos

### Round-robin no `gerar-entregas-skills`

```text
// Apos receber entregas da IA, antes de inserir:
const membrosIds = membrosInfo.map(m => m.user_id);
entregasToInsert.forEach((entrega, index) => {
  entrega.responsavel_id = membrosIds[index % membrosIds.length];
});
```

### `associar-membros-skills` sem IA

```text
// Buscar todos os itens
const projetos = await supabase.from("backlog_skills")...
const entregas = await supabase.from("entregas_skills")...

// Distribuir round-robin
const membrosIds = membros.map(m => m.user_id);
let idx = 0;

for (const p of projetos) {
  await supabase.from("backlog_skills")
    .update({ responsavel_id: membrosIds[idx % membrosIds.length] })
    .eq("id", p.id);
  idx++;
}

for (const e of entregas) {
  await supabase.from("entregas_skills")
    .update({ responsavel_id: membrosIds[idx % membrosIds.length] })
    .eq("id", e.id);
  idx++;
}
```

### Limpeza de dados

Executar SQL para zerar responsaveis atuais, permitindo redistribuicao limpa.

## Arquivos Modificados

- `supabase/functions/gerar-entregas-skills/index.ts` -- remover responsavel_nome da IA, usar round-robin
- `supabase/functions/associar-membros-skills/index.ts` -- remover chamada de IA, usar round-robin determinístico
- `supabase/functions/gerar-projetos-skills/index.ts` -- mesma logica: remover dependencia da IA para distribuicao

## Resultado

- Entregas e projetos distribuidos de forma matematicamente equilibrada entre TODOS os membros
- Sem dependencia da IA para distribuicao (a IA so gera conteudo)
- Botao "Redistribuir Membros" funciona instantaneamente (sem custo de IA)
- Com 4 membros e 40 entregas: cada um recebe exatamente 10

