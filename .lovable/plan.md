

# Ajustes na página Documentos (Meu Sistema)

## Alterações

### 1. Remover ícones dos títulos de seção
Remover os ícones `FileText` e `Building2` que precedem os títulos "Reports", "Documentos do Contrato" e "Dados do Contrato". Padronizar todos os títulos de seção com o mesmo tamanho (`text-lg font-semibold`).

### 2. Renomear "Documentos do Contrato" → "Documentos do Projeto"
Reflete melhor que podem ser documentos de desenvolvimento, não apenas contratuais.

### 3. Transformar seção de documentos em tabela com filtros
Substituir o grid de cards por uma tabela com colunas: Título, Tipo, Data, Ação (download). Adicionar filtros por:
- **Tipo de documento** (Select com opções: Todos, Proposta, Transcrição, Anexo, Solução, Outro)
- **Data** (ordenação por data)

**Arquivo editado:** `src/pages/MeuSistemaDocumentos.tsx`

### Detalhes técnicos
- Usar componentes `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` já existentes
- Usar `Select` do Radix para filtro de tipo
- Adicionar estado `filtroTipo` para filtragem client-side
- Remover imports não utilizados (`FileText` do título, `Building2`)
- Manter lógica de download existente

