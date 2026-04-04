

# Criar ProximosPassosCard — Modal pós-onboarding

## Resumo
Componente modal que aparece uma única vez após o onboarding ser concluído (primeiro_acesso → false). Conteúdo dinâmico por plano, com passos estilizados no tema escuro da marca. Controlado via localStorage.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/onboarding/ProximosPassosCard.tsx` | Criar — componente completo com lógica por plano |
| `src/components/layout/MainLayout.tsx` | Editar — importar e renderizar ProximosPassosCard |

## Detalhes técnicos

### ProximosPassosCard.tsx
- **Controle de exibição**: `useState` + `useEffect` checando `profile?.primeiro_acesso === false` e `localStorage.getItem(`proximos_passos_${user?.id}`)`. Ao fechar, seta localStorage e oculta.
- **Plano**: usa `useEffectivePlan` para determinar `effectivePlan`
- **Dados dinâmicos**:
  - Gratuito: `useQuery` buscando `conteudos` com `visivel_visitantes = true` (limit 3), com skeleton loading
  - Business Parceria: `useContratosBusiness` + `useEtapasBusiness` para dados reais de etapas
  - Academy/Skills/Business Sistemas: conteúdo estático conforme especificação
- **Layout**: overlay fixo z-9998, fundo `#0C0F0A`, dot grid sutil, modal centralizado `#141810` com border radius 20px, max-width 680px
- **Header**: brand label + título + subtítulo com nome do usuário
- **Steps**: lista com círculos coloridos por estado (feito/agora/próximo), labels, títulos, descrições, CTAs opcionais com `Link`
- **Footer**: progresso "X de Y", barra de progresso 3px, botão CTA principal com cores por plano
- **Cores CTA por plano**: Gratuito/Academy `#AFC040/#0C0F0A`, Skills `#E8A43C/#0C0F0A`, Business `#2CBBA6/#ffffff`

### MainLayout.tsx
- Importar `ProximosPassosCard`
- Renderizar após o `SidebarProvider` block, antes do fechamento do fragment, passando dependências necessárias (ou o componente busca internamente via hooks)

