
# Plano: Correções Skills - Menu Lateral + Trilhas Skills

## Problemas Identificados

### Problema 1: Menu "Meu Progresso" sumiu para usuário Skills (Lucio)
O `hiddenByEnvironment` no `useMenuConfig.tsx` está **incorretamente** ocultando os menus `evolucao`, `meu_diagnostico` e `minhas_duvidas` quando o ambiente é "skills", mesmo que esses menus tenham `planos_permitidos: [academy, skills]`.

**Configuração atual (errada):**
```typescript
hiddenByEnvironment: {
  skills: ['trilhas', 'calendario', 'evolucao', 'meu_diagnostico', 'minhas_duvidas'],
  // ...
}
```

**Problema**: O `trilhas` (Trilhas gerais) deve ser ocultado para Skills, mas `evolucao`, `meu_diagnostico`, `minhas_duvidas` devem aparecer porque o usuário Skills PRECISA desses menus.

### Problema 2: Aba "Trilhas Skills" em Aprender
A aba já existe no banco de dados (`menu_key: trilhas_skills`, `parent_key: aprender`, `planos_permitidos: [skills]`, `url: /skills/trilhas`) e a página `SkillsTrilhas` já está implementada. Porém, ela está sendo **ocultada** pelo mesmo `hiddenByEnvironment` que oculta `trilhas_skills` para business.

### Problema 3: Admin Skills já existe
A página de administração `/admin/mentoria/skills` com `MentoriaSkillsPage` já existe e já tem:
- Aba Equipes
- Aba Diagnósticos
- Aba Conteúdos (liberação de trilhas)
- Aba Roadmap
- Aba Análises IA

---

## Correção Necessária

### Arquivo: `src/hooks/useMenuConfig.tsx`

**Lógica atual (problemática):**
```typescript
const hiddenByEnvironment: Record<string, string[]> = {
  skills: ['trilhas', 'calendario', 'evolucao', 'meu_diagnostico', 'minhas_duvidas'],
  business: [
    'trilhas', 'calendario', 'evolucao', 'meu_diagnostico', 'minhas_duvidas',
    'trilhas_skills', 'skills_equipe', 'skills_backlog', 'skills_roadmap', 
    'skills_entregas', 'skills_lider'
  ],
};
```

**Correção:**
```typescript
const hiddenByEnvironment: Record<string, string[]> = {
  // Skills: oculta apenas trilhas gerais e calendário (usa Trilhas Skills específicas)
  skills: ['trilhas', 'calendario'],
  
  // Business: oculta Academy-only e Skills-only menus
  business: [
    'trilhas', 'calendario', 'evolucao', 'meu_diagnostico', 'minhas_duvidas',
    'trilhas_skills', 'skills_equipe', 'skills_backlog', 'skills_roadmap', 
    'skills_entregas', 'skills_lider'
  ],
};
```

---

## Menu Final Esperado para Skills

Após correção, o menu lateral para um usuário Skills (como Lucio) deve ser:

```text
├── Início
│   └── Central
├── Aprender
│   ├── Trilhas Skills      ← Novo submenu (já está no banco)
│   └── Central
├── Bibliotecas
│   ├── IA "Copie e Use"
│   ├── Ferramentas
│   ├── Prompts
│   └── Métodos
├── Meu Progresso
│   ├── Minha Evolução       ← Deve aparecer
│   ├── Meu Diagnóstico      ← Deve aparecer
│   ├── Minhas Dúvidas       ← Deve aparecer
│   ├── Minha Equipe
│   ├── Backlog
│   ├── Roadmap
│   └── Minhas Entregas
└── Comunidade
```

---

## Resumo das Alterações

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/useMenuConfig.tsx` | Corrigir `hiddenByEnvironment.skills` para NÃO ocultar `evolucao`, `meu_diagnostico`, `minhas_duvidas` |

---

## Verificação Adicional: Admin Skills

Já existe e funciona em `/admin/mentoria/skills`:
- ✅ Equipes: gestão de equipes Skills
- ✅ Diagnósticos: visualização de diagnósticos por equipe
- ✅ Conteúdos: liberação de trilhas/módulos para equipes
- ✅ Roadmap: gestão do roadmap de 12 semanas
- ✅ Análises IA: análises consolidadas por IA

Nenhuma alteração necessária no painel admin.

---

## Seção Técnica

### Alteração em useMenuConfig.tsx

Linhas 52-59 - alterar de:
```typescript
const hiddenByEnvironment: Record<string, string[]> = {
  skills: ['trilhas', 'calendario', 'evolucao', 'meu_diagnostico', 'minhas_duvidas'],
  business: [
    'trilhas', 'calendario', 'evolucao', 'meu_diagnostico', 'minhas_duvidas',
    'trilhas_skills', 'skills_equipe', 'skills_backlog', 'skills_roadmap', 
    'skills_entregas', 'skills_lider'
  ],
};
```

Para:
```typescript
const hiddenByEnvironment: Record<string, string[]> = {
  // Skills: oculta trilhas gerais (usa Trilhas Skills) e calendário
  // NÃO ocultar evolucao, meu_diagnostico, minhas_duvidas - são necessários para Skills
  skills: ['trilhas', 'calendario'],
  
  // Business: oculta menus Academy-only e Skills-only
  business: [
    'trilhas', 'calendario', 'evolucao', 'meu_diagnostico', 'minhas_duvidas',
    'trilhas_skills', 'skills_equipe', 'skills_backlog', 'skills_roadmap', 
    'skills_entregas', 'skills_lider'
  ],
};
```

### Resultado Esperado

1. **Usuário Skills (Lucio)**: Verá os menus `Minha Evolução`, `Meu Diagnóstico`, `Minhas Dúvidas` + todos os menus específicos Skills
2. **Trilhas Skills**: Aparecerá em "Aprender" como submenu para usuários Skills
3. **Admin Skills**: Já está funcionando em `/admin/mentoria/skills`
