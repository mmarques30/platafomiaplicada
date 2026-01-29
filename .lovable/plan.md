

# Reestruturação do Formulário Academy (Ajustado)

## Ajuste Solicitado

O campo `nome_completo` será **removido** do formulário porque o usuário já está cadastrado e essa informação vem do perfil de login (similar ao Business).

---

## Nova Estrutura Proposta (5 Steps)

### Step 1: Perfil e Motivação de Compra
**Campos a remover:** `nome_completo`, `idade`, `linkedin`, `tempo_experiencia`
**Campos a manter:** `profissao`, `area_atuacao`, `area_atuacao_outro`
**Campos a adicionar:**
- `como_conheceu_iaplicada` - Como chegou à IAplicada
- `motivo_compra` - O que motivou a adquirir o Academy
- `expectativa_produto` - O que espera conquistar

### Step 2: Experiência com IA
**Campos a manter:** `nivel_ia`, `ferramentas_ia`, `outras_ferramentas`, `frequencia_uso_ia`, `maior_dificuldade_ia`
**Campos a adicionar:**
- `ja_fez_curso_ia` - Se já fez algum curso/treinamento de IA
- `resultado_curso_anterior` - Qual foi o resultado (se aplicável)

### Step 3: Objetivos e Resultados
**Campos a manter:** `objetivo_principal` (reformulado), `area_aplicacao_ia`
**Campos a remover:** `objetivo_especifico`, `meta_3_meses`, `projetos_pessoais`
**Campos a adicionar:**
- `resultado_esperado_30_dias` - Vitória nos primeiros 30 dias
- `como_medir_sucesso` - Como saber que valeu a pena

### Step 4: Contexto e Potencial de Expansão (UPSELL)
**Campos a remover:** `desafio_1`, `desafio_2`, `desafio_3`, `maior_ladrao_tempo`
**Campos a manter:** `tempo_disponivel`
**Campos a adicionar:**
- `maior_desafio_profissional` - Campo único de desafio
- `tarefa_repetitiva_automatizar` - Tarefa que gostaria de automatizar
- `trabalha_em_empresa` - Empresa ou autônomo
- `equipe_poderia_usar_ia` - Trigger para Skills
- `interesse_projeto_customizado` - Trigger para Business

### Step 5: Comprometimento e Relacionamento
**Campos a manter:** `estilo_aprendizagem`, `nivel_comprometimento`, `quick_wins`
**Campos a remover:** `preferencia_aprendizado`
**Campos a adicionar:**
- `importancia_ia_carreira` - Nota de 1-10
- `recomendaria_amigo` - NPS para programa de indicação
- `preferencia_contato` - Canal preferido (WhatsApp, Email)

---

## Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| `src/components/mentoria/schema.ts` | Atualizar academyStep1-5Schema |
| `AcademyStep1Perfil.tsx` | Remover nome/idade/linkedin, adicionar motivação |
| `AcademyStep2Experiencia.tsx` | Adicionar experiência com cursos anteriores |
| `AcademyStep3Objetivos.tsx` | Reformular metas, adicionar medição sucesso |
| `AcademyStep4Desafios.tsx` | Renomear para contexto/expansão, adicionar upsell |
| `AcademyStep5Comprometimento.tsx` | Adicionar NPS e preferência contato |

---

## Resumo de Campos

| Antes | Depois |
|-------|--------|
| 23 campos | 22 campos |
| Nome pedido no form | Nome vem do login |
| Idade, LinkedIn | Removidos |
| 3 desafios separados | 1 desafio + contexto |
| Sem gatilhos upsell | Skills + Business triggers |
| Sem NPS | Com NPS e preferência contato |

