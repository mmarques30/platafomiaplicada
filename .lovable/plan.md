

# Reorganizar aba Contrato em MeuSistemaDocumentos

## Problema
A aba "Contrato" exibe todas as informações em uma lista corrida com `Separator` genéricos, sem títulos de seção claros. Fica visualmente confuso e difícil de localizar informações específicas.

## Solução

**Arquivo**: `src/pages/MeuSistemaDocumentos.tsx` (linhas 260-308)

Reorganizar o conteúdo da aba Contrato em **seções visuais distintas** com títulos e cards separados:

### Estrutura proposta

Substituir o card único por **3 cards empilhados**, cada um com título de seção:

1. **Dados da Empresa** — Card com ícone `Building2` e título "Dados da Empresa"
   - Grid 2 colunas: Empresa, CNPJ, Representante, Email, Setor, Endereço

2. **Detalhes do Contrato** — Card com ícone `Calendar` e título "Detalhes do Contrato"
   - Grid 3 colunas: Início, Fim, Duração, Valor, Entrada, Parcelas

3. **Módulos e Garantias** — Card com ícone `Package` e título "Módulos e Garantias"
   - Badges de módulos + lista de garantias (só aparece se houver dados)

### Estilo dos cards
- Cada card com `CardHeader` contendo título com ícone (padrão `text-sm font-medium`)
- Fundo neutro padrão do card (`border-border/50`)
- `InfoItem` existente reutilizado, com fundo sutil `bg-muted/30 rounded-lg p-3` em cada item para dar destaque visual
- Espaçamento `space-y-4` entre os cards

### Mudança concreta
- Linhas 260-308: substituir o card único por 3 cards com headers e grids organizados
- Importar `Building2` do lucide-react
- `InfoItem` ganha fundo `bg-muted/30 rounded-lg p-3` para cada campo ficar visualmente delimitado

