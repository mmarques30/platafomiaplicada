

## Diagnóstico

Os logs da Edge Function mostram claramente: **"Webhook secret invalido"**. A Lia **está enviando** os webhooks, mas a função está rejeitando porque a Lia não envia o header `x-webhook-secret` nem `Authorization` com o valor esperado.

## Plano de Correção

**Arquivo:** `supabase/functions/webhook-lia-compra/index.ts`

**Alteração:** Remover a validação do `LIA_WEBHOOK_SECRET` via headers, já que a Lia não envia esse header. Em vez disso, validar a autenticidade pelo formato do payload (presença de `entity: "bill"`, `event: "paid"`, e campos obrigatórios como `data.contact.email`).

Mudança específica:
- Remover o bloco que valida `x-webhook-secret` / `authorization` header (linhas ~30-41)
- Opcionalmente, manter um log do IP ou outro identificador para auditoria

**Depois de corrigido:** Reprocessar manualmente o payload do Magno (`magno.fg@hotmail.com`) invocando a function com o payload fornecido.

