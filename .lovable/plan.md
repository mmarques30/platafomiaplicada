
Diagnóstico
- O backend está recebendo o texto, mas o parser só reconhece as fases. Os logs da função `processar-documentos-business` mostram exatamente isso: `Âncoras encontradas: 5 fases, 0 entregas`.
- A causa principal é inconsistente no pre-parser:
  - `regexFase` aceita prefixos de Markdown/heading (`# FASE ...`).
  - `regexEntrega` e a extração de `PASSO` não aceitam esses prefixos.
- Como os documentos importados vêm muitas vezes como Markdown ou HTML convertido para Markdown (`## ENTREGA ...`, `### PASSO ...`), o sistema detecta a fase mas ignora entregas e passos.
- O resultado final vira “nenhuma entrega” mesmo com estrutura válida.

O que será corrigido
1. Fortalecer o parser principal em `supabase/functions/processar-documentos-business/index.ts`
   - Normalizar o texto antes das regex:
     - remover ruído visual comum (`**`, bullets, tabs, espaços duplicados, NBSP)
     - preservar quebras de linha
     - manter headings Markdown como estrutura válida
   - Atualizar os padrões para aceitar texto puro e Markdown:
     - `FASE 1: ...`
     - `# FASE 1: ...`
     - `## ENTREGA 1: ...`
     - `### PASSO 1: ...`
     - também aceitar `MÓDULO`, `ETAPA`, `TAREFA`, `STEP`
   - Ajustar a extração de passos para capturar corretamente blocos que vêm com:
     - título na primeira linha
     - descrição em linhas seguintes
     - metadados na mesma linha ou em linha separada (`Responsável`, `Status`, `DICA`, `Prompt`)

2. Adicionar fallback determinístico quando houver fases mas zero entregas
   - Se o parser encontrar fases e não encontrar entregas, rodar um segundo extrator linha a linha.
   - Esse fallback vai:
     - manter a fase atual em contexto
     - detectar `ENTREGA X` mesmo com `##`, `-`, `*` ou texto formatado
     - detectar `PASSO X` mesmo com `###` ou prefixos visuais
     - montar entregas/passos sem depender da IA
   - Isso garante extração confiável para:
     - texto colado
     - `.md`
     - HTML convertido em Markdown
     - PDF cujo texto venha com headings/linhas limpas

3. Melhorar a robustez do resultado final
   - Garantir que, quando houver âncoras literais suficientes, o backend sempre devolva:
     - `etapas`
     - `entregas`
     - `instrucoes`
   - Evitar cair em resposta vazia quando o documento já está claramente estruturado.
   - Preservar ordenação do documento de cima para baixo, sem reembaralhar entregas entre fases.

4. Melhorar o feedback no frontend em `src/components/admin/business/DocumentosUploadSection.tsx`
   - Se o backend retornar fases mas zero entregas, mostrar mensagem útil em vez de erro genérico.
   - Exemplo de feedback:
     - “Foram detectadas 5 fases, mas nenhuma entrega. O documento parece estar formatado em Markdown/HTML e será reprocessado com parser compatível.”
   - Opcionalmente exibir contagem do retorno para facilitar suporte: fases, entregas, passos.

5. Validação obrigatória com o seu caso real
   - Validar com o texto que você colou.
   - Resultado esperado desse caso:
     - 5 fases
     - 13 entregas
     - 60 passos
   - Validar também estes formatos:
     - texto colado puro
     - arquivo `.md`
     - HTML convertido via `extrair-texto-documento`
     - PDF com conteúdo equivalente

Arquivos a ajustar
- `supabase/functions/processar-documentos-business/index.ts`
- `src/components/admin/business/DocumentosUploadSection.tsx`

Resultado esperado
- O mesmo conteúdo que hoje falha passará a gerar as entregas corretamente.
- A ordem ficará fiel ao documento.
- Markdown, HTML e texto simples passarão a funcionar com a mesma lógica.
- Quando houver problema real de estrutura, a interface vai informar exatamente o que foi detectado.

Detalhes técnicos
- O ponto crítico é alinhar `regexEntrega` e a extração de `PASSO` com o mesmo nível de tolerância já usado em `regexFase`.
- Exemplo de direção do ajuste:
```ts
const prefixoEstrutural = String.raw`(?:^|\n)\s*(?:[#>*-]+\s*)*`;

const regexEntrega = new RegExp(
  `${prefixoEstrutural}(?:ENTREGA|MÓDULO|MODULO)\\s*(\\d+)\\s*[:\\-–.]\\s*(.+?)(?=\\n|$)`,
  "gi"
);

const regexPasso = new RegExp(
  `${prefixoEstrutural}(?:PASSO|TAREFA|STEP)\\s*(\\d{1,2})\\s*[:\\-–.]\\s*([\\s\\S]*?)(?=\\n\\s*(?:[#>*-]+\\s*)*(?:PASSO|TAREFA|STEP)\\s*\\d|\\n\\s*(?:[#>*-]+\\s*)*(?:ENTREGA|MÓDULO|MODULO)\\s*\\d|$)`,
  "gi"
);
```

Sem migration de banco. A correção é no parser da função + melhoria de feedback no frontend + redeploy da função.
