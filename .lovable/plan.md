

# Reestruturar MeuSistemaDocumentos (Business Sistemas)

## Problema
A página `/meu-sistema/documentos` (`MeuSistemaDocumentos.tsx`) nunca foi atualizada. Ela ainda mostra o layout antigo com uma tabela simples de "Documentos do Projeto" e um collapsible de "Dados do Contrato". As funcionalidades de Arquivos com upload/download visual, Anotações, Links e Reports que já existem em `MentoriaDocumentos.tsx` nunca foram aplicadas aqui.

## Solução
Reestruturar `MeuSistemaDocumentos.tsx` usando o mesmo padrão de tabs já implementado em `MentoriaDocumentos.tsx`, adaptado ao visual off-white do ambiente Sistemas:

### 4 Tabs
1. **Arquivos** — Reutiliza `ArquivosProjetoSection` (cards visuais com ícones por tipo, preview de imagens, download)
2. **Anotações** — Reutiliza `NotasProjetoSection` em modo `readOnly`
3. **Links** — Cards com ícones (Drive, Video, etc.) clicáveis, mesmo padrão de `MentoriaDocumentos`
4. **Reports** — Mantém a seção de reports já existente com visualização HTML

### Dados do Contrato
Mover para um collapsible no final da página (já existe, manter).

## Arquivo a editar

| Arquivo | Ação |
|---|---|
| `src/pages/MeuSistemaDocumentos.tsx` | Reescrever — substituir layout tabela por tabs com Arquivos/Anotações/Links/Reports + contrato collapsible no final |

## Detalhes técnicos
- Importar `useLinksBusiness`, `useNotasProjetoBusiness`, `ArquivosProjetoSection`, `NotasProjetoSection`
- Tabs com mesmo estilo do `MentoriaDocumentos` (contadores nos labels)
- Links tab: reutilizar o mesmo render de cards com `getIconComponent`
- Reports tab: mover a seção de reports existente para dentro da tab
- Contrato collapsible: manter no final, fora das tabs

