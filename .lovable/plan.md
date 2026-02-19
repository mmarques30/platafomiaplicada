

# Atualizar Calendario no Banco de Dados

## Problema

Os dados atuais na tabela `aulas_semanais` para 2026 estao desatualizados e com varias divergencias em relacao ao calendario oficial (HTML fornecido). Exemplos:
- Datas de lives no lugar errado (Heygen no dia 29/01 no DB, deveria ser 03/02)
- Temas trocados (02/02 no DB tem "Notion AI", deveria ser "Perplexity")
- Q&As ausentes no banco
- Status de "realizada" desatualizado

## Solucao

Deletar todos os registros de 2026 a partir de 12/01 e reinserir os 41 eventos extraidos do HTML:
- 15 Aulas ao Vivo (segundas, 19:30)
- 14 Q&As (quartas, 19:30)
- 12 Lives YouTube (tercas, 19:30)

Os registros anteriores a 12/01/2026 (aulas de 2025 e a de 07/01 e 08/01) serao mantidos sem alteracao.

## Dados a inserir

### Aulas ao Vivo (tipo_evento: aula_ao_vivo)

| Data | Tema | Realizada |
|------|------|-----------|
| 2026-01-12 | Kickoff 2026: O Mapa das Ferramentas de IA | Sim |
| 2026-01-19 | Claude Computer Use: Delegue Tarefas e Claude Executa | Sim |
| 2026-01-26 | Operator: O Agente da OpenAI que Navega por Voce | Sim |
| 2026-02-02 | Perplexity: Pesquisa Profissional com Fontes | Sim |
| 2026-02-09 | ManyChat + ChatGPT: Crie um Robo que Responde por Voce | Sim |
| 2026-02-23 | Zapier + IA: Automacoes Inteligentes | Nao |
| 2026-03-02 | Make: Cenarios Complexos sem Codigo | Nao |
| 2026-03-09 | Power Automate: Automacao no Mundo Microsoft | Nao |
| 2026-03-16 | Lovable: Apps Completos sem Programar | Nao |
| 2026-03-23 | Microsoft 365 Copilot: Word, Excel, PowerPoint | Nao |
| 2026-03-30 | Google Gemini: Workspace Turbinado | Nao |
| 2026-04-06 | Geracao de Imagens com IA: Midjourney, DALL-E, Leonardo | Nao |
| 2026-04-13 | n8n: Automacao Open Source com IA | Nao |
| 2026-04-20 | NotebookLM: Seus Documentos Viram Conhecimento | Nao |
| 2026-04-27 | Notion AI 2.0: O Que Mudou e Como Usar | Nao |

### Q&A (tipo_evento: qa)

| Data | Tema |
|------|------|
| 2026-01-22 | Claude: Artifacts Avancados |
| 2026-01-29 | Claude: Memory e Projects na Pratica |
| 2026-02-05 | Notion AI: Automacoes Nativas |
| 2026-02-12 | Zapier: Paths e Filtros Avancados |
| 2026-02-19 | Make: HTTP Requests e APIs |
| 2026-02-26 | Power Automate: Aprovacoes e Fluxos de Trabalho |
| 2026-03-05 | Lovable: Banco de Dados e Autenticacao |
| 2026-03-12 | Copilot: Prompts Avancados para Excel |
| 2026-03-19 | Gemini: Extensoes e Integracoes |
| 2026-03-26 | Midjourney: Parametros e Estilos Avancados |
| 2026-04-02 | n8n: Workflows com IA Integrada |
| 2026-04-09 | Perplexity: Collections e Pesquisa em Lote |
| 2026-04-16 | NotebookLM: Fontes Multiplas e Podcasts |
| 2026-04-23 | Gamma: Templates Custom e Marca Pessoal |

### Lives YouTube (tipo_evento: live_youtube)

| Data | Tema |
|------|------|
| 2026-01-27 | Testando Fireflies.ai ao Vivo |
| 2026-02-03 | Testando Heygen ao Vivo |
| 2026-02-10 | Testando ElevenLabs ao Vivo |
| 2026-02-24 | Testando Descript ao Vivo |
| 2026-03-03 | Testando Opus Clip ao Vivo |
| 2026-03-10 | Testando Suno ao Vivo |
| 2026-03-17 | Testando Motion ao Vivo |
| 2026-03-24 | Testando Runway Gen-3 ao Vivo |
| 2026-03-31 | Testando Ideogram 2.0 ao Vivo |
| 2026-04-07 | Testando Cursor ao Vivo |
| 2026-04-14 | Testando v0 by Vercel ao Vivo |
| 2026-04-28 | Testando Kling AI ao Vivo |

## Descricoes

Cada evento incluira o campo `descricao` extraido do HTML (ex: "Panorama completo: copilots, agentes, ferramentas verticais -- o que dominar este ano").

## Secao tecnica

### Operacoes no banco (via ferramenta de dados, nao migracao)

1. DELETE dos registros com `data_aula >= '2026-01-12'`
2. INSERT de 41 registros com todos os campos preenchidos (`tema`, `descricao`, `data_aula`, `horario`, `tipo_evento`, `ativo`, `realizada`)

Todos os novos registros terao `ativo = true` e `horario = '19:30'`.

Nenhuma alteracao de schema e necessaria -- a tabela `aulas_semanais` ja tem todos os campos necessarios.

