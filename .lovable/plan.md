

# Barra colorida lateral + remoção de emojis em Notificações

## Análise

A página `Notificacoes.tsx` usa a tabela `avisos` cujo campo `tipo` tem valores como `"urgente"`, `"importante"`, `"informativo"`. Os tipos mencionados na solicitação (`sessao`, `entrega`, `tarefa`, etc.) não existem atualmente nessa tabela.

**Mapeamento proposto** — combinar os tipos existentes com os solicitados:

| Tipo aviso | Cor | Razão |
|------------|-----|-------|
| `urgente` | #E8684A (alerta) | Urgência = alerta |
| `importante` | #E8A43C (entrega/tarefa) | Importância = atenção |
| `informativo` | #4A9FE0 (sessao) | Informação = neutro/sessão |
| Qualquer outro / sem tipo | #2CBBA6 | Fallback padrão |

Se no futuro novos tipos forem adicionados (`sessao`, `entrega`, `conquista`, etc.), o mapeamento já os cobrirá.

## Alteração única: `src/pages/Notificacoes.tsx`

### 1. Função helper de cor
Criar `getBarColor(tipo)` que retorna a cor hexadecimal com base no tipo do aviso, incluindo os tipos futuros solicitados.

### 2. Barra lateral 3px
No Card de cada aviso, adicionar `overflow-hidden` e um `div` absoluto na esquerda com `width: 3px`, `height: 100%`, `backgroundColor` dinâmico via `getBarColor`.

### 3. Remoção de emojis
Criar helper `removeEmojis(text)` usando regex para limpar emojis dos campos `titulo` e `mensagem` antes de renderizar.

## Nenhum outro arquivo alterado
Sem mudanças em fetch, contagem, marcação como lido, posicionamento ou componentes ocultos.

