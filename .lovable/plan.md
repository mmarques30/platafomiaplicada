

# Corrigir Pendencia de Diagnostico para Apenas Academy

## Problema
A pendencia "Diagnostico Estrategico" aparece no card "Complete seu perfil" para usuarios de todos os planos (academy, business, skills), quando deveria aparecer apenas para usuarios Academy.

## Solucao
Executar um UPDATE na tabela `pendencias_dashboard` para restringir o campo `planos_aplicaveis` apenas ao plano `academy`.

## Detalhes Tecnicos

### Operacao no banco de dados
```sql
UPDATE pendencias_dashboard 
SET planos_aplicaveis = ARRAY['academy']
WHERE id = 'db992520-61ed-439a-ba8e-816385ee045e';
```

### Impacto
- Usuarios **Academy**: continuarao vendo a pendencia de diagnostico no dashboard
- Usuarios **Business** e **Skills**: deixarao de ver essa pendencia
- Nenhuma alteracao de codigo necessaria - o componente `PendenciasOnboarding` ja filtra por `planos_aplicaveis` automaticamente

