
# Plano: Ajustes no Formulário Business com Compatibilidade Retroativa

## Diagnóstico da Situação Atual

### Descoberta Importante
Ao analisar o banco de dados, descobri que:
- A tabela `formulario_diagnostico` **não possui os campos Business** (cargo_atual, problema_principal, etc.)
- Os campos existentes são apenas do Academy/Legacy
- Isso significa que os formulários Business atuais **não estão salvando corretamente** os dados específicos

### Estrutura Atual da Tabela
A tabela tem apenas campos do Academy/Legacy:
- nome_completo, idade, profissao, area_atuacao, etc.
- **NÃO TEM**: cargo_atual, empresa_nome, problema_principal, urgencia_solucao, etc.

---

## Estratégia de Implementação

### 1. Adicionar Novos Campos Business (Migração SQL)

Adicionar **todos os campos Business** (novos e antigos) na tabela para garantir:
- Formulários antigos que tentaram salvar tenham os campos disponíveis
- Novos formulários usem a nova estrutura

**Campos a adicionar:**

```sql
-- Step 1 (Perfil) - Existentes que faltam + Novos
cargo_atual TEXT,
empresa_nome TEXT,
tem_equipe BOOLEAN,
como_conheceu_iaplicada TEXT,        -- NOVO
desafio_principal_negocio TEXT,       -- NOVO

-- Step 2 (Construir) - Existentes que faltam
problema_principal TEXT,
processo_automatizar TEXT,
resultado_esperado TEXT,
ja_tentou_antes TEXT,

-- Step 3 (Impacto) - NOVOS (substituem urgencia/sistemas/volume)
impacto_financeiro_estimado TEXT,     -- NOVO
outras_areas_potencial TEXT,          -- NOVO
kpi_principal TEXT,                   -- NOVO
orcamento_expansao TEXT,              -- NOVO
-- Manter antigos para compatibilidade
urgencia_solucao TEXT,
sistemas_integrar JSONB,
outros_sistemas TEXT,
quem_vai_usar TEXT,
volume_uso TEXT,

-- Step 4 (Decisão) - NOVOS (substituem acompanhamento)
decisores_tecnologia TEXT,            -- NOVO
decisor_especifico TEXT,              -- NOVO
motivo_escolha_iaplicada TEXT,        -- NOVO
experiencia_consultorias TEXT,        -- NOVO
-- Manter antigos para compatibilidade
preferencia_acompanhamento TEXT,
nivel_envolvimento TEXT,
outros_decisores TEXT,
preferencia_comunicacao TEXT,

-- Step 5 (Expansão) - NOVOS (substituem aprendizado)
interesse_alem_entrega JSONB,         -- NOVO (array)
areas_futuro_ia JSONB,                -- NOVO (array)
proximo_projeto_ia TEXT,              -- NOVO
pessoas_para_capacitar_skills TEXT,   -- NOVO
-- Manter antigos para compatibilidade
quer_aprender TEXT,
o_que_aprender TEXT,
equipe_precisa_aprender TEXT,
quantos_capacitar INTEGER,
disponibilidade_treinamento TEXT,

-- Step 6 (Sucesso) - NOVOS
definicao_sucesso TEXT,               -- NOVO
gatilho_renovacao TEXT,               -- NOVO
importancia_projeto INTEGER,          -- NOVO (1-10)
agendar_call_alinhamento TEXT,        -- NOVO
-- Manter antigos para compatibilidade
como_medir_sucesso TEXT,
maior_preocupacao TEXT,
nao_pode_acontecer TEXT,
```

---

### 2. Atualizar Schema (schema.ts)

Criar **dois schemas Business**:
1. `businessLegacySchemas` - para exibir/validar formulários antigos
2. `businessNewSchemas` - para novos formulários

O schema de exibição (admin) vai aceitar **ambos os formatos**.

---

### 3. Atualizar Steps do Formulário

**Manter o campo `nome_completo` removido** (já implementado) - preenchido automaticamente.

**Novos Steps:**

| Step | Nome Atual | Novo Nome | Mudança |
|------|------------|-----------|---------|
| 1 | Perfil | Perfil e Contexto | + como_conheceu + desafio_negocio |
| 2 | Solução | (manter) | Sem alterações |
| 3 | Contexto | Visão de Impacto | Novas perguntas estratégicas |
| 4 | Projeto | Tomada de Decisão | Novas perguntas sobre stakeholders |
| 5 | Aprender | Interesse em Expansão | Foco em Skills (upsell) |
| 6 | Sucesso | Sucesso e Parceria | Foco em retenção |

---

### 4. Atualizar Visualização Admin

O `RespostasDiagnosticoDrawer.tsx` e `DiagnosticoPreviewModal.tsx` devem:
- Exibir campos **antigos OU novos** (o que existir)
- Adicionar labels para os novos campos no `FIELD_LABELS`

---

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| **Migração SQL** | Adicionar todos os campos Business na tabela |
| `src/components/mentoria/schema.ts` | Atualizar schemas Business para nova estrutura |
| `BusinessStep1Perfil.tsx` | Adicionar 2 perguntas novas |
| `BusinessStep3Contexto.tsx` | Reescrever → "Visão de Impacto" |
| `BusinessStep4Acompanhamento.tsx` | Reescrever → "Tomada de Decisão" |
| `BusinessStep5Aprendizado.tsx` | Reescrever → "Interesse em Expansão" |
| `BusinessStep6Expectativas.tsx` | Reescrever → "Sucesso e Parceria" |
| `DiagnosticoPreviewModal.tsx` | Atualizar labels e títulos |
| `RespostasDiagnosticoDrawer.tsx` | Exibir campos antigos e novos |
| `FormularioWizard.tsx` | Atualizar labels dos steps |

---

## Compatibilidade Garantida

### Para Formulários Antigos:
- Campos antigos **mantidos na tabela** (urgencia_solucao, quer_aprender, etc.)
- Admin exibe os dados que existirem
- Nenhum dado perdido

### Para Novos Formulários:
- Usam os novos campos estratégicos
- nome_completo preenchido automaticamente do perfil
- Opção Academy removida do upsell (já incluso no Business)
- Skills destacado como upsell de capacitação de equipe

---

## Resultado Final

1. **Formulários antigos continuam visíveis** no admin com seus dados originais
2. **Novos formulários capturam dados estratégicos** para upsell e retenção
3. **Uma única tabela** com todos os campos (antigos + novos)
4. **Admin inteligente** que exibe o que existir em cada formulário
