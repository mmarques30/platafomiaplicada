

# Mais mockups placeholder nos carrosséis de Telas e Vídeos

## Problema
Quando não há dados reais em "Telas do Sistema" e "Vídeos de Instrução", o carrossel mostra apenas 3 placeholders genéricos, deixando espaço em branco visível na tela.

## Solução

**Arquivo**: `src/pages/MeuSistemaEntregas.tsx`

Aumentar os placeholders de 3 para 6 em ambas as seções, com nomes variados e realistas para parecer um carrossel completo.

### Telas do Sistema (linhas 239-250)
Trocar `[1, 2, 3].map(...)` por 6 placeholders com nomes descritivos:
- "Dashboard Principal"
- "Gestão de Clientes"
- "Relatórios"
- "Configurações"
- "Kanban de Tarefas"
- "Módulo Financeiro"

Cada placeholder usa o ícone `Monitor` existente com o gradiente overlay.

### Vídeos de Instrução (linhas 339-356)
Trocar `[1, 2, 3].map(...)` por 6 placeholders com nomes descritivos:
- "Introdução ao Sistema"
- "Como Cadastrar Clientes"
- "Gerando Relatórios"
- "Configurações Avançadas"
- "Fluxo de Vendas"
- "Integrações e APIs"

Cada placeholder usa o ícone `Play` existente com descrição genérica.

Nenhuma mudança no banco ou admin. Apenas visual no empty state do mentorado.

