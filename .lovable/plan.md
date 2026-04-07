

# Fix: Estrutura visual e emojis nos avisos

## Problema
Dois problemas causam a aparência "sem estrutura":
1. **`removeEmojis()`** remove todos os emojis do texto — incluindo os emojis de seção (📢, 🎬, 🤖, etc.) que a IA gera para dar estrutura visual
2. **Linhas em branco filtradas** — `formatarMensagem` retorna `null` para linhas vazias, eliminando o espaçamento entre seções
3. **Categorias com emoji não são detectadas** — o matcher compara "🎬 Vídeos" com "Vídeos" e falha porque o emoji está presente

## Solução

**Arquivo**: `src/pages/Notificacoes.tsx`

1. **Remover `removeEmojis()` da mensagem** — manter emojis no corpo do aviso (linhas 119 e 136). Manter `removeEmojis` apenas no título do card se desejado
2. **Preservar linhas em branco** — em vez de retornar `null`, retornar um `<div>` com altura para espaçamento entre seções
3. **Melhorar detecção de categorias** — strip emojis apenas para o matching, não para o render. Também detectar padrões como "📢 Título" e linhas terminando em ":" como headers
4. **Adicionar estilo visual aos headers** — usar tamanho maior e margem superior para separar seções visualmente

### Mudanças específicas:

- Linha 33-34: manter `removeEmojis` como utilitário mas não aplicar na mensagem
- Linha 38-68: reescrever `formatarMensagem`:
  - Linhas vazias → `<div className="h-2" />` (espaçamento)
  - Detecção de header: strip emojis internamente para comparar, mas renderizar com emoji original
  - Também detectar linhas curtas terminando em ":" como headers
  - Headers → `<h4 className="font-semibold text-foreground mt-4 mb-1.5 text-[15px]">`
  - Bullets → `<p className="pl-3 text-sm">`
- Linha 119: `removeEmojis(aviso.titulo)` → manter (título do card sem emoji está ok)
- Linha 136: `removeEmojis(aviso.mensagem)` → `aviso.mensagem` (preservar emojis no corpo)

