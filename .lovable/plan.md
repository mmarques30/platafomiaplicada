

# Adicionar Botao "Forcar Atualizacao" na Tela de Login

## Problema
O app esta preso numa versao antiga por causa do cache do PWA, e nenhuma das tentativas manuais funcionou. A funcao `forceFullAppReload()` ja existe em `src/lib/pwaUpdate.ts`, mas nao ha nenhum botao visivel para o usuario aciona-la.

## Solucao
Adicionar um botao discreto na tela de login (`/auth`) que chama `forceFullAppReload()` para limpar todos os caches, desregistrar service workers e forcar o carregamento da versao mais recente.

## O que sera feito

### `src/pages/Auth.tsx`
- Importar `forceFullAppReload` de `@/lib/pwaUpdate`
- Importar icone `RefreshCw` do lucide-react
- Adicionar um botao pequeno e discreto logo abaixo do texto de Termos/Privacidade
- O botao tera o texto "Atualizar App" com o icone de refresh
- Estilo: texto pequeno, cor sutil (white/40), sem destaque visual exagerado
- Ao clicar: chama `forceFullAppReload()` que limpa caches, desregistra SW e recarrega

### Resultado esperado
- O usuario vera um link/botao "Atualizar App" na parte inferior da tela de login
- Ao clicar, o cache sera completamente limpo e a pagina recarregara com a versao mais recente
- O botao e discreto e nao atrapalha o visual da tela

