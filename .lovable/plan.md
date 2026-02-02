
# Plano: Manter Aba "Criadores" Visível para Visitantes

## Problema
A aba "Criadores" foi incorretamente escondida para visitantes. O comportamento correto é:
- Visitantes **podem ver** a aba "Criadores"
- Visitantes **não podem contribuir** (já funciona assim via `canContribute`)
- Visitantes só veem materiais que foram liberados para eles

## Solução
Reverter as mudanças feitas no `Central.tsx`:

1. Remover a propriedade `hiddenForVisitors` da definição da tab "criadores"
2. Remover a lógica de filtro `useMemo` que escondia tabs
3. Voltar ao array `tabs` original (sem `allTabs`)
4. Remover o import de `useUserRole` (não mais necessário aqui)

## Arquivo a Modificar

**`src/pages/Central.tsx`**

### Antes (atual)
```tsx
import { useUserRole } from "@/hooks/useUserRole";

const allTabs = [
  { value: "todos", ... },
  { value: "criadores", ..., hiddenForVisitors: true },
];

const { isVisitante } = useUserRole();

const tabs = useMemo(() => {
  return allTabs.filter(tab => !tab.hiddenForVisitors || !isVisitante);
}, [isVisitante]);
```

### Depois (correção)
```tsx
// Remover import useUserRole

const tabs = [
  { value: "todos", label: "Todos", icon: FileText },
  { value: "noticia", label: "Notícias IA", icon: Globe },
  { value: "dica", label: "Dicas Práticas", icon: Lightbulb },
  { value: "newsletter", label: "Newsletter", icon: Newspaper },
  { value: "criadores", label: "Criadores", icon: Users },
];

// Remover lógica useMemo e isVisitante
const validTabs = ["todos", "noticia", "dica", "newsletter", "criadores"];
```

## Comportamento Final

| Usuário | Vê aba Criadores | Pode contribuir | Vê materiais |
|---------|------------------|-----------------|--------------|
| Visitante | ✅ Sim | ❌ Não | Só os liberados |
| Mentorado | ✅ Sim | ✅ Sim | Todos ativos |
| Admin | ✅ Sim | ✅ Sim | Todos |

## Verificação

O componente `CriadoresComunidadeTab.tsx` já possui a lógica correta:
- `canContribute = !isPlanLoading && !isVisitante` → Botão "Contribuir" só aparece para não-visitantes
- Materiais são filtrados baseado nas regras de visibilidade existentes
