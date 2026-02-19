

# Alterar FK de biblioteca_prompts.modulo_id para ON DELETE SET NULL

## Problema
A constraint atual em `biblioteca_prompts.modulo_id` usa `ON DELETE NO ACTION`, o que impede a exclusao de modulos que possuem prompts vinculados. Isso bloqueia operacoes administrativas de limpeza e reorganizacao.

## Solucao
Uma unica migracao SQL que:
1. Remove a constraint de FK existente
2. Recria com `ON DELETE SET NULL`

## Migracao

```text
ALTER TABLE biblioteca_prompts
  DROP CONSTRAINT biblioteca_prompts_modulo_id_fkey,
  ADD CONSTRAINT biblioteca_prompts_modulo_id_fkey
    FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE SET NULL;
```

## Resultado
- Deletar um modulo nao gera mais erro de FK
- Prompts vinculados ao modulo deletado terao `modulo_id` definido como `NULL` automaticamente
- Os prompts continuam acessiveis normalmente, apenas sem vinculo a um modulo
- Nenhuma alteracao de codigo frontend necessaria

