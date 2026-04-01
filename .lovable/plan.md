

# JornadaStrip — linha de estágios no topo da página /mentoria

## O que será feito

Criar `JornadaStrip.tsx` e inseri-lo na página `/mentoria` entre o `MentoriaHeroDashboard` (e `BusinessAcessoRapido` se Business) e as `Tabs`, com `mb-4`.

## Novo componente: `src/components/mentoria/JornadaStrip.tsx`

### Dados por plano

**Business (Parceria e Sistemas):**
- Hooks: `useBusinessUserId`, `useContratosBusiness` (para `contratoId`), `useEtapasBusiness(contratoId)`
- Estágios = `etapas` mapeadas: cada etapa vira um estágio com `numero_etapa`, `titulo`, e `status` (`concluida` / `em_andamento` / `pendente`)
- Se não houver etapas, não renderiza (retorna `null`)

**Academy:**
- 4 estágios fixos:
  1. **Diagnóstico** — completo se `useMentoriaForm().formulario?.completado === true`
  2. **Trilhas** — em andamento se `useTrilhasEmAndamento()` retorna array com length > 0
  3. **Evolução** — em andamento se `useTrilhasConcluidas()` retorna array com length > 0 (tem conquistas)
  4. **Certificado** — completo se `useProgressoGeral().totalCertificados > 0`
- Status derivado: primeiro estágio não concluído = "atual", anteriores = "concluído", posteriores = "próximo"

**Skills / Visitante:** Não renderiza (retorna `null`).

### Layout

Linha horizontal flex com `overflow-x-auto` para mobile. Cada estágio:

```text
[1]——[2]——[3]——[4]
 |    |    |    |
Diag Trilh Evol Cert
```

- Círculo 32x32 com número (ou Check icon para concluído)
- Linha conectora `h-0.5` entre círculos, cor baseada no status do estágio anterior
- Label abaixo do círculo, `text-xs`, `font-medium` se atual

### Estilos por estado

| Estado | Círculo BG | Círculo Border | Ícone/Texto | Conector |
|---|---|---|---|---|
| Concluído | `#EAF3DE` / dark `#173404` | `#AFC040` | Check icon `#AFC040` | `bg-[#AFC040]` |
| Atual | `#AFC040` sólido | `#AFC040` | Número `#0C0F0A` | `bg-border` |
| Próximo | `bg-secondary` | `border-muted` | Número `text-muted-foreground` | `bg-border` |

### Componente não retorna null quando tem dados — apenas quando não há estágios aplicáveis (Skills/visitante/Business sem etapas).

## Integração: `src/pages/Mentoria.tsx`

- Importar `JornadaStrip`
- Adicionar `<JornadaStrip />` após `{isBusiness && <BusinessAcessoRapido />}` (linha 76) e antes das `<Tabs>` (linha 79), com wrapper `mb-4`
- Passar props: `isBusiness`, `isBusinessParceria`, `isBusinessSistemas` para que o componente saiba qual layout usar (ou usar `useEffectivePlan` internamente)

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/mentoria/JornadaStrip.tsx` | Novo |
| `src/pages/Mentoria.tsx` | Editado — import + inserção |

