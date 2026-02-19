
# Personalizar a MarIAna por usuario logado

## Problema

A edge function `ai-chat-user` ja busca o diagnostico Academy (`formulario_diagnostico`) e objetivos, mas ignora completamente:
- **Plano do usuario** (academy, skills, business)
- **Diagnostico Skills** (tarefas manuais, gargalos, insight IA)
- **Projetos de mentoria** (status, titulo, progresso)
- **Fases do processo** (em qual fase esta)
- **Progresso nas trilhas** (videos assistidos)
- **Equipe Skills** (backlog, entregas)

Resultado: a MarIAna responde de forma generica, sem considerar o contexto real do usuario.

## Abordagem

Expandir as queries paralelas na edge function para buscar dados adicionais do usuario e injetar no system prompt de forma contextualizada por plano.

## Alteracoes

### `supabase/functions/ai-chat-user/index.ts`

#### 1. Novas queries no bloco `Promise.all` (linha ~48)

Adicionar ao bloco paralelo existente:

- **Profile** (plano_mentoria, nome_completo): `profiles` filtrado por `user.id`
- **Diagnostico Skills**: `diagnosticos_skills` filtrado por `user_id`, pegar o mais recente com `completado = true`
- **Projetos de Mentoria**: `projetos_mentoria` filtrado por `user_id`, selecionar titulo, status, progresso_preparacao, trilhas_recomendadas
- **Fases do Processo**: `fases_processo_mentoria` filtrado por `user_id`, ordenado por fase_numero
- **Progresso em Videos**: contar videos completados via `progresso_videos` filtrado por `user_id` e `completado = true`
- **Equipe Skills** (se skills): `membros_equipe_skills` filtrado por `user_id`, com join para `equipes_skills` e `backlog_skills`
- **Entregas Skills**: `entregas_skills` filtrado por `responsavel_id = user.id`

#### 2. Injecao no system prompt por plano

Apos o bloco existente de `formulario.data` (linha ~290), adicionar seções condicionais:

**Para TODOS os planos:**
```
## Contexto do Plano:
- Plano: {plano_mentoria}
- Videos assistidos: {count}
- Projetos: {lista com status}
- Fase atual do processo: {fase}

INSTRUCAO: Personalize suas respostas considerando o plano do usuario.
Para Academy: foque em trilhas e conteudos da plataforma.
Para Skills: foque em automacao de processos e projetos da equipe.
Para Business: foque no projeto sendo construido e resultados.
```

**Para usuarios SKILLS (se tiver diagnostico):**
```
## Diagnostico Skills do Usuario:
- Cargo: {cargo}
- Area: {area_atuacao}
- Tarefas manuais: {tarefas_manuais}
- Gargalos: {gargalos_identificados}
- Onde perde mais tempo: {onde_perde_mais_tempo}
- Insight IA gerado: {insight_ia resumido}
- Economia estimada: {economia_horas_semana}h/semana

## Projetos/Backlog da Equipe:
{lista de itens do backlog com status}

## Entregas Pendentes:
{lista de entregas com status e prazo}

INSTRUCAO: Relacione suas respostas com os gargalos e projetos do usuario. Sugira como IA resolve os problemas especificos dele.
```

**Para usuarios ACADEMY (se tiver diagnostico):**
```
## Projetos de Mentoria:
{lista de projetos com status e progresso}

## Fase Atual do Processo:
{fase atual e proxima}

INSTRUCAO: Guie o usuario pelo processo de mentoria. Sugira proximo passo baseado na fase atual.
```

#### 3. Instrucoes finais atualizadas

Adicionar ao bloco de instrucoes finais (linha ~425):

```
## Personalizacao por Contexto:
- SEMPRE use o nome do usuario quando disponivel
- Relacione suas respostas com os projetos e diagnosticos do usuario
- Para Skills: priorize recomendacoes que resolvam os gargalos identificados
- Para Academy: sugira trilhas alinhadas com os objetivos e fase atual
- Para Business: foque em resultados e entregas do projeto
- Mencione progresso quando relevante ("Voce ja assistiu X videos, falta pouco!")
- Sugira proximos passos baseados no contexto real do usuario
```

## Resultado

A MarIAna passara a responder de forma altamente personalizada, conhecendo o plano, diagnostico, projetos e progresso de cada usuario -- criando uma experiencia de mentoria realmente individualizada.
