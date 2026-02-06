
# Plano: Estrutura de Navegação Skills

## Status Atual

O ambiente Skills **não utiliza** o grupo "Meu Progresso" da sidebar. Este grupo e todos os seus submenus são completamente ocultos para usuários Skills (tanto líderes quanto membros de equipe).

## Menus Ocultos no Ambiente Skills

- `meu_progresso` (grupo pai)
- `evolucao`
- `meu_diagnostico`
- `minhas_duvidas`
- `trilhas` (usa Trilhas Skills em vez disso)
- `calendario`

## Navegação Skills

O ambiente Skills possui navegação própria via "Trilhas Skills" dentro do grupo "Aprender". O foco é no conteúdo direcionado pela equipe, não no progresso individual do Academy.

## Registros Removidos do Banco

Os seguintes menu_keys foram removidos da tabela `menu_config`:
- `skills_minha_equipe`
- `skills_backlog`
- `skills_roadmap`
- `skills_entregas`
- `skills_painel_lider`

---

## Estrutura de Menus por Ambiente

### Academy
- Aprender: Trilhas, Calendário
- Meu Progresso: Evolução, Diagnóstico, Dúvidas
- Comunidade: Feed, Sala de Aula

### Skills
- Aprender: Trilhas Skills
- ~~Meu Progresso~~ (oculto)
- Comunidade (se habilitado)

### Business
- Aprender: Trilhas, Calendário
- ~~Meu Progresso~~ (oculto - usa Central IA)
- Comunidade (se habilitado)


---

## Resultado Esperado

1. Menu "Meu Progresso" no Skills abre `/skills/equipe` (Minha Equipe)
2. Submenus visiveis para todos Skills: Minha Equipe, Backlog, Roadmap, Entregas
3. Submenu "Painel do Lider" visivel apenas para usuarios com `papel='lider'`
4. Pagina `/skills/progresso` protegida - redireciona nao-lideres
5. Painel do Lider exibe dados reais da equipe (nao mockados)
6. Usuarios Business com `skills_liberado=true` veem menus Skills quando no ambiente Skills
