

# Adicionar Abas "Minha Analise" e "Analise da Equipe" nos Resultados do Diagnostico

## O que muda

Apos preencher o diagnostico Skills e ver os resultados, a tela de analise passara a ter **duas abas**:

1. **Minha Analise** - O diagnostico individual do usuario logado (conteudo atual do DiagnosticoResults)
2. **Analise da Equipe** - O diagnostico consolidado de toda a equipe (dados da tabela `diagnostico_consolidado_skills`)

A aba "Analise da Equipe" so aparece quando o admin tiver consolidado os diagnosticos no painel Mentoria Skills.

---

## Detalhes tecnicos

### Arquivo 1: `src/components/skills/diagnostico/DiagnosticoResults.tsx`

Refatorar para usar o componente `Tabs` do Radix:
- Aba "Minha Analise": mantem todo o conteudo atual (perfil, processos, economia, insights, trilha)
- Aba "Analise da Equipe": novo componente que exibe os dados consolidados
- Usar o hook `useSkillsEquipe` (ja existente) para buscar o `consolidado`
- Se nao houver consolidado, mostrar mensagem "Aguardando consolidacao pelo administrador"

### Arquivo 2: `src/components/skills/diagnostico/EquipeConsolidadoView.tsx` (novo)

Componente para renderizar os dados do diagnostico consolidado:
- **Dores Comuns** (`dores_comuns` - JSON array)
- **Processos com Maior Potencial** (`processos_maior_potencial` - JSON array)
- **Sobreposicoes de Esforco** (`sobreposicoes_esforco` - JSON array)
- **Recomendacoes** (`recomendacoes` - JSON array)
- **Economia Total** (`total_horas_manuais_semana`, `potencial_economia_horas`)
- **Insights IA** (`insights_ia` - texto)
- Data de geracao (`gerado_em`)

Seguira o mesmo estilo visual do DiagnosticoResults (cards com icones verde Skills).

### Logica de visibilidade

- As abas so aparecem quando o diagnostico individual estiver completo (estado "results")
- Se nao existir consolidado, a aba "Analise da Equipe" mostra estado vazio com mensagem informativa
- O banner "Aguardando Equipe" que ja existe no final do DiagnosticoResults sera movido para dentro da aba "Analise da Equipe" quando nao houver consolidado

