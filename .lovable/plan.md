

# Plano: Corrigir Duplicação de Setas e Layout na Página de Fase

## Problema Identificado

A página de detalhes da Fase (`MentoriaEtapa.tsx`) está exibindo **duas setas de navegação** na parte superior:
1. Uma seta do próprio `MentoriaEtapa.tsx` (ícone apenas)
2. Outra seta do componente `EtapaHeader.tsx` (com texto "Voltar")

Além disso, o **objetivo da etapa** também está sendo renderizado duas vezes (uma no `EtapaHeader` e outra no `MentoriaEtapa`).

## Solução Proposta

Modificar o componente `EtapaHeader.tsx` para remover os elementos duplicados, deixando apenas as informações essenciais do cabeçalho (título, status e data prevista). A navegação e o objetivo serão gerenciados exclusivamente pelo `MentoriaEtapa.tsx`.

## Alterações Técnicas

### Arquivo: `src/components/mentoria/business/EtapaHeader.tsx`

**Remover:**
- O botão "Voltar" com a seta (linhas 34-42)
- O bloco de objetivo da etapa (linhas 63-73)
- As importações não utilizadas (`Button`, `ArrowLeft`, `Target`, `useNavigate`)

**Manter:**
- Título da fase com número e nome
- Badge de status (Pendente/Em Andamento/Concluída)
- Data prevista (se existir)

**Código final simplificado:**
```tsx
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { EtapaBusiness } from "@/hooks/useEtapasBusiness";

interface EtapaHeaderProps {
  etapa: EtapaBusiness;
}

const statusConfig = {
  pendente: { label: "Pendente", className: "..." },
  em_andamento: { label: "Em Andamento", className: "..." },
  concluida: { label: "Concluída", className: "..." },
};

export function EtapaHeader({ etapa }: EtapaHeaderProps) {
  const status = statusConfig[etapa.status] || statusConfig.pendente;

  return (
    <div className="space-y-3">
      {/* Título e Status */}
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold">
          Fase {etapa.numero_etapa}: {etapa.titulo}
        </h1>
        <Badge variant="outline" className={status.className}>
          {status.label}
        </Badge>
      </div>

      {/* Data Prevista */}
      {etapa.data_prevista && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Data prevista: {format(...)}</span>
        </div>
      )}
    </div>
  );
}
```

## Resultado Esperado

- **Uma única seta** de navegação no topo da página
- **Layout limpo** sem duplicações de elementos
- O objetivo da fase aparece apenas uma vez, no card dedicado abaixo do header
- Melhor experiência visual e menos confusão para o usuário

