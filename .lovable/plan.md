
# Plano: Corrigir Card de Reports + Reformular Gráfico de ROI

## Problemas Identificados

### 1. Cards de Reports Duplicados
Na imagem do Roadmap, há um card "Reports" que não deveria estar lá - ele só deve aparecer em **Visão Geral**.

**Localização do problema:**
- `Mentoria.tsx` linha 88: `BusinessReportsCard` está apenas na aba Visão Geral ✅
- `BusinessExecutiveRoadmap.tsx` linhas 134-207: Há um card "Reports" **embutido** no componente de Roadmap ❌

### 2. Gráfico ROI Precisa de Duas Curvas
O gráfico atual tem apenas uma curva (ROI Projetado) baseada em dados mockados. Precisa:
- **Curva 1: ROI Projetado** - Estimativa calculada com base nas entregas cadastradas e prazos
- **Curva 2: ROI Executado** - Progresso real baseado na conclusão das entregas

---

## Solução

### Parte 1: Remover Reports do Roadmap

**Arquivo:** `src/components/mentoria/business/BusinessExecutiveRoadmap.tsx`
- Remover completamente o card de Reports (linhas 134-207)
- Remover imports não utilizados (`FileText`, `ChevronRight`, `Collapsible`, etc.)
- Remover estado `reportsExpanded`
- Remover `reports` do hook

### Parte 2: Reformular BusinessROIChart

**Arquivo:** `src/components/mentoria/BusinessROIChart.tsx`

**Dados necessários:**
- `entregas_business` com campos: `status`, `prazo_previsto`, `created_at`
- `contrato.data_inicio`, `contrato.data_fim`, `contrato.roi_projetado`

**Lógica de cálculo:**

```text
ROI Projetado (por mês):
- Baseado no total de entregas cadastradas
- Distribuição linear do ROI total ao longo dos meses do contrato
- Ex: 10 entregas, ROI 100%, 6 meses → cada entrega vale ~10% ROI

ROI Executado (por mês):
- Baseado nas entregas com status = 'concluida'
- Calcula peso de cada entrega concluída no mês
- Ex: 3 entregas concluídas de 10 = 30% ROI executado
```

**Estrutura do gráfico:**

```typescript
interface DadosGrafico {
  mes: string;
  roiProjetado: number;   // Curva ideal baseada no cronograma
  roiExecutado: number;   // Curva real baseada em entregas concluídas
  entregasProjetadas: number;
  entregasConcluidas: number;
}
```

**Visual:**
- **Curva verde** (primária): ROI Projetado - linha sólida com preenchimento
- **Curva azul** (secundária): ROI Executado - linha sólida diferente

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/mentoria/business/BusinessExecutiveRoadmap.tsx` | Remover card de Reports e imports relacionados |
| `src/components/mentoria/BusinessROIChart.tsx` | Adicionar segunda curva (ROI Executado) e conectar às entregas reais |

---

## Seção Técnica

### BusinessExecutiveRoadmap.tsx

**Remover:**
```typescript
// Imports a remover
import { FileText, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Estado a remover
const [reportsExpanded, setReportsExpanded] = useState(false);

// Desestruturação a simplificar
const { contrato, isLoading } = useContratosBusiness(businessUserId);
// (remover 'reports')

// Card a remover: linhas 134-207 (todo o card de Reports)
```

### BusinessROIChart.tsx

**Adicionar hook de entregas:**
```typescript
import { useEntregasBusiness } from "@/hooks/useEntregasBusiness";

// Dentro do componente:
const { entregas } = useEntregasBusiness(contrato?.id);
```

**Nova lógica de geração de dados:**
```typescript
const gerarDadosGrafico = () => {
  if (!contrato?.data_inicio) return dadosExemplo;

  const dataInicio = parseISO(contrato.data_inicio);
  const meses = contrato.tempo_consultoria_meses || 6;
  const roiTotal = contrato.roi_projetado || 100;
  const totalEntregas = entregas.length || 1;
  const pesoEntrega = roiTotal / totalEntregas; // ROI por entrega

  const dados = [];
  
  for (let i = 0; i <= meses; i++) {
    const mesAtual = addMonths(startOfMonth(dataInicio), i);
    
    // Entregas com prazo até este mês (projetado)
    const entregasProjetadas = entregas.filter(e => 
      e.prazo_previsto && parseISO(e.prazo_previsto) <= mesAtual
    ).length;
    
    // Entregas concluídas até este mês (executado real)
    const entregasConcluidas = entregas.filter(e => 
      e.status === 'concluida' && 
      parseISO(e.updated_at) <= mesAtual
    ).length;
    
    dados.push({
      mes: format(mesAtual, "MMM", { locale: ptBR }),
      roiProjetado: Math.round(entregasProjetadas * pesoEntrega),
      roiExecutado: Math.round(entregasConcluidas * pesoEntrega),
    });
  }
  
  return dados;
};
```

**Adicionar segunda Area no gráfico:**
```typescript
<defs>
  <linearGradient id="colorRoiProjetado" ...>
    {/* Verde/Primário */}
  </linearGradient>
  <linearGradient id="colorRoiExecutado" ...>
    {/* Azul/Secundário */}
  </linearGradient>
</defs>

<Area
  type="monotone"
  dataKey="roiProjetado"
  stroke="hsl(var(--primary))"
  fill="url(#colorRoiProjetado)"
  name="Projetado"
/>
<Area
  type="monotone"
  dataKey="roiExecutado"
  stroke="#3b82f6" // Azul
  fill="url(#colorRoiExecutado)"
  name="Executado"
/>
```

**Atualizar legenda:**
```typescript
<div className="flex items-center gap-6 mt-4 text-xs">
  <div className="flex items-center gap-1.5">
    <div className="w-3 h-3 rounded-full bg-primary" />
    <span>ROI Projetado</span>
  </div>
  <div className="flex items-center gap-1.5">
    <div className="w-3 h-3 rounded-full bg-blue-500" />
    <span>ROI Executado</span>
  </div>
</div>
```

---

## Resultado Esperado

### Aba Visão Geral (Business):
```text
├── Gráfico ROI (com 2 curvas)
│   ├── Curva verde: ROI Projetado (baseado em prazos das entregas)
│   └── Curva azul: ROI Executado (baseado em entregas concluídas)
└── Card Reports ✅
```

### Aba Roadmap (Business):
```text
├── Banner de Preview (se sem contrato)
└── Timeline de Fases do Projeto ✅
    (SEM card de Reports)
```
