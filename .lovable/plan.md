

# Cadastro de Cliente Business Sistemas

## Resumo

Dos 5 usuarios identificados como faltantes, apenas **1 precisa ser criado**:

| Nome | Email | Acao |
|------|-------|------|
| Alcir | alcir@focuscontabil.com | **Criar** |
| Carolina Felix | carolina.felix@engelmig.com.br | Nao criar (Livia acessa pela Engelmig) |
| Patricia | patricia@psa.com.br | Nao criar (ja acessa como psaconsultores) |
| Daniel Brambilla | daniel.brambilla@riveramoveis.com.br | Nao criar (ainda nao pagou) |
| Karen Torres | karen.torres@yoursolutions.com | Nao criar (acessa como Turystar) |

## Plano de execucao

1. Criar usuario `alcir@focuscontabil.com` (Focus Fintax LTDA) via Edge Function `admin-create-user` com email confirmado e senha temporaria
2. Atualizar profile: `plano_mentoria = 'business_sistemas'`, `conta_ativa = true`, `senha_temporaria = true`, `primeiro_acesso = true`
3. Inserir role `mentorado` na tabela `user_roles`

