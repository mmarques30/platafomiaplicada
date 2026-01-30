# Plano: Separação de Ambientes

## Status: ✅ Implementado

A separação de ambientes foi implementada com os seguintes componentes:

### Arquivos Criados
- `src/contexts/EnvironmentContext.tsx` - Context para gerenciar ambiente selecionado
- `src/hooks/useEnvironment.tsx` - Hook para acessar o contexto
- `src/pages/EnvironmentSelector.tsx` - Página de seleção de ambiente pós-login
- `src/components/layout/EnvironmentSwitcher.tsx` - Dropdown no header para trocar ambiente

### Arquivos Modificados
- `src/App.tsx` - Adicionada rota /selecionar-ambiente e EnvironmentProvider
- `src/pages/Auth.tsx` - Redireciona para /selecionar-ambiente após login
- `src/components/layout/MainLayout.tsx` - Verifica se ambiente foi selecionado
- `src/components/layout/TopHeader.tsx` - Adicionado EnvironmentSwitcher
- `src/hooks/useAuth.tsx` - Limpa sessionStorage no logout

### 4 Ambientes
| Ambiente | Cor | Descrição |
|----------|-----|-----------|
| Gratuito | Verde suave | Visitantes - conteúdos gratuitos |
| Academy | Verde #9EB038 | Trilhas + diagnóstico + evolução |
| Skills | Azul | Academy + capacitação corporativa |
| Business | Dourado | Academy + mentoria 1:1 + roadmap |

### Fluxo
1. Login → Seleção de Ambiente → Dashboard
2. Botão no header permite alternar a qualquer momento
3. Logout limpa o ambiente selecionado
