

# Limpar 26 modulos orfaos do projeto CRM Completo Inteligente Dual

## Diagnostico

- Projeto ID: `c4d88b5a-c553-4d21-937a-c8c559c7b704`
- Total no JSONB `modulos_obrigatorios`: **36 modulos**
- Existem no banco (tabela `modulos`): **10 modulos**
- Orfaos a remover: **26 modulos**

### Modulos que PERMANECEM (existem no banco)

1. IA em 5 minutos: O que voce REALMENTE precisa saber
2. Setup das IAs - Primeiros Passos
3. Comparativo - Qual IA usar para que
4. Configuracao de contas
5. Seu primeiro prompt
6. 3 erros que matam respostas
7. Prompt Hacks: 29 atalhos
8. Contexto e rei
9. Casos Praticos
10. Configuracoes Avancadas + Projeto Final

### Modulos REMOVIDOS (nao existem mais)

26 modulos de trilhas como Planilhas, Automacao e Claude que foram deletados do banco mas permaneceram no JSONB.

## Acao

Um unico UPDATE na tabela `projetos_mentoria` para substituir o array JSONB, mantendo apenas os 10 modulos validos. Nenhuma alteracao de codigo ou schema necessaria.

