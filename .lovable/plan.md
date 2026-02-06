

# Backend para Diagnostico Skills com IA Lovable

## Resumo
Criar o backend completo para gerenciar os dados do Diagnostico Skills, incluindo:
1. Expandir a tabela `diagnosticos_skills` com campos adicionais para armazenar dados do formulario expandido e resultados da IA
2. Criar edge function `processar-diagnostico-skills` que usa Lovable AI para interpretar as respostas e gerar insights personalizados
3. Atualizar o hook `useSkillsDiagnostico` para conectar o formulario ao banco de dados
4. Integrar os resultados da IA no componente DiagnosticoResults

---

## 1. Alteracoes no Banco de Dados

### Novos campos na tabela `diagnosticos_skills`

Campos adicionais para o formulario expandido (10 blocos):

```text
-- Bloco 1-2: Sobre Voce e Rotina
horas_repetitivas TEXT
atividade_principal TEXT
frequencia_atividade TEXT
tempo_gasto TEXT

-- Bloco 3: Processos Detalhados (JSONB para 3 processos)
processos_detalhados JSONB DEFAULT '[]'
-- Estrutura: [{ nome, passos, frequencia, tempo, impacto, tentouAutomatizar }]

-- Bloco 4: Objetivos
objetivos_ia JSONB DEFAULT '[]'
resultado_sucesso TEXT
autonomia TEXT

-- Bloco 5: Contexto Tecnico
nivel_tecnico TEXT
ferramentas_automacao JSONB DEFAULT '[]'
uso_ia TEXT

-- Bloco 6: Disponibilidade
horas_semana TEXT
melhor_horario JSONB DEFAULT '[]'
preferencia_conteudo TEXT

-- Bloco 7: Empresa
tamanho_area TEXT
sistemas_erp JSONB DEFAULT '[]'
iniciativas_ia TEXT
maturidade_digital TEXT

-- Bloco 8: Desafios
desafios JSONB DEFAULT '[]'
processo_colaborativo TEXT
automatizar_empresa TEXT

-- Bloco 9: Contexto Organizacional
apoio_lideranca TEXT
restricoes_ti TEXT
objetivo_programa JSONB DEFAULT '[]'
areas_automacao JSONB DEFAULT '[]'

-- Bloco 10: Expectativas
resultado_equipe TEXT
projeto_colaborativo TEXT
barreiras TEXT

-- Campos de Resultado IA
insight_ia JSONB
insight_gerado_em TIMESTAMPTZ
economia_horas_semana NUMERIC DEFAULT 0
economia_valor_mensal NUMERIC DEFAULT 0
trilha_sugerida JSONB
processos_analisados JSONB
```

---

## 2. Edge Function: `processar-diagnostico-skills`

### Funcionalidade
- Recebe o ID do diagnostico
- Busca dados completos do diagnostico
- Envia para Lovable AI (google/gemini-2.5-flash) com prompt especializado
- Gera analise de:
  - Processos identificados com frequencia/impacto
  - Calculo de economia potencial (horas e valor monetario)
  - Trilha personalizada com modulos recomendados
  - Insights estrategicos para o perfil
- Salva resultados no banco

### Prompt da IA
Prompt especializado para analisar o perfil do membro Skills e gerar:
1. Classificacao de impacto dos processos (Alto/Medio/Baixo)
2. Calculo de economia: horas_semana * frequencia * potencial_automacao
3. Modulos recomendados baseados no perfil tecnico e area
4. Primeiros passos praticos

### Estrutura de resposta esperada (JSON)
```text
{
  "perfil": { cargo, area, nivelTecnico, disponibilidade },
  "processos": [{ nome, frequencia, tempo, impacto, potencialAutomacao }],
  "economia": { horasSemana, economiaEstimada, valorMensal },
  "trilha": { modulos, tempoEstimado, prioridades },
  "insights": { analise, oportunidades, primeirosPassos }
}
```

---

## 3. Atualizacao do Hook useSkillsDiagnostico

### Novas funcionalidades
- `saveAndProcessDiagnostico()`: Salva dados e chama edge function para processar com IA
- `isProcessing`: Estado de processamento da IA
- `resultados`: Dados processados pela IA

### Fluxo
1. Usuario preenche formulario (10 steps)
2. Ao clicar "Enviar", salva no banco com `completado = true`
3. Chama edge function `processar-diagnostico-skills`
4. Aguarda resposta e atualiza estado
5. Exibe resultados no DiagnosticoResults

---

## 4. Atualizacao do DiagnosticoResults

### Mudancas
- Receber dados reais do hook em vez de mocks
- Fallback para mocks quando nao ha dados
- Exibir status de processamento da IA
- Mostrar insights gerados

### Componentes atualizados
- Perfil Mapeado: dados do diagnostico
- Processos Identificados: lista analisada pela IA
- Economia Potencial: calculos da IA
- Trilha Personalizada: modulos recomendados

---

## 5. Arquivos a Criar

### `supabase/functions/processar-diagnostico-skills/index.ts`
Edge function que:
- Valida autenticacao
- Busca diagnostico do banco
- Monta contexto para IA com dados do formulario
- Chama Lovable AI Gateway
- Parseia resposta JSON
- Atualiza diagnostico com resultados
- Retorna dados processados

---

## 6. Arquivos a Modificar

### `src/hooks/useSkillsDiagnostico.ts`
- Adicionar interface expandida com todos os campos
- Adicionar mutation para processar com IA
- Adicionar estado de processamento

### `src/components/skills/diagnostico/DiagnosticoForm.tsx`
- Conectar ao hook para salvar dados reais
- Chamar processamento ao enviar

### `src/components/skills/diagnostico/DiagnosticoResults.tsx`
- Receber props de dados reais
- Manter fallback para mocks quando sem dados
- Exibir insights da IA

### `src/components/skills/ProjetoSkillsDiagnostico.tsx`
- Integrar hook e passar dados entre estados

### `supabase/config.toml`
- Adicionar configuracao da nova edge function

---

## 7. Detalhes Tecnicos

### Lovable AI
- Modelo: google/gemini-2.5-flash (rapido e eficiente)
- Endpoint: https://ai.gateway.lovable.dev/v1/chat/completions
- Autenticacao: LOVABLE_API_KEY (ja configurado)

### Seguranca
- Edge function com verify_jwt = true
- RLS ja configurado na tabela diagnosticos_skills
- Validacao de user_id no servidor

### Integracao Mentoria > Skills
- Os dados do diagnostico Skills complementam o diagnostico de mentoria
- Campo `insight_ia` armazena analise completa
- Possibilidade futura de cruzar dados com formulario_diagnostico

---

## Resumo de Arquivos

### Criar
- `supabase/functions/processar-diagnostico-skills/index.ts`

### Modificar
- Tabela `diagnosticos_skills` (migracao SQL)
- `src/hooks/useSkillsDiagnostico.ts`
- `src/components/skills/diagnostico/DiagnosticoForm.tsx`
- `src/components/skills/diagnostico/DiagnosticoResults.tsx`
- `src/components/skills/ProjetoSkillsDiagnostico.tsx`
- `supabase/config.toml`

