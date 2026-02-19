
# Diagnósticos com Versionamento no Skills

## Objetivo
Permitir que o usuario preencha novos diagnosticos sem sobrescrever o original, criando versoes numeradas. Cada versao gera sua propria analise de IA. No painel admin, todas as versoes ficam visiveis.

## Mudancas no Banco de Dados

### Tabela `diagnosticos_skills`
- Adicionar coluna `versao` (integer, default 1, NOT NULL)
- Remover constraint UNIQUE atual `(user_id, equipe_id)`
- Criar nova constraint UNIQUE `(user_id, equipe_id, versao)`

Isso permite multiplos registros por usuario na mesma equipe, diferenciados pela versao.

## Mudancas no Hook `useSkillsDiagnostico`

- A query principal passa a buscar **todos** os diagnosticos do usuario (ordenados por versao DESC)
- Novo estado `versaoSelecionada` para controlar qual versao esta sendo visualizada
- O diagnostico "ativo" (mais recente) e o padrao
- Ao criar novo diagnostico, calcula `versao = max(versao) + 1` automaticamente
- A funcao `saveAndProcess` cria um INSERT novo (nunca UPDATE de versao anterior)
- Expor: lista de versoes, versao atual, funcao para trocar versao, funcao para iniciar novo diagnostico

## Mudancas na Interface do Usuario

### Tela de Resultados (`DiagnosticoResults.tsx`)
- Na aba "Minha Analise", adicionar um botao/seletor no topo: **"Diagnostico v1"**, **"Diagnostico v2"**, etc.
- Cada botao carrega os resultados daquela versao
- Adicionar botao **"+ Novo Diagnostico"** que abre o formulario em branco para criar nova versao
- O botao "Refazer Diagnostico" existente sera substituido por "Novo Diagnostico (v{N+1})"

### Componente Orquestrador (`ProjetoSkillsDiagnostico.tsx`)
- Adaptar para receber a lista de versoes e controlar navegacao entre elas
- Ao clicar "Novo Diagnostico", exibir o formulario limpo (sem dados iniciais)
- Apos submeter, voltar para resultados ja na nova versao

## Mudancas no Painel Admin

### `DiagnosticosSkillsTab.tsx`
- Para cada membro, exibir todas as versoes do diagnostico
- Badge indicando a versao: "v1", "v2", etc.
- Cada versao pode ser expandida individualmente para ver respostas e insight de IA
- O botao "Processar com IA" funciona por versao

### `useDiagnosticosEquipeAdmin.ts`
- Alterar a interface `MembroDiagnostico` para incluir array de diagnosticos (todas versoes)
- A query passa a trazer todos os registros (nao apenas um por usuario)
- Agrupar por usuario, com lista de versoes dentro

## Detalhes Tecnicos

```text
diagnosticos_skills
+----------+---------+-----------+--------+
| user_id  | equipe_id | versao  | ...    |
+----------+---------+-----------+--------+
| user_A   | equipe_1  |   1     | (dados)|
| user_A   | equipe_1  |   2     | (dados)|
| user_B   | equipe_1  |   1     | (dados)|
+----------+---------+-----------+--------+
UNIQUE(user_id, equipe_id, versao)
```

### Fluxo do usuario
1. Usuario preenche diagnostico v1 -> resultados aparecem
2. Na aba "Minha Analise", ve os resultados da v1
3. Clica em "+ Novo Diagnostico" -> formulario limpo
4. Preenche e submete -> cria v2 com processamento IA
5. Volta para resultados, agora na v2
6. Pode alternar entre v1 e v2 clicando nos botoes de versao

### Impacto em outros hooks
- `useSkillsEquipeDiagnostico`: ajustar para considerar apenas a versao mais recente ao calcular progresso da equipe
- `useSkillsEquipe`: idem, buscar apenas versao mais recente para status de preenchimento
- `useSkillsLider`: idem
- Edge function `processar-diagnostico-skills`: sem mudanca (ja recebe diagnostico_id)
- Edge function `consolidar-diagnosticos-skills`: ajustar para usar apenas versao mais recente de cada membro

### Arquivos a criar/modificar
1. **Migration SQL** - adicionar coluna `versao`, trocar constraint
2. **`src/hooks/useSkillsDiagnostico.ts`** - versionamento completo
3. **`src/components/skills/ProjetoSkillsDiagnostico.tsx`** - orquestrar versoes
4. **`src/components/skills/diagnostico/DiagnosticoResults.tsx`** - seletor de versoes + botao novo diagnostico
5. **`src/hooks/admin/useDiagnosticosEquipeAdmin.ts`** - trazer todas versoes
6. **`src/components/admin/skills/DiagnosticosSkillsTab.tsx`** - exibir versoes no admin
7. **`src/hooks/useSkillsEquipeDiagnostico.ts`** - filtrar versao mais recente
8. **`src/hooks/useSkillsEquipe.ts`** - filtrar versao mais recente
9. **`src/hooks/useSkillsLider.ts`** - filtrar versao mais recente
