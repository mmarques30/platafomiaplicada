

# Refatorar JornadaStrip para props-based + atualizar Mentoria.tsx

## Alterações

### 1. Reescrever `src/components/mentoria/JornadaStrip.tsx`

- Remover todos os hooks internos (useUserRole, useEffectivePlan, useBusinessUserId, useContratosBusiness, useEtapasBusiness, useMentoriaForm, useProgressoCertificados, useProgressoGeral)
- Componente recebe `estagios` via props (interface `Estagio` com `numero`, `label`, `status`)
- Manter visual atual (StageCircle com Check icon, Connector, cores `#AFC040`, etc.)
- Usar `estagio.numero` no círculo em vez de `index + 1`

### 2. Atualizar `src/pages/Mentoria.tsx`

- Adicionar imports: `useBusinessUserId`, `useContratosBusiness`, `useEtapasBusiness`, `useMentoriaForm`
- Construir `estagiosBusiness` a partir de `useEtapasBusiness` (mapeando status)
- Construir `estagiosAcademy` com 4 estágios fixos (Diagnóstico, Trilhas, Conquistas, Certificado) baseados em `useMentoriaForm().formulario?.completado`
- Substituir `<JornadaStrip />` por renderização condicional:
  - `{(isBusinessParceria || isBusinessSistemas) && estagiosBusiness && <JornadaStrip estagios={estagiosBusiness} />}`
  - `{isAcademy && <JornadaStrip estagios={estagiosAcademy} />}`
- Adicionar `isAcademy` ao destructuring de `useEffectivePlan`

### Nenhuma outra alteração — abas, lógica de auth, roles e planos permanecem intactos.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/mentoria/JornadaStrip.tsx` | Reescrito — props-based |
| `src/pages/Mentoria.tsx` | Editado — passa dados para JornadaStrip |

