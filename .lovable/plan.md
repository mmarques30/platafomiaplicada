

## Diagnóstico

Investiguei o fluxo de upload em `DocumentosUploadSection.handleFileUpload` + `useDocumentosBusiness.uploadDocumento` + edge function `extrair-texto-documento`. Encontrei 5 causas reais que fazem o upload "não funcionar":

### 1. Upload falha silenciosamente quando o storage rejeita
`uploadDocumento` faz `supabase.storage.from("contratos-business").upload(...)` sem `contentType` explícito e sem `upsert`. Quando o bucket retorna 400/403 (ex.: RLS, MIME type não detectado, arquivo já existente em retry), o `try/catch` cai num `toast.error("Erro ao processar arquivo")` genérico — sem mostrar o motivo real ao usuário, e sem permitir continuar processando o texto.

### 2. Pipeline trava se o upload falhar, mesmo com texto extraível
Hoje `handleFileUpload` faz primeiro o upload do binário e só depois extrai texto. Se o upload falhar por qualquer motivo (storage offline, MIME bloqueado, arquivo muito grande), o documento inteiro é descartado — mesmo que pudéssemos ter extraído texto e gerado entregas só com o conteúdo.

### 3. Arquivos médios/grandes quebram no `btoa`
`extrairTextoDocumento` converte ArrayBuffer com `btoa(String.fromCharCode(...new Uint8Array(buffer)))`. Para arquivos a partir de ~5–8MB isso estoura `Maximum call stack size exceeded` no Chrome. O usuário vê apenas "erro ao processar".

### 4. Timeout do `functions.invoke` em PDFs via Gemini
PDFs grandes podem levar 30–90s no Gemini. O cliente `supabase-js` tem timeout default ~30s no `invoke`, então mesmo extrações que funcionam no servidor voltam como erro de fetch no frontend.

### 5. `.doc` e `.ppt` antigos retornam 400 sem feedback amigável
A edge function retorna erro técnico, e o frontend mostra "Erro ao processar arquivo" — usuário não sabe que precisa converter para `.docx`/`.pptx`.

## Plano de correção

### A. Tornar o upload resiliente e informativo
Em `src/hooks/useDocumentosBusiness.tsx → uploadDocumento`:
- Adicionar `contentType: file.type || 'application/octet-stream'` e `upsert: true` no `.upload(...)`.
- Validar tamanho antes (limite 25MB) e retornar erro claro.
- Retornar erro estruturado (mensagem do Supabase) em vez de `throw` cru.

### B. Desacoplar upload da extração no frontend
Em `src/components/admin/business/DocumentosUploadSection.tsx → handleFileUpload`:
- Tentar **primeiro** extrair texto (que é o que importa para gerar entregas).
- Tentar o upload **em paralelo** mas tolerar falha — se falhar, salvar o documento só com `conteudo_texto`, `arquivo_url = null` e mostrar warning ("Texto extraído, mas o arquivo binário não pôde ser armazenado").
- Mostrar mensagens de erro específicas vindas da edge function (em vez de "Erro ao processar arquivo").
- Adicionar feedback de progresso por etapa: "Lendo arquivo → Extraindo texto → Salvando".

### C. Conversão base64 segura para arquivos grandes
Substituir o `btoa(String.fromCharCode(...))` por uma conversão em chunks (loop de 32KB) ou usar `FileReader.readAsDataURL` + split do prefixo. Suporta arquivos até 25MB sem estourar a stack.

### D. Aumentar timeout de invocação para extrair-texto
No componente, substituir `supabase.functions.invoke` por `fetch` direto com `AbortController` de 180s para a chamada de extração (mantém invoke normal para o resto). Garante que PDFs grandes via Gemini cheguem ao fim.

### E. Mensagens claras para formatos não suportados
- Detectar `.doc`/`.ppt` no frontend antes do upload e mostrar: "Formato antigo. Converta para .docx/.pptx no Word/PowerPoint e tente novamente."
- Para tipos completamente desconhecidos: aceitar mas avisar que a IA tentará leitura genérica.

### F. Logs e telemetria mínima
- Console.log estruturado em cada etapa (já existe parcial — padronizar).
- Em caso de falha, mostrar no toast o `error.message` real retornado pela edge function (não engolir).

## Arquivos editados

1. `src/hooks/useDocumentosBusiness.tsx` — `uploadDocumento` com `contentType`, `upsert`, validação de tamanho e erro estruturado.
2. `src/components/admin/business/DocumentosUploadSection.tsx` — `handleFileUpload` desacoplado, conversão base64 em chunks, fetch com timeout estendido, mensagens específicas, validação prévia de `.doc`/`.ppt`.
3. `supabase/functions/extrair-texto-documento/index.ts` — pequena melhoria: aceitar payloads de até 25MB, log de tipo recebido, e retornar mensagem amigável em vez de só `error: ...`.

Sem migration de banco. Redeploy da edge function ao final.

## Resultado esperado

- Qualquer documento aceito (txt, md, html, docx, pdf, pptx) passa a processar de fato.
- Arquivos grandes (até 25MB) não quebram mais por estouro de stack ou timeout.
- Quando o upload do binário falhar, o texto ainda é extraído e o documento fica disponível para geração de entregas.
- Usuário vê mensagens reais de erro ("arquivo > 25MB", "converta .doc para .docx", "Gemini falhou ao ler PDF") em vez do genérico "Erro ao processar arquivo".
- `.doc`/`.ppt` recebem orientação clara antes mesmo de tentar enviar.

