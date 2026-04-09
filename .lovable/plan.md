

# Fix: Documentos Business — Storage e Download

## Problemas identificados

1. **Falta política de INSERT no storage** — O bucket `contratos-business` não tem política de INSERT. Admins não conseguem fazer upload de arquivos. Só existem políticas de SELECT e UPDATE.

2. **Falta política de DELETE no storage** — Quando o admin exclui um documento, o registro é removido do banco mas o arquivo permanece no storage (sem DELETE policy).

3. **Download para mentorado** — O download usa `createSignedUrl`, que requer SELECT no storage. A política de SELECT existe mas depende de um JOIN com `documentos_business` + `contratos_business`. Isso funciona, mas se o `arquivo_url` salvo não bater com o padrão `{contrato_id}/%`, pode falhar silenciosamente.

4. **Delete do documento não apaga o arquivo do storage** — O `deleteDocumento` no hook só deleta o registro no banco, não remove o arquivo do bucket.

## Solução

### 1. Migration — Adicionar políticas de storage

```sql
-- INSERT: admins podem fazer upload
CREATE POLICY "Admins podem inserir contratos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contratos-business'
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- DELETE: admins podem deletar
CREATE POLICY "Admins podem deletar contratos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'contratos-business'
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

### 2. Hook `useDocumentosBusiness` — Deletar arquivo do storage junto com o registro

No `deleteDocumento`, antes de deletar o registro, buscar o `arquivo_url` e chamar `supabase.storage.from("contratos-business").remove([arquivo_url])`.

### 3. Tipo do `DocumentoBusiness` e `DocumentoInput` — Adicionar `'logo' | 'imagem'`

Atualizar os tipos TypeScript para incluir os novos tipos que já são usados na UI.

## Arquivos

| Arquivo | Ação |
|---|---|
| Migration SQL | Criar políticas INSERT e DELETE no storage |
| `src/hooks/useDocumentosBusiness.tsx` | Editar — adicionar tipos `logo`/`imagem`, deletar arquivo do storage no delete |

