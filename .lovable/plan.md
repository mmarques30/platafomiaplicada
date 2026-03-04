

# Botao Exportar Usuarios em CSV

Adicionar um botao "Exportar" ao lado dos botoes "Importar" e "Novo Usuario" na pagina `GerenciarUsuarios.tsx`.

## O que sera feito

1. **Criar funcao utilitaria** `exportUsersToCSV` em `src/lib/exportUsers.ts` que:
   - Recebe a lista filtrada de usuarios
   - Gera CSV com colunas: Nome, Email, Roles, Plano, Status, Data Expiracao, Data Cadastro, Email Enviado, WhatsApp
   - Faz download automatico do arquivo `.csv`

2. **Adicionar botao "Exportar"** na barra de acoes do `GerenciarUsuarios.tsx`:
   - Icone `Download` do lucide-react
   - Variante `outline`, mesmo estilo dos botoes existentes
   - Exporta os usuarios **filtrados** (respeitando busca e filtro de role ativos)

