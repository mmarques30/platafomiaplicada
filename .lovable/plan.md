

# Mostrar todos os 5 icones de classificacao (disponiveis e indisponiveis)

## Problema identificado

Apenas 3 classificacoes existem no banco (Aprendizado Inicial, Carreira, Rotina). As classificacoes **Produtividade** e **Automacao** nao foram atribuidas as trilhas -- provavelmente os titulos usados no UPDATE nao corresponderam exatamente aos titulos no banco. Por isso, so 3 icones aparecem.

## Solucao (2 partes)

### 1. Corrigir dados no banco

Verificar os titulos exatos das trilhas e executar os UPDATEs corretos para Produtividade e Automacao. Isso garantira que as 5 classificacoes tenham trilhas associadas.

### 2. Alterar o componente `ClassificacaoIcons.tsx`

Mudar a logica para **sempre exibir os 5 icones**, independente de existirem trilhas com aquela classificacao:

- **Com trilhas disponiveis**: icone na cor verde (`text-primary`) com animacao ativa
- **Sem trilhas disponiveis**: icone na cor cinza escuro/preto (`text-foreground/60`) com animacao ativa mas visual mais discreto
- Icones indisponiveis ainda serao clicaveis (filtrar mostrara "nenhuma trilha encontrada") ou podem ser desabilitados visualmente

### Mudanca tecnica principal

No componente, em vez de filtrar `orderedKeys` com base nas classificacoes vindas do banco, sempre renderizar todos os 5 icones. Adicionar uma prop ou verificacao interna para saber quais classificacoes tem trilhas, e aplicar estilo verde vs cinza escuro conforme disponibilidade.

```text
Logica de cores:
- Ativo (selecionado): fundo primary/15, borda primary/30, texto primary
- Disponivel (tem trilhas): texto primary/60 (verde claro)
- Indisponivel (sem trilhas): texto foreground/50 (cinza escuro)
```

### Arquivos modificados

| Arquivo | Acao |
|---|---|
| `src/components/dashboard/ClassificacaoIcons.tsx` | Sempre renderizar os 5 icones, aplicar cores verde vs cinza |
| `src/components/dashboard/TodasAsTrilhas.tsx` | Nenhuma mudanca necessaria (ja passa classificacoes) |
| Banco de dados | Corrigir UPDATEs para Produtividade e Automacao |

