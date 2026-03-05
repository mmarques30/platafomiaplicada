

# Correcao: IA nao gera entregas de documentos HTML sem estrutura padrao

## Problema raiz

O `processar-documentos-business` usa um pre-parser regex que busca marcadores especificos como `FASE 1:`, `ENTREGA 1:`, `MODULO 1:`, `PASSO 1:`. O documento HTML da Focus Fintax usa outra estrutura: secoes HTML como `03 · Modulo 01` seguido de `<h2>Central da Holding</h2>`.

Apos o strip de tags HTML, o texto nao contem os marcadores esperados. Resultado: **0 fases, 0 entregas, 0 passos** extraidos.

O fallback chama `processarComIARestrita`, mas esse prompt diz **"PROIBIDO inventar titulos que NAO estao na lista acima"** - e a lista esta vazia. A IA obedece e retorna 0 entregas.

## Solucao

Adicionar uma funcao `processarDocumentoLivre` no edge function `processar-documentos-business` com um prompt de IA **permissivo** que extrai modulos/secoes como entregas quando o pre-parser nao encontra nenhuma ancora. Essa funcao sera chamada no bloco de fallback (linhas 1500-1507) quando `ancoras.fases.length === 0 && ancoras.entregas.length === 0`.

### Alteracoes no edge function `supabase/functions/processar-documentos-business/index.ts`

1. **Nova funcao `processarDocumentoLivre`** (~linha 958, antes do handler principal):
   - Prompt que instrui a IA a **extrair** (nao inventar) modulos, secoes e requisitos do documento
   - Identifica secoes como "Modulo 01 - Central da Holding", "Modulo 02 - Motor de Teses" etc.
   - Cada modulo/secao vira uma entrega, cada sub-item vira uma instrucao
   - Mantém restricoes contra invencao de conteudo generico, mas permite extrair titulos literais do documento

2. **Alterar bloco de fallback** (linhas 1500-1507):
   - Quando nao ha ancoras E o texto tem tamanho significativo (>500 chars), chamar `processarDocumentoLivre` em vez de `processarComIARestrita` com ancoras vazias

### Prompt da funcao livre (resumo)

```
Voce e um EXTRATOR de estrutura de documentos tecnicos.
O documento abaixo descreve um sistema/projeto. Extraia:
- Modulos/secoes principais como ETAPAS
- Sub-modulos ou funcionalidades como ENTREGAS  
- Requisitos ou itens detalhados como INSTRUCOES

REGRAS:
- Use APENAS titulos e descricoes que existem no documento
- NAO invente, NAO resuma, NAO parafraseie
- Copie os titulos EXATAMENTE como estao no texto
```

Isso resolve o caso de documentos HTML ricos que tem estrutura semantica mas nao usam os marcadores `FASE/ENTREGA/PASSO` do formato padrao.

