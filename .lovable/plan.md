

# Substituir "Gerar via IA" por "Exportar Dados do Projeto" na aba Reports

## Contexto
Na aba Reports do Business iAplicada/Sistemas, existe um botão "Gerar via IA" que chama uma edge function para gerar reports automaticamente. O usuário quer remover essa funcionalidade de IA e substituir por uma exportação de todos os dados do projeto em formato documento (texto/markdown), para que o report seja gerado em outra plataforma.

## Mudanças

### 1. Remover botão "Gerar via IA" e modal de geração IA
**Arquivo:** `src/components/admin/business/ReportsBusinessManager.tsx`
- Remover import e uso do `GerarReportIAModal`
- Remover estado `gerarIAModalOpen` e o botão "Gerar via IA"
- Remover renderização do componente `GerarReportIAModal`
- Adicionar botão "Exportar Dados" que coleta todas as informações do projeto (contrato, etapas, entregas, processos, telas, vídeos, sessões) e gera um arquivo de texto/markdown para download

### 2. Criar função de exportação de dados
No mesmo arquivo, implementar função que:
- Busca dados do contrato (nome, módulos, valores, datas)
- Busca etapas e seu status
- Busca entregas e progresso
- Busca processos mapeados
- Busca telas do sistema
- Busca vídeos de instrução
- Busca sessões/reuniões
- Compila tudo em um documento markdown estruturado
- Faz download como arquivo `.md` ou `.txt`

### 3. Criar componente `ExportarDadosProjetoModal`
**Novo arquivo:** `src/components/admin/business/ExportarDadosProjetoModal.tsx`
- Modal com preview dos dados que serão exportados
- Botão para copiar para clipboard e/ou baixar como arquivo
- Formato estruturado com seções: Contrato, Etapas, Entregas, Processos, Telas, Vídeos, Sessões

### Arquivos impactados
- `src/components/admin/business/ReportsBusinessManager.tsx` — remover IA, adicionar exportação
- `src/components/admin/business/ExportarDadosProjetoModal.tsx` — novo componente
- `src/components/admin/business/GerarReportIAModal.tsx` — pode ser mantido mas não será mais usado neste contexto

