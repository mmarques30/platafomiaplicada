

# Sub-aba "Diagnostico" na pagina Projeto Skills

## Resumo
Adicionar uma nova sub-aba **"Diagnostico"** na pagina Projeto Skills (`/skills/projeto`) com um dashboard completo do membro. Essa aba apresentara o formulario de diagnostico expandido (10 blocos), estados de processamento, e apos o preenchimento, exibira os resultados individuais: perfil mapeado, processos identificados, economia potencial, trilha personalizada e status da equipe. Acesso restrito a administradores e lideres.

---

## Estrutura Visual

A pagina Projeto Skills passara a ter 3 abas:
- **Visao Geral** (placeholder atual)
- **Performance** (dashboard analitico ja existente)
- **Diagnostico** (NOVO - dashboard do membro)

### Aba Diagnostico - Estados

**Estado 1: Formulario nao preenchido**
Formulario com 10 blocos em steps sequenciais:
1. Sobre Voce (cargo, area, tempo funcao, ferramentas usadas)
2. Rotina (horas repetitivas, atividade principal, frequencia, tempo gasto)
3. Processos Detalhados (3 processos com passo a passo, frequencia, tempo, ferramentas, impacto, tentou automatizar)
4. Objetivos (o que espera da IA, resultado de sucesso, nivel autonomia)
5. Contexto Tecnico (nivel tecnico, ferramentas de automacao, uso de IA)
6. Disponibilidade (horas/semana, melhor horario, preferencia de conteudo)
7. Empresa (tamanho area, sistemas ERP, iniciativas IA, maturidade digital)
8. Desafios (3 desafios principais, processo colaborativo, o que automatizaria)
9. Contexto Organizacional (apoio lideranca, restricoes TI, objetivo do programa, areas de automacao)
10. Expectativas (resultado da equipe, projeto colaborativo, barreiras)

- Barra de progresso no topo
- Botoes Anterior/Proximo em cada step
- Botao "Enviar Diagnostico" no ultimo step

**Estado 2: Processando (apos envio)**
- Animacao de loading com spinner
- Mensagem "Analisando seu perfil..."

**Estado 3: Diagnostico Individual Concluido (aguardando equipe)**
- Card "Seu Perfil Mapeado" com dados resumidos
- Card "Seus Processos Identificados" com lista de processos, frequencia, tempo e impacto
- Card "Sua Economia Potencial" com calculo de horas e valor monetario
- Card "Sua Trilha Personalizada" com modulos e tempo estimado
- Banner "Aguardando Equipe" com status de preenchimento dos membros e lista do que sera liberado

---

## Controle de Acesso

- Apenas **administradores** (`isAdmin`) e **lideres** (`isLider`) verao a aba Diagnostico
- Mesma logica ja usada para a aba Performance
- Nenhuma alteracao no hook `useSkillsMembro` ou `useUserRole`

---

## Detalhes Tecnicos

### Arquivos a Criar

**`src/components/skills/ProjetoSkillsDiagnostico.tsx`**
- Componente principal da sub-aba Diagnostico
- Gerencia estado do formulario (10 steps) com `useState`
- 3 estados visuais: formulario, processando, resultados
- Dados 100% mockados inicialmente para demonstracao
- Dados mockados incluem:
  - Estado do diagnostico (completado/pendente)
  - Dados do formulario pre-preenchidos no estado de resultado
  - Status da equipe (4 membros, 2 preenchidos, 2 pendentes)
  - Processos identificados com metricas
  - Economia potencial calculada
  - Trilha personalizada com modulos

### Arquivos a Modificar

**`src/pages/skills/ProjetoSkills.tsx`**
- Adicionar terceira aba "Diagnostico" no `TabsList`
- Importar `ProjetoSkillsDiagnostico`
- Adicionar `TabsContent` com value="diagnostico"
- Aba visivel apenas quando `canSeePerformance` (admin ou lider)

### Nenhuma Alteracao no Banco de Dados
- Dados 100% mockados no frontend
- A tabela `diagnosticos_skills` ja existe com os campos necessarios
- Futuramente sera conectado ao hook `useSkillsDiagnostico`

### Bibliotecas Utilizadas (ja instaladas)
- `@radix-ui/react-tabs` (sistema de abas)
- `@radix-ui/react-select` (selects do formulario)
- `@radix-ui/react-checkbox` (checkboxes de ferramentas/objetivos)
- `@radix-ui/react-radio-group` (radio buttons)
- `@radix-ui/react-progress` (barra de progresso)
- `@radix-ui/react-separator` (separadores visuais)
- `lucide-react` (icones)

### Padrao Visual
- Cards com borda `border-border` e fundo `bg-card`
- Cores Skills: `hsl(72,50%,35%)` (verde principal), `hsl(68,35%,73%)` (verde claro), `hsl(68,40%,88%)` (verde muito claro)
- Badges para status: verde (concluido), amarelo/laranja (em andamento), vermelho (atrasado)
- Tipografia consistente com os componentes existentes no projeto
- Separacao de blocos (Individual vs Equipe) com Separators e labels de secao

### Dados Mockados para Demonstracao

```text
Perfil Mapeado:
- Cargo: Analista Financeiro
- Area: Financeiro
- Nivel Tecnico: Intermediario
- Disponibilidade: 4-6h/semana

Processos Identificados:
1. Consolidacao de dados financeiros | Diaria | 2h/vez | Impacto Alto
2. Relatorios gerenciais semanais   | Semanal | 4h/vez | Impacto Alto
3. Conciliacao bancaria             | Semanal | 1h/vez | Impacto Medio

Economia Potencial:
- Tempo atual: 15h/semana
- Economia estimada: 10-12h/semana
- Valor potencial mensal: R$ 2.880

Status Equipe:
- Total: 4 membros
- Preenchidos: 2
- Pendentes: Colaborador C, Colaborador D

Trilha Personalizada:
- 8 modulos selecionados
- Tempo estimado: 24 horas de estudo
```
