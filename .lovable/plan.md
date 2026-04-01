

# Criar SidebarUserCard e integrar no AppSidebar

## Alterações

### 1. Criar `src/components/layout/SidebarUserCard.tsx`

Componente puro que recebe `nome`, `plano` e `progresso` via props. Exibe avatar com iniciais, nome (primeiro), badge do plano, e barra de progresso com `ProgressBar`. Usa classes Tailwind, sem hooks internos.

### 2. Editar `src/components/layout/AppSidebar.tsx`

- Importar `SidebarUserCard`, `useBusinessUserId`, `useContratosBusiness`, `useEtapasBusiness`, `useProgressoGeral`, `useAuth` (profile data)
- Calcular progresso:
  - **Business**: % etapas concluídas via `useEtapasBusiness(contrato?.id)` (fallback 0)
  - **Academy**: `useProgressoGeral().percentualConclusao` (fallback 0)
  - **Skills**: 0 como fallback (sem hook de progresso geral disponível)
  - **Visitante**: não renderizar
- Inserir `<SidebarUserCard />` dentro do `<SidebarFooter>`, **antes** do menu de Configurações/Sair (linha ~522)
- Obter nome do usuário via `useAuth()` → `user.user_metadata.nome_completo` ou query de profile (já disponível no hook useAuth se expõe profile)

### Detalhes técnicos

- O `SidebarFooter` atual (linhas 521-555) contém Configurações e Sair
- O card será inserido no topo do footer, antes do `<SidebarMenu>`
- Quando `collapsed` (sidebar fechado), mostrar apenas o avatar (sem texto/barra)
- Hooks de Business (`useBusinessUserId`, `useContratosBusiness`, `useEtapasBusiness`) só executam query quando `isBusiness` é true (via `enabled`)
- Hook `useProgressoGeral` só executa quando `isAcademy` é true

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/layout/SidebarUserCard.tsx` | Criado |
| `src/components/layout/AppSidebar.tsx` | Editado — importa e renderiza SidebarUserCard no footer |

