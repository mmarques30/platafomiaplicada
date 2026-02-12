
# Adicionar "Editar Dados" e "Limpar Dados" em cada aba do Mentoria Skills

## Resumo

Adicionar em cada aba do Mentoria Skills um menu de acoes com duas opcoes: **"Editar Dados"** (abre modal para edicao em massa ou redireciona para edicao inline existente) e **"Limpar Dados"** (apaga todos os dados daquela aba para a equipe selecionada, com confirmacao).

Sera criado um componente reutilizavel `TabActionsMenu` com um dropdown contendo as duas opcoes, usado em todas as abas.

## O que muda para o usuario

- Cada aba tera um botao de acoes (icone engrenagem ou "..." ) no canto superior direito
- Ao clicar, aparece um dropdown com "Editar Dados" e "Limpar Dados"
- "Limpar Dados" abre um AlertDialog de confirmacao antes de apagar
- Apos limpar, os dados da aba sao removidos e a interface atualiza automaticamente

## Detalhes Tecnicos

### 1. Componente reutilizavel: `SkillsTabActions.tsx`

**Arquivo novo:** `src/components/admin/skills/SkillsTabActions.tsx`

Componente que recebe:
- `onClear`: funcao async para limpar dados (com confirmacao interna via AlertDialog)
- `onEdit?`: funcao opcional para acao de edicao (quando a aba nao tem edicao inline)
- `clearLabel?`: texto customizado (default: "Limpar Dados")
- `clearDescription?`: descricao do que sera apagado
- `editLabel?`: texto customizado (default: "Editar Dados")
- `hasData`: boolean que desabilita o botao limpar quando nao ha dados

Renderiza um `DropdownMenu` com as opcoes.

### 2. Logica de limpeza por aba

Cada aba chama um DELETE no Supabase filtrando por `equipe_id`:

| Aba | Tabela(s) a limpar | Notas |
|---|---|---|
| Contrato | `contratos_skills` | Ja tem "Limpar Tudo" — sera mantido e integrado |
| Diagnosticos | `diagnosticos_skills`, `diagnostico_consolidado_skills` | Limpa respostas e consolidado |
| Secoes | Sem dados persistidos | Botao desabilitado ou oculto |
| Projetos | `backlog_skills` | Limpa projetos mapeados |
| Entregas | `entregas_skills` | Limpa entregas geradas |
| Entregas Equipe | `entregas_equipe_skills` | Limpa dados da equipe |
| Metricas | `metricas_skills` | Limpa metricas semanais |
| Documentos | `documentos_skills`, `links_skills` | Limpa docs e links |
| Reports | `reports_skills` | Limpa reports |

### 3. Modificacoes por arquivo

**Cada aba recebe o componente `SkillsTabActions`** no header, ao lado do titulo:

- `DiagnosticosSkillsTab.tsx` — adicionar dropdown com limpar diagnosticos + consolidado
- `ProjetosMapeadosTab.tsx` — adicionar dropdown com limpar backlog
- `SkillsEntregasTab.tsx` — adicionar dropdown com limpar entregas
- `SkillsEntregasEquipeTab.tsx` — adicionar dropdown com limpar entregas equipe
- `SkillsMetricasTab.tsx` — adicionar dropdown com limpar metricas
- `DocumentosSkillsManager.tsx` — adicionar dropdown com limpar docs + links
- `ReportsSkillsManager.tsx` — adicionar dropdown com limpar reports
- `ContratoSkillsManager.tsx` — ja tem "Limpar Tudo", integrar no mesmo padrao
- `SecoesTrimestraisTab.tsx` — sem dados para limpar, nao adicionar

A acao "Editar Dados" nas abas que ja possuem edicao inline (Entregas, Metricas, Contrato) abrira o formulario de edicao existente. Nas demais abas (Diagnosticos, Projetos), sera omitida pois nao faz sentido editar em massa.

## Arquivos

**Novo:**
- `src/components/admin/skills/SkillsTabActions.tsx`

**Modificados:**
- `src/components/admin/skills/DiagnosticosSkillsTab.tsx`
- `src/components/admin/skills/ProjetosMapeadosTab.tsx`
- `src/components/admin/skills/SkillsEntregasTab.tsx`
- `src/components/admin/skills/SkillsEntregasEquipeTab.tsx`
- `src/components/admin/skills/SkillsMetricasTab.tsx`
- `src/components/admin/skills/DocumentosSkillsManager.tsx`
- `src/components/admin/skills/ReportsSkillsManager.tsx`
- `src/components/admin/skills/ContratoSkillsManager.tsx`
