

# Correção: Pesquisa de Perfil Aparece Mesmo Desativada

## Diagnóstico

Ao analisar o banco de dados, encontrei o problema:

| Tabela | Registro | Status |
|--------|----------|--------|
| `pesquisas` | Pesquisa de Perfil IAplicada | `ativo: true` |
| `pendencias_dashboard` | Pesquisa de Perfil | `ativo: true` |

A pesquisa aparece para todos os usuários porque a **pendência** está ativa na tabela `pendencias_dashboard`.

## Entendimento do Fluxo

```text
┌─────────────────────────────────────────────────────────────┐
│                  PendenciasOnboarding.tsx                   │
│                                                             │
│  usePendenciasAtivas(userPlan) ─────────────────────────┐   │
│         │                                               │   │
│         ▼                                               ▼   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SELECT * FROM pendencias_dashboard                  │   │
│  │  WHERE ativo = true                                  │   │
│  │  ORDER BY ordem                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│         │                                                   │
│         ▼                                                   │
│  Filtra por plano do usuário (academy/business/skills)      │
│         │                                                   │
│         ▼                                                   │
│  Exibe lista de pendências no dashboard                     │
└─────────────────────────────────────────────────────────────┘
```

## Solução

A correção envolve **executar uma query SQL** para desativar a pendência "Pesquisa de Perfil" na tabela `pendencias_dashboard`:

```sql
UPDATE pendencias_dashboard 
SET ativo = false 
WHERE id = 'ec4c3f4d-f80f-4703-b5d8-04156253afba';
```

Ou, alternativamente, o administrador pode acessar:
**Painel Admin → Gerenciar Avisos → Aba "Pendências"** e desativar o switch da "Pesquisa de Perfil".

## Mudança Necessária

**Tipo**: Migração de banco de dados

**SQL a executar**:
```sql
-- Desativar a pendência "Pesquisa de Perfil" no dashboard
UPDATE pendencias_dashboard 
SET ativo = false, updated_at = now()
WHERE titulo = 'Pesquisa de Perfil' 
   OR link = '/formulario-aplica';
```

## Resultado Esperado

Após a correção:
- A pesquisa de perfil **não aparecerá** mais na lista de pendências do dashboard
- O componente `PendenciasOnboarding` filtrará automaticamente apenas as pendências ativas
- Usuários não verão mais o prompt para preencher a pesquisa de perfil

