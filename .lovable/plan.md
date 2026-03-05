

# Processos Mapeados — Placeholder visual no empty state

## Problema
A seção "Processos Mapeados" mostra apenas um card vazio com ícone e texto quando não há dados. As outras seções já foram corrigidas para mostrar a estrutura visual.

## Solução
Substituir o empty state simples (lines 126-133) por 2 cards placeholder em grid `sm:grid-cols-2` com `opacity-50 pointer-events-none`, mostrando:
- Ícone ExternalLink ou FileText no badge
- Título "Processo de exemplo 1/2"
- Descrição placeholder
- Botão "Acessar" / "Baixar" desabilitado
- Texto "Nenhum processo mapeado ainda." abaixo

## Arquivo
- **Editar:** `src/pages/MeuSistemaEntregas.tsx` — substituir lines 126-133

