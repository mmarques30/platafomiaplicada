
# Corrigir visibilidade "Meu Progresso" e renomear no Business

## Problema
- "Meu Progresso" aparece em ambientes onde nao deveria (business tem ele visivel com submenus)
- No business, o grupo deveria se chamar "Minha Trajetoria" em vez de "Meu Progresso"

## Regras definitivas
- **Academy**: "Meu Progresso" visivel (com evolucao, diagnostico, duvidas como submenus)
- **Business**: visivel mas renomeado para **"Minha Trajetoria"** (com Visao Geral, Roadmap, Evolucao Aprendizado)
- **Business iAplicada, Skills, Gratuito**: completamente oculto

## Alteracoes

### 1. `src/hooks/useMenuConfig.tsx`

Duas mudancas:

**a) Garantir que `meu_progresso` e todos os submenus estejam ocultos nos ambientes corretos:**
- `skills`: ja esta oculto (OK)
- `gratuito`: ja esta oculto (OK)
- `business_iaplicada`: ja esta oculto (OK)
- `business`: adicionar `meu_progresso_visao_geral`, `meu_progresso_roadmap`, `meu_progresso_conteudo`, `meu_progresso_entregas` na lista? NAO - no business eles devem continuar visiveis. Business mostra "Minha Trajetoria" com seus submenus. Verificar que nenhum submenu de meu_progresso esta na lista de ocultos do business (atualmente `evolucao`, `meu_diagnostico`, `minhas_duvidas` estao ocultos no business, o que esta correto pois sao itens do Academy).

**b) Renomear dinamicamente o label:** Adicionar logica no `getSidebarMenus` para, apos filtrar, sobrescrever o `label` de `meu_progresso` para "Minha Trajetoria" quando o ambiente for `business`.

### 2. Detalhes tecnicos

No `getSidebarMenus`, apos o filtro existente, aplicar um `.map()` para renomear:

```typescript
// Apos o filter existente, adicionar .map para renomear
.map(m => {
  if (m.menu_key === 'meu_progresso' && currentEnvironment === 'business') {
    return { ...m, label: 'Minha Trajetória' };
  }
  return m;
})
```

## Arquivo alterado
- `src/hooks/useMenuConfig.tsx` - adicionar `.map()` de renomeacao apos o `.filter()`
