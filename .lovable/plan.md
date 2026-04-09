

# Recriar página de Entregas do Business Parceria

## O que será feito

Reescrever `MentoriaEntregas.tsx` com uma visão simplificada e visual, similar à de `MeuSistemaEntregas`, adaptada ao ecossistema Business Parceria. A página terá 3 seções:

1. **Guia de Ferramentas** — tabela com documentos/SOPs/links de ferramentas ensinadas (dados de `processos_mapeados_business`)
2. **Vídeos Passo a Passo** — carousel com cards de vídeos para replicar (dados de `videos_instrucao_business`)  
3. **Guias e Recursos** — carousel com prints, screenshots e links de referência (dados de `telas_sistema_business`)

Cada seção terá placeholder visual (opaco) quando sem dados, exatamente como no Business Sistemas.

## Arquivo

| Arquivo | Ação |
|---|---|
| `src/pages/MentoriaEntregas.tsx` | Reescrever — substituir visão de etapas/status por visão de recursos |

## Detalhes técnicos

- Trocar o hook `useEntregasBusiness` por `useEntregasBusinessView` (que já retorna `processos`, `telas`, `videos`)
- Manter `useContratosBusiness` + `useBusinessUserId` para obter o `contrato.id`
- Usar Embla carousel para vídeos e telas (mesmo padrão do Sistemas)
- Dialog para visualizar vídeo (embed Google Drive ou player) e tela (zoom com Lens)
- Seção "Guia de Ferramentas": tabela compacta com ícone de tipo, título, descrição, botão Acessar/Baixar
- Seção "Vídeos": cards com thumbnail, play overlay, título
- Seção "Guias e Recursos": cards com screenshot/placeholder, título
- Layout `overflow-hidden` + `min-w-0` para respeitar sidebar
- Importar componentes: `Lens`, `useEmblaCarousel`, `getGoogleDriveEmbedUrl`, `PageTitle`

