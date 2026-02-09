
# Reestruturar Admin Skills: Layout Business com Contrato, Diagnosticos, Projetos, Documentos e Reports

## Contexto

A pagina `MentoriaSkillsPage` sera reestruturada para seguir o mesmo layout da `MentoriaBusinessPage`, mas adaptada para o contexto B2B de equipes Skills. A diferenca fundamental:

- **Business**: seletor por usuario individual, "modulos contratados" sao servicos (CRM, Financeiro, etc.)
- **Skills**: seletor por equipe, "projetos por trilhas de ensino" sao entregas vinculadas a trilhas de conteudo da plataforma (ex: Automacao, Planilhas com IA, etc.)

## Estrutura de abas (8 abas)

```
[Contrato] [Diagnosticos] [Secoes] [Projetos] [Entregas] [Metricas] [Documentos] [Reports]
```

### Aba 1: Contrato
Contrato da equipe Skills com processamento IA. Secoes colapsaveis:
- **Contratante**: empresa, CNPJ, representante, email
- **Programa**: duracao (semanas), frequencia de encontros, reports (trimestral), data inicio/fim
- **Projetos por Trilha**: em vez de "modulos contratados", um seletor de trilhas de ensino da plataforma (carregadas de `trilhas`), cada trilha com projetos associados. Ex: "Trilha Automacao > Projeto: Automatizar RH"
- **Valores**: valor contrato, ROI projetado, custo/hora
- Importacao com IA (reutiliza o padrao `ContratoImportSection`)
- Botao "Limpar Tudo"

### Aba 2: Diagnosticos
Visao admin dos diagnosticos individuais dos membros:
- Lista de membros com status (preenchido / pendente / processado por IA)
- Expandir membro para ver resultado IA (insight_ia, processos_analisados, economia)
- Botao "Processar com IA" para diagnosticos nao processados
- Barra de progresso geral da equipe

### Aba 3: Secoes (Trimestral)
Gerenciamento das secoes trimestrais (T1-T4):
- Cards por trimestre com status, datas, entregas planejadas
- Dentro de cada trimestre: encontros agendados
- Botao para gerar encontros automaticamente baseado no contrato

### Aba 4: Projetos Mapeados
Projetos gerados a partir dos diagnosticos + IA:
- Botao "Gerar Projetos com IA" que analisa diagnosticos e sugere projetos
- Lista de projetos com responsavel, trilha vinculada, ROI estimado
- Vincula ao `backlog_skills` existente

### Aba 5: Entregas (existente, SkillsEntregasTab)
Mantida.

### Aba 6: Metricas (existente, SkillsMetricasTab)
Mantida.

### Aba 7: Documentos
Upload de documentos + links importantes (mesmo padrao do Business adaptado para equipe).

### Aba 8: Reports
Reports trimestrais com geracao via IA.

## Banco de dados - 4 novas tabelas

### `contratos_skills`
| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid PK | |
| equipe_id | uuid FK equipes_skills | 1 contrato por equipe |
| empresa_nome | text | Razao social |
| cnpj | text | |
| representante_nome | text | |
| representante_email | text | |
| duracao_programa_semanas | integer (default 12) | |
| frequencia_encontros | text | "semanal", "quinzenal" |
| reports_frequencia | text (default "trimestral") | |
| data_inicio | date | |
| data_fim | date | |
| valor_contrato | numeric | |
| roi_projetado | numeric | |
| projetos_por_trilha | jsonb | Array de {trilha_id, trilha_titulo, projetos: [{titulo, descricao}]} |
| entregas_esperadas | jsonb | |
| observacoes | text | |
| status | text (default "ativo") | |
| created_at, updated_at | timestamptz | |

O campo `projetos_por_trilha` substitui `modulos_contratados` do Business. Armazena a relacao de projetos vinculados a trilhas de ensino.

### `documentos_skills`
| Coluna | Tipo |
|--------|------|
| id | uuid PK |
| equipe_id | uuid FK |
| titulo | text |
| tipo | text ("contrato", "transcricao", "anexo", "solucao", "outro") |
| arquivo_url | text |
| para_processamento_ia | boolean (default false) |
| created_at | timestamptz |

### `reports_skills`
| Coluna | Tipo |
|--------|------|
| id | uuid PK |
| equipe_id | uuid FK |
| contrato_id | uuid FK nullable |
| titulo | text |
| descricao | text |
| periodo_referencia | text (ex: "T1 2026") |
| trimestre | integer (1-4) |
| data_envio | timestamptz |
| arquivo_url | text |
| conteudo_html | text |
| resumo_executivo | text |
| metricas | jsonb |
| gerado_por_ia | boolean (default false) |
| created_at | timestamptz |

### `links_skills`
| Coluna | Tipo |
|--------|------|
| id | uuid PK |
| equipe_id | uuid FK |
| titulo | text |
| url | text |
| descricao | text |
| icone | text (default "link") |
| ordem | integer (default 0) |
| created_at | timestamptz |

RLS: todas com `enable RLS` + policies para usuarios autenticados com role admin.

## Edge Functions (3 novas)

### `processar-contrato-skills`
Similar ao `parse-contrato-texto` mas adaptado para Skills:
- Extrai dados da contratante
- Extrai dados do programa (semanas, frequencia)
- Extrai **projetos por trilha de ensino** (em vez de modulos de servico)
- Extrai valores
- Usa Lovable AI (Gemini)

### `gerar-projetos-skills`
- Recebe equipe_id
- Busca todos os `diagnosticos_skills` da equipe
- Consolida processos e gargalos
- Usa IA para sugerir projetos com trilha vinculada, responsavel, ROI
- Salva no `backlog_skills`

### `gerar-report-skills`
- Recebe equipe_id e trimestre
- Busca metricas, entregas, diagnosticos
- Gera report HTML trimestral com KPIs
- Salva em `reports_skills`

## Hooks (5 novos)

- `src/hooks/admin/useContratosSkills.ts` - CRUD contrato da equipe
- `src/hooks/admin/useDocumentosSkills.ts` - CRUD documentos
- `src/hooks/admin/useLinksSkills.ts` - CRUD links
- `src/hooks/admin/useReportsSkills.ts` - CRUD reports
- `src/hooks/admin/useDiagnosticosEquipeAdmin.ts` - Lista diagnosticos de todos os membros

## Componentes (8 novos)

- `src/components/admin/skills/ContratoSkillsManager.tsx` - Formulario com secoes colapsaveis
- `src/components/admin/skills/ContratoSkillsImportSection.tsx` - Import com IA
- `src/components/admin/skills/DiagnosticosSkillsTab.tsx` - Lista membros + status + expandir resultados
- `src/components/admin/skills/SecoesTrimestraisTab.tsx` - Cards T1-T4 com encontros
- `src/components/admin/skills/ProjetosMapeadosTab.tsx` - Projetos gerados por IA
- `src/components/admin/skills/DocumentosSkillsManager.tsx` - Upload + links
- `src/components/admin/skills/ReportsSkillsManager.tsx` - Reports trimestrais
- `src/components/admin/skills/GerarReportSkillsModal.tsx` - Modal geracao IA

## Pagina reescrita

`src/pages/admin/mentoria/MentoriaSkillsPage.tsx` - De 4 abas para 8 abas, mantendo o seletor de equipe e as abas existentes (Entregas e Metricas), adicionando Contrato, Diagnosticos, Secoes, Projetos, Documentos e Reports.

## Secao "Projetos por Trilha" (diferencial Skills)

Na aba Contrato, a secao de "Projetos por Trilha" funciona assim:
1. Dropdown para selecionar uma trilha (carregada de `trilhas` do banco)
2. Ao selecionar, pode-se adicionar projetos vinculados aquela trilha
3. Cada projeto tem titulo e descricao
4. A IA do contrato pode extrair essa relacao automaticamente do texto importado
5. Armazenado como JSON no campo `projetos_por_trilha`

Exemplo de dado:
```json
[
  {
    "trilha_id": "39a7856f-...",
    "trilha_titulo": "Planilhas e Dados com IA",
    "projetos": [
      {"titulo": "Automatizar relatorios mensais", "descricao": "..."},
      {"titulo": "Dashboard de vendas", "descricao": "..."}
    ]
  },
  {
    "trilha_id": "8118b647-...",
    "trilha_titulo": "Fundamentos de Automacao",
    "projetos": [
      {"titulo": "Automatizar onboarding RH", "descricao": "..."}
    ]
  }
]
```

## Resumo

- 4 tabelas novas + RLS
- 3 edge functions novas
- 5 hooks novos
- 8 componentes novos
- 1 pagina reescrita (MentoriaSkillsPage)
- Nenhum arquivo existente deletado (abas Entregas e Metricas mantidas)
- Storage bucket existente `contratos-business` pode ser reutilizado ou criar `documentos-skills`
