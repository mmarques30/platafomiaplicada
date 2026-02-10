
# Corrigir duplicacao de entregas como backlog

## Problema

O documento da Julia Cruz tem:
- Secao "Pos-MVP" com 5 itens (Hub SDS, Dashboard, Relatorios, etc.)
- Secao "Melhorias Futuras" com 5 itens (Painel cliente, Kanban, etc.)
- ENTREGAs 3, 4, 5 que sao exatamente os mesmos itens do Pos-MVP

O parser cria:
1. ENTREGAs 3, 4, 5 como entregas **ativas** (correto)
2. Os mesmos itens como **backlog** (incorreto - duplicacao)

Resultado: itens que deveriam ser entregas ativas aparecem tambem como backlog, inflando a lista.

## Solucao

No handler principal do edge function, apos extrair ancoras e antes de montar o resultado final, filtrar os itens de backlog que ja existem como entregas.

### Arquivo: `supabase/functions/processar-documentos-business/index.ts`

**Alteracao unica** (~linha 1539, na montagem do `backlogLiteral`):

Antes de criar o array `backlogLiteral`, comparar cada item do `ancoras.backlog` com os titulos das entregas ja extraidas. Se o titulo do backlog for similar a uma entrega existente, remover do backlog.

```typescript
// Filtrar backlog: remover itens que ja sao entregas ativas
const titulosEntregas = resultado.entregas.map(e => e.titulo.toLowerCase());

const backlogLiteral = ancoras.backlog
  .filter(b => {
    const tituloLower = b.titulo.toLowerCase();
    // Remover se titulo do backlog contem ou esta contido em alguma entrega
    const jaDuplicado = titulosEntregas.some(te => 
      tituloLower.includes(te) || te.includes(tituloLower) ||
      // Similaridade parcial (ex: "Hub de documentacao tecnica (SDS)" vs "Sistema de SDS")
      tituloLower.split(' ').filter(w => w.length > 3).some(word => te.includes(word))
    );
    if (jaDuplicado) {
      console.log(`  Backlog removido (duplica entrega): ${b.titulo}`);
    }
    return !jaDuplicado;
  })
  .map(b => ({
    titulo: b.titulo,
    descricao: '',
    justificativa: b.secao
  }));
```

Isso mantem no backlog apenas itens genuinamente futuros (Painel cliente, Kanban, Pipeline, Agente IA, Integracao ERP) e remove os que ja estao mapeados como entregas (Hub SDS, Dashboard, Relatorios).

## Resultado esperado

- **Entregas ativas**: 5 (Upload Docs, Propostas, SDS, Dashboard, Relatorio Export) + MVP + Conjuntas
- **Backlog**: ~5 itens genuinos de "Melhorias Futuras" (sem duplicatas do Pos-MVP)
