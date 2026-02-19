

# Sincronizar Titulos de Trilhas/Modulos nos JSONB de projetos_mentoria

## Problema
Quando uma trilha ou modulo e renomeado no admin, os campos JSONB `trilhas_recomendadas` e `modulos_obrigatorios` da tabela `projetos_mentoria` mantem o titulo antigo (snapshot). Atualmente 37 projetos tem trilhas e 28 tem modulos armazenados como JSONB.

### Estrutura atual dos JSONB
```text
trilhas_recomendadas: [
  { "trilha_id": "uuid", "titulo": "Nome antigo", "prioridade": "essencial" }
]

modulos_obrigatorios: [
  { "modulo_id": "uuid", "titulo": "Nome antigo", "trilha_id": "uuid", "video_ids": [...] }
]
```

## Solucao: Triggers de sincronizacao no banco

Criar 2 triggers (um para `trilhas`, outro para `modulos`) que, ao detectar UPDATE no campo `titulo`, percorrem todos os registros de `projetos_mentoria` e atualizam o titulo correspondente dentro do JSONB.

## Alteracoes

### 1. Funcao `sync_trilha_titulo_projetos()`
- Trigger: `AFTER UPDATE OF titulo ON trilhas`
- Logica: Busca todos os `projetos_mentoria` cujo `trilhas_recomendadas` contenha o `trilha_id` alterado e atualiza o campo `titulo` dentro de cada elemento do array JSONB
- Tambem atualiza `trilha_titulo` nos `modulos_obrigatorios` que referenciem essa trilha

### 2. Funcao `sync_modulo_titulo_projetos()`
- Trigger: `AFTER UPDATE OF titulo ON modulos`
- Logica: Busca todos os `projetos_mentoria` cujo `modulos_obrigatorios` contenha o `modulo_id` alterado e atualiza o campo `titulo` dentro de cada elemento do array JSONB

### 3. Migracao SQL (resumo)

```text
-- Funcao para trilhas
CREATE FUNCTION sync_trilha_titulo_projetos() RETURNS trigger
  Para cada projeto com trilhas_recomendadas contendo OLD.id:
    Substituir titulo antigo pelo NEW.titulo no array JSONB
    Tambem atualizar trilha_titulo em modulos_obrigatorios

-- Funcao para modulos  
CREATE FUNCTION sync_modulo_titulo_projetos() RETURNS trigger
  Para cada projeto com modulos_obrigatorios contendo OLD.id:
    Substituir titulo antigo pelo NEW.titulo no array JSONB

-- Triggers
CREATE TRIGGER on_trilha_rename AFTER UPDATE OF titulo ON trilhas
CREATE TRIGGER on_modulo_rename AFTER UPDATE OF titulo ON modulos
```

### 4. Sync inicial (one-time)
Executar um UPDATE em lote para corrigir titulos desatualizados que ja existam hoje, garantindo que os dados atuais fiquem consistentes antes dos triggers entrarem em vigor.

## Resultado
- Qualquer rename de trilha ou modulo no admin se propaga automaticamente para todos os projetos Business
- Zero mudanca no frontend - tudo acontece no banco
- Nenhum arquivo de codigo precisa ser alterado

