
# Plano: Painel do Líder com Sub-abas Internas

## Objetivo
Criar o conteudo completo do componente `SkillsPainelLider.tsx` com 6 secoes organizadas em sub-abas internas para melhor visualizacao, seguindo rigorosamente o design system especificado.

## Estrutura do Componente

O componente tera:
- Navegacao interna com 6 sub-abas (usando Radix Tabs)
- Dados mock conforme especificado
- Variaveis de cor da marca no topo
- Padroes visuais obrigatorios aplicados

### Sub-abas

```text
+----------------+------------------+-----------+-------------+----------+------------+
| Indicadores    | Status Equipe    | Entregas  | Cronograma  | Alertas  | Impacto    |
+----------------+------------------+-----------+-------------+----------+------------+
```

## Secoes Detalhadas

### 1. Indicadores Gerais (aba padrao)
- Grid 4 colunas com KPI cards usando `border-l-4` e `brandGreen`
- KPIs: Equipe Ativa (3 de 4), Horas Economizadas (31h/sem), Entregas Concluidas (4 de 7), Progresso Geral (57%)
- Icones: Users, Clock, CheckCircle, TrendingUp

### 2. Status da Equipe
- Titulo com `border-l-4 pl-4` + subtitulo
- Grid 2 colunas com cards por membro
- Cada card: avatar (iniciais), nome, cargo, badge status, metricas em linha, barra progresso, ultimo acesso, atividade recente
- Logica visual: atrasado = borda vermelha + bg-red-50

### 3. Entregas em Andamento
- Titulo de secao padronizado
- Tabela com header `brandBlack`
- Colunas: Entrega, Responsavel, Status, Progresso, Prazo/Economia
- Badges de status diferenciados por cor

### 4. Linha do Tempo (Cronograma)
- Barra de progresso horizontal grande
- Indicador "VOCE ESTA AQUI" na Semana 6
- Marcos abaixo: Fundacao (1-4), Expansao (5-8), Consolidacao (9-12)

### 5. Alertas e Acoes
- Lista de alertas em vermelho (atrasados) e amarelo (atencao)
- Card verde se nao houver alertas

### 6. Resumo de Impacto
- Card destacado com `border-2` e `brandGreen`
- Grid 4 colunas: 31h/sem, 4 entregas, 186h total, R$ 11.160
- Rodape: Investimento vs ROI (148%)
- Botoes: Exportar Relatorio e Compartilhar (decorativos)

## Dados Mock

Utilizarei os dados mock fornecidos:
- `equipe[]` com 4 colaboradores
- `entregas[]` com 7 itens
- `semanaAtual = 6` e `totalSemanas = 12`

## Variaveis de Cor

```typescript
const brandGreen = '#738925';
const brandGreenLight = '#AFC040';
const brandBeigeAlt = '#F5F5DC';
const brandBlack = '#0D0D0D';
```

## Arquivos a Modificar

| Arquivo | Acao |
|---------|------|
| `src/pages/skills/SkillsPainelLider.tsx` | Reescrever com conteudo completo |

## Detalhes Tecnicos

- Importar componentes: `Tabs, TabsList, TabsTrigger, TabsContent` de `@/components/ui/tabs`
- Importar icones do `lucide-react`: Users, Clock, CheckCircle, TrendingUp, AlertCircle
- Usar `Table, TableHeader, TableBody, TableRow, TableHead, TableCell` de `@/components/ui/table`
- Componente funcional com export default
- Nao usar sombras pesadas, gradientes ou cores fora da paleta
- Nao incluir emojis no codigo

## Padroes Visuais Aplicados

1. **Titulo de secao**: `border-l-4 pl-4` com `borderColor: brandGreen`
2. **Card padrao**: `bg-white p-6 rounded-lg border border-gray-200`
3. **KPI card**: `bg-white p-4 rounded-lg border-l-4` com `borderColor: brandGreen`
4. **Barra progresso**: container `bg-gray-200 rounded-full h-2`, fill com `brandGreen`
5. **Badges status**: Em dia (verde), Atencao (amarelo), Atrasado (vermelho)
6. **Header tabela**: `backgroundColor: brandBlack, color: white`
7. **Card destaque**: `border-2` com `borderColor: brandGreen`

## Navegacao das Abas

```typescript
<Tabs defaultValue="indicadores" className="space-y-6">
  <TabsList className="bg-white border border-gray-200 rounded-lg p-1 w-full grid grid-cols-6 gap-1">
    <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
    <TabsTrigger value="equipe">Equipe</TabsTrigger>
    <TabsTrigger value="entregas">Entregas</TabsTrigger>
    <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
    <TabsTrigger value="alertas">Alertas</TabsTrigger>
    <TabsTrigger value="impacto">Impacto</TabsTrigger>
  </TabsList>
  
  <TabsContent value="indicadores">...</TabsContent>
  <TabsContent value="equipe">...</TabsContent>
  ...
</Tabs>
```
