

# Redesenhar Roadmap Academy — Jornada Educacional

## Resumo
Substituir `FaseAtualCard` + `ResumoProgresso` na aba Roadmap do Academy por um novo componente `AcademyRoadmapEducacional` com 4 seções educacionais concretas.

## Alterações

### 1. Novo componente: `src/components/mentoria/AcademyRoadmapEducacional.tsx`
Componente único com 4 seções verticais:

**Seção 1 — Diagnóstico**
- Query em `formulario_diagnostico` (via `useMentoriaForm` existente)
- Exibe: status preenchido (sim/não), data de preenchimento, insight IA gerado (sim/não com data)
- Badge verde se completo, amarelo se pendente, com CTA para preencher

**Seção 2 — Trilhas em Andamento**
- Reutiliza lógica do `useProgressoCertificados` existente para obter trilhas com progresso
- Também busca trilhas com 0% mas que o aluno já acessou (via `progresso_videos`)
- Para cada trilha: nome, barra de progresso (% módulos concluídos), X de Y vídeos
- CTA "Continuar" por trilha

**Seção 3 — Conquistas Desbloqueadas**
- Reutiliza lógica da `VitrineConquistas` (hooks `useMinhaEvolucao`, `useSequenciaEstudo`, `useMeusCertificados`)
- Exibe apenas as desbloqueadas como badges compactos + certificados emitidos
- Link "Ver todas" para `/evolucao/conquistas`

**Seção 4 — Próximo Objetivo**
- Lógica: encontrar a trilha com maior % de progresso que ainda não está 100%
- Exibe: nome da trilha, % atual, quantos vídeos faltam
- CTA direto "Continuar esta trilha" → `/trilhas/{id}`
- Se nenhuma trilha iniciada, sugere a primeira trilha disponível

### 2. Atualizar `src/pages/Mentoria.tsx`
- Linhas 133-138: substituir `<FaseAtualCard />` + `<ResumoProgresso />` por `<AcademyRoadmapEducacional />`
- Remover imports de `FaseAtualCard` e `ResumoProgresso` (usados apenas aqui no contexto Academy)

## Detalhes técnicos
- Dados: `formulario_diagnostico`, `progresso_videos`, `trilhas`, `videos`, `certificados` — todas tabelas existentes
- Hooks reutilizados: `useMentoriaForm`, `useProgressoCertificados`, `useMinhaEvolucao`, `useSequenciaEstudo`, `useMeusCertificados`
- Nenhuma referência a "mentoria", "candidatura", "Business" ou "fases de processo"
- Visual: cards com estilo dark consistente, Progress bars, badges de conquista

## Arquivos
- **Novo**: `src/components/mentoria/AcademyRoadmapEducacional.tsx`
- **Editado**: `src/pages/Mentoria.tsx`

