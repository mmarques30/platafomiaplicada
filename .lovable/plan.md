

# Mostrar estrutura completa mesmo sem dados

O problema atual: as 3 seções (Processos, Telas, Vídeos) ficam ocultas quando não há dados, mostrando apenas um card genérico "Nenhuma entrega disponível ainda".

## Alteração em `src/pages/MeuSistemaEntregas.tsx`

1. **Remover o bloco `!hasContent`** (card genérico)
2. **Sempre renderizar as 3 seções**, independente de ter dados
3. **Adicionar empty state individual** em cada seção quando não houver itens:
   - Processos: placeholder com ícone ClipboardList + "Nenhum processo mapeado ainda"
   - Telas: placeholder com ícone Monitor + "Nenhuma tela cadastrada ainda" (dentro do container do carrossel)
   - Vídeos: placeholder com ícone Video + "Nenhum vídeo de instrução ainda"
4. **Badge de contagem** mostra "0" quando vazio
5. Empty states usam card com `border-dashed`, ícone em tom suave e texto muted

