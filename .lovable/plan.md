
# Correcoes no Modulo Skills Admin (3 itens)

## Problema 1: Frequencia de Encontros sem opcao "Trimestral"

O select de "Frequencia Encontros" em `ContratoSkillsManager.tsx` (linha 155) so oferece 3 opcoes: Semanal, Quinzenal e Mensal. Falta a opcao **Trimestral**.

### Correcao
Adicionar `<SelectItem value="trimestral">Trimestral</SelectItem>` ao SelectContent na linha 155.

---

## Problema 2: Sem visao consolidada dos diagnosticos na aba Diagnosticos

A aba "Diagnosticos" em `DiagnosticosSkillsTab.tsx` mostra apenas os diagnosticos individuais de cada membro. Nao existe nenhum botao ou secao para gerar/visualizar o **diagnostico consolidado** da equipe (tabela `diagnostico_consolidado_skills`).

### Correcao
Adicionar ao topo da aba Diagnosticos:
- Uma query para buscar o consolidado existente em `diagnostico_consolidado_skills`
- Um botao "Consolidar Diagnosticos" que chama a IA para consolidar todos os diagnosticos completos da equipe e salvar na tabela `diagnostico_consolidado_skills`
- Um card de visualizacao do consolidado quando existir (gargalos comuns, areas impactadas, projetos sugeridos)
- Criar uma edge function `consolidar-diagnosticos-skills` que:
  1. Busca todos os diagnosticos completos + insights da equipe
  2. Envia para a IA com prompt para consolidar em visao unica de equipe
  3. Salva/atualiza na tabela `diagnostico_consolidado_skills`

---

## Problema 3: Projetos gerados pela IA nao visiveis

O botao "Gerar Projetos com IA" na aba Projetos existe e chama a edge function `gerar-projetos-skills`, que esta funcional. Os projetos sao salvos em `backlog_skills`. A listagem na aba tambem esta correta.

O problema provavel: a aba Projetos carrega, mas se nenhum diagnostico foi processado (`completado = true`), a edge function retorna erro "Nenhum diagnostico preenchido" e nenhum projeto e criado. Alem disso, nao ha feedback visual claro sobre o que deu errado.

### Correcao
- Melhorar feedback de erro na aba Projetos: mostrar mensagem explicita se a geracao falha por falta de diagnosticos
- Adicionar um indicador de pre-requisito: mostrar quantos diagnosticos estao completos e alertar se nenhum esta preenchido antes de permitir gerar

---

## Resumo tecnico das alteracoes

| Arquivo | Alteracao |
|---|---|
| `src/components/admin/skills/ContratoSkillsManager.tsx` | Adicionar opcao "Trimestral" no select de frequencia |
| `src/components/admin/skills/DiagnosticosSkillsTab.tsx` | Adicionar secao de diagnostico consolidado com botao de geracao e visualizacao |
| `supabase/functions/consolidar-diagnosticos-skills/index.ts` | Nova edge function para consolidar diagnosticos via IA |
| `src/components/admin/skills/ProjetosMapeadosTab.tsx` | Melhorar feedback de erro e mostrar pre-requisitos |
