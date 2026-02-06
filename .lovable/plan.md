
# Plano Completo: Correção e Implementação do Painel do Líder Skills

## ✅ CONCLUÍDO

### Correções Realizadas

1. **Migração de Banco** ✅
   - Adicionadas colunas em `equipes_skills`: `investimento`, `custo_hora_padrao`
   - Adicionadas colunas em `entregas_skills`: `economia_horas_semana`, `avaliacao_nota`, `avaliacao_comentario`, `concluido_em`, `progresso`
   - Adicionada coluna em `metricas_skills`: `indice_maturidade`

2. **Menu Duplicado Removido** ✅
   - Removido bloco hardcoded do AppSidebar.tsx (linhas 439-471)
   - Atualizado menu_config para `planos_permitidos = ['skills']`
   - Adicionado filtro em useMenuConfig para ocultar squad em outros ambientes

3. **Hooks Atualizados** ✅
   - `useSkillsLider.ts` reescrito para usar tabelas `*_skills`
   - Adicionados campos: progressoMembros, metricasConsolidadas
   - Mantida compatibilidade com páginas existentes

4. **Painel do Líder Corrigido** ✅
   - SquadLiderPainel.tsx agora usa useSkillsLider
   - Redirecionamento para `/skills/equipe` em vez de `/`
   - Compatibilidade com novas propriedades do hook

## 🔜 PENDENTE (próximo ciclo)

### Abas Admin Skills
- `EntregasSkillsTab.tsx` - CRUD de entregas
- `MetricasSkillsTab.tsx` - Registro de métricas semanais
- Atualizar `MentoriaSkillsPage.tsx` com novas abas

### Fluxo de Dados
```
Admin cadastra equipe (equipes_skills) → Membros → Roadmap → Entregas → Métricas → Painel do Líder
```
