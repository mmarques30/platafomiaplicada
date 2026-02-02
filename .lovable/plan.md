
# Plano: Corrigir Menus e Navegação do Ambiente Skills

## Problema Identificado

Ao acessar como usuário Skills (simulação como "Lucio Torres"), a interface mostra:

1. **Menus duplicados/incorretos** - Aparecem menus Academy junto com menus Skills:
   - ❌ Minha Evolução (Academy - não deveria aparecer)
   - ❌ Meu Diagnóstico (Academy - não deveria aparecer)
   - ❌ Minhas Dúvidas (Academy - não deveria aparecer)
   - ✅ Minha Equipe (Skills)
   - ✅ Backlog (Skills)
   - ✅ Roadmap (Skills)
   - ✅ Minhas Entregas (Skills)

2. **Página errada** - A rota `/mentoria?tab=roadmap` mostra conteúdo Business (com "Diagnóstico IA") quando deveria redirecionar para `/skills/roadmap`

## Estrutura Correta (conforme documentado)

| Plano | Menus "Meu Progresso" |
|-------|----------------------|
| Academy | Minha Evolução, Meu Diagnóstico, Minhas Dúvidas |
| Skills | Minha Equipe, Backlog, Roadmap, Minhas Entregas |
| Business | Visão Geral, Roadmap, Evolução Aprendizado |
| Business iAplicada | Visão Geral, Roadmap, Entregas |

---

## Solução

### Parte 1: Atualizar Banco de Dados (menu_config)

Remover `skills` do campo `planos_permitidos` dos menus Academy-only:

| Menu Key | Antes | Depois |
|----------|-------|--------|
| `evolucao` | `[academy, skills]` | `[academy]` |
| `meu_diagnostico` | `[academy, skills]` | `[academy]` |
| `minhas_duvidas` | `[academy, skills]` | `[academy]` |

### Parte 2: Adicionar Redirecionamento na Página Mentoria

A página `/mentoria` deve redirecionar usuários Skills para suas rotas específicas:

```typescript
// Mentoria.tsx - Adicionar no início
if (isSkills) {
  // Redirecionar Skills para suas páginas específicas
  navigate('/skills/equipe', { replace: true });
  return null;
}
```

---

## Arquivos a Modificar

| Tipo | Alteração |
|------|-----------|
| **Migração SQL** | Atualizar `planos_permitidos` dos 3 menus |
| `src/pages/Mentoria.tsx` | Adicionar redirecionamento para usuários Skills |

---

## Seção Técnica

### SQL Migration

```sql
-- Remover 'skills' dos menus Academy-only
UPDATE menu_config 
SET planos_permitidos = ARRAY['academy']
WHERE menu_key IN ('evolucao', 'meu_diagnostico', 'minhas_duvidas');
```

### Mentoria.tsx

```typescript
import { useNavigate } from "react-router-dom";

export default function Mentoria() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { isBusiness, isBusinessIAplicada, isSkills } = useEffectivePlan(isAdmin);
  
  // Redirecionar Skills para páginas específicas
  useEffect(() => {
    if (isSkills && !isBusiness) {
      navigate('/skills/equipe', { replace: true });
    }
  }, [isSkills, isBusiness, navigate]);

  // Se Skills, não renderizar (aguardar redirect)
  if (isSkills && !isBusiness) {
    return null;
  }
  
  // ... resto do componente
}
```

---

## Resultado Esperado

### Usuário Skills - Sidebar:
```text
Meu Progresso
├── Minha Equipe (/skills/equipe)
├── Backlog (/skills/backlog)
├── Roadmap (/skills/roadmap)
└── Minhas Entregas (/skills/entregas)
```

### Navegação Skills:
- `/mentoria` → Redireciona para `/skills/equipe`
- `/mentoria?tab=roadmap` → Redireciona para `/skills/roadmap`

### Usuário Academy - Sidebar (sem alteração):
```text
Meu Progresso
├── Minha Evolução (/evolucao)
├── Meu Diagnóstico (/meu-diagnostico)
└── Minhas Dúvidas (/minhas-duvidas)
```
