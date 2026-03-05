

# Ajustar e Implementar Processos Mapeados (SOPs)

## Contexto

A tabela `processos_mapeados_business` já existe no banco com campos: `titulo`, `descricao`, `tipo` (link/documento), `url`, `arquivo_path`, `ordem`. A view do cliente em `MeuSistemaEntregas.tsx` já exibe os processos. O que falta é o **admin poder cadastrar processos** — não existe nenhum componente admin para gerenciar essa tabela.

## O que será feito

### 1. Criar componente admin `ProcessosMapeadosManager.tsx`

Componente CRUD para o admin gerenciar processos mapeados de cada cliente Business:
- Listar processos existentes com título, tipo (link/documento) e descrição
- Modal para criar/editar com campos: título, descrição, tipo (link ou documento)
  - Se tipo = "link": campo URL
  - Se tipo = "documento": upload de arquivo para o bucket `contratos-business`
- Reordenação por drag ou setas
- Botão de excluir com confirmação
- Seguir o padrão visual dos outros managers (EntregasBusinessManager, DocumentosBusinessManager)

### 2. Adicionar aba no admin Business

Inserir nova aba "Processos" nas páginas `MentoriaBusinessPage.tsx` e `MentoriaBusinessIAplicadaPage.tsx`, renderizando o `ProcessosMapeadosManager` com o `contratoId` do usuário selecionado.

### 3. Ajustar subtítulo da seção na view do cliente

Atualizar o subtítulo da seção "Processos Mapeados" para incluir "Instruções de trabalho · SOPs" como descrição contextual.

## Arquivos

- **Criar:** `src/components/admin/business/ProcessosMapeadosManager.tsx`
- **Editar:** `src/pages/admin/mentoria/MentoriaBusinessPage.tsx`, `src/pages/admin/mentoria/MentoriaBusinessIAplicadaPage.tsx`, `src/pages/MeuSistemaEntregas.tsx`

