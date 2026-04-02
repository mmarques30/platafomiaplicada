

# Corrigir e expandir tour de onboarding

## Problema
1. O step "Trilha Recomendada" aponta para a Central de Conteúdo no dashboard, mas deveria apontar para o menu "Aprender" (ou "Meu Progresso") no sidebar
2. Faltam etapas para Bibliotecas e Calendário

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/layout/AppSidebar.tsx` | Editar — adicionar `data-tour="aprender"` no NavLink do menu colapsável quando `menu_key === 'aprender'`, e `data-tour="bibliotecas"` no bloco de Bibliotecas |
| `src/components/dashboard/DashboardTour.tsx` | Editar — reorganizar steps do tour |
| `src/pages/Dashboard.tsx` | Editar — remover `data-tour="trilha-recomendada"` do div da CentralConteudo |

## Detalhes técnicos

### AppSidebar.tsx
- Linha ~241 (NavLink do menu colapsável): adicionar `data-tour={menu.menu_key === 'aprender' ? 'aprender' : undefined}`
- No bloco de Bibliotecas (~linha 400+): adicionar `data-tour="bibliotecas"` ao elemento raiz

### DashboardTour.tsx
Substituir os 5 steps atuais por 7 steps:

1. **Aprender** → `[data-tour="aprender"]` — "Aqui você acessa trilhas, aulas e todo o conteúdo para desenvolver suas habilidades em IA." (placement: right)
2. **Bibliotecas** → `[data-tour="bibliotecas"]` — "Explore prompts prontos, ferramentas de IA e materiais de apoio organizados por tema." (placement: right)
3. **Calendário** → `[data-tour="calendario"]` — "Confira sessões ao vivo, aulas e eventos programados." (placement: right)
4. **Evolução** → `[data-tour="evolucao"]` — "Acompanhe seu progresso, conquistas e certificados." (placement: right)
5. **MarIAna** → `[data-tour="mariana-button"]` — "Sou a MarIAna! Clique aqui para ajuda e recomendações." (placement: left)
6. **Configurações** → `[data-tour="configuracoes"]` — "Personalize perfil, senha e preferências." (placement: right)

### Dashboard.tsx
- Remover `data-tour="trilha-recomendada"` do wrapper da CentralConteudo (já não é usado)

