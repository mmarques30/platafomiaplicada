

# Ocultar menu Comunidade para Academy e Skills

## Problema
O `SidebarComunidadeItem` só esconde o menu para Business. Academy e Skills veem "Comunidade" no sidebar, mas já podem acessá-la trocando para o ambiente Gratuito — é redundante.

## Solução
Mostrar o menu Comunidade **apenas no ambiente Gratuito**. Em qualquer outro ambiente (Academy, Skills, Business), o item fica oculto.

## Arquivo

| Arquivo | Ação |
|---|---|
| `src/components/layout/AppSidebar.tsx` | Editar — passar `currentEnvironment` para `SidebarComunidadeItem` |
| `src/components/layout/SidebarComunidadeItem.tsx` | Editar — trocar `if (isBusiness) return null` por `if (currentEnvironment !== 'gratuito') return null` |

## Detalhe técnico

### SidebarComunidadeItem.tsx
- Substituir prop `isBusiness: boolean` por `currentEnvironment: string | null`
- Linha 28: `if (currentEnvironment !== 'gratuito') return null;`
- Assim, Comunidade só aparece quando o usuário está no ambiente Gratuito

### AppSidebar.tsx
- Importar `useEnvironmentSafe` (ou reutilizar se já importado)
- Passar `currentEnvironment` em vez de `isBusiness` para o componente

