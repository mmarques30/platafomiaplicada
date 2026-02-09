
# Remover icones dos titulos das paginas Projeto Skills

## Resumo

Remover o icone de mala (Briefcase) dos tres arquivos de pagina que usam o componente `PageTitle` com `icon=`. Tambem remover o import de `Briefcase` de `lucide-react` em cada arquivo, ja que nao sera mais utilizado.

## Arquivos a modificar

### 1. `src/pages/skills/ProjetoSkills.tsx`
- Remover `import { Briefcase } from "lucide-react"`
- Remover a prop `icon={<Briefcase ... />}` do `PageTitle`

### 2. `src/pages/skills/ProjetoSkillsPerformancePage.tsx`
- Remover `import { Briefcase } from "lucide-react"`
- Remover a prop `icon={<Briefcase ... />}` do `PageTitle`

### 3. `src/pages/skills/ProjetoSkillsDiagnosticoPage.tsx`
- Remover `import { Briefcase } from "lucide-react"`
- Remover a prop `icon={<Briefcase ... />}` do `PageTitle`

Os KPI cards em `KPICard.tsx` continuam com seus icones (Clock, TrendingUp, Target, Award) pois sao icones contextuais dentro dos cards, nao no titulo da pagina.
