

# Garantir Salvamento do Diagnostico Skills + Visualizacao Admin

## Problemas Identificados

1. **Sem auto-save intermediario**: O formulario de 10 blocos so salva quando o usuario clica "Enviar" no ultimo passo. Se fechar antes, perde tudo.

2. **Admin nao ve respostas individuais**: A aba Diagnosticos no admin mostra apenas status (Pendente/Preenchido/Processado) e resultados da IA, mas NAO mostra as respostas brutas que cada membro preencheu.

3. **Bug na edge function**: Quando admin processa diagnostico de um membro, a funcao `processar-diagnostico-skills` filtra por `user.id` do chamador (admin), nao do membro. O diagnostico nunca e encontrado.

## Solucao

### 1. Auto-save no formulario (rascunho por bloco)

**Arquivo**: `src/components/skills/diagnostico/DiagnosticoForm.tsx`
- Ao avancar de bloco (clicar "Proximo"), salvar automaticamente os dados preenchidos ate aquele ponto como rascunho (`completado: false`)
- Ao voltar ao formulario, carregar dados salvos do banco via prop

**Arquivo**: `src/hooks/useSkillsDiagnostico.ts`
- Criar funcao `saveRascunho` que salva com `completado: false` (sem processar IA)
- O `saveAndProcess` existente continua para o envio final (`completado: true` + IA)

**Arquivo**: `src/components/skills/ProjetoSkillsDiagnostico.tsx`
- Passar dados existentes do diagnostico para o `DiagnosticoForm` para pre-popular campos

### 2. Visualizacao das respostas individuais no Admin

**Arquivo**: `src/components/admin/skills/DiagnosticosSkillsTab.tsx`
- No `CollapsibleContent`, quando o diagnostico esta preenchido, exibir as respostas organizadas por bloco (Perfil, Rotina, Processos, etc.)
- Usar o campo `insight_ia` para mostrar resultados da IA e os campos brutos (cargo, area_atuacao, processos_detalhados, etc.) para mostrar as respostas

**Arquivo**: `src/hooks/admin/useDiagnosticosEquipeAdmin.ts`
- Ja busca `select("*")`, entao todos os campos ja estao disponiveis. Basta expor os campos brutos na interface `MembroDiagnostico`.

### 3. Corrigir edge function para admin processar

**Arquivo**: `supabase/functions/processar-diagnostico-skills/index.ts`
- Linha 50-55: Remover filtro `.eq("user_id", user.id)` e usar apenas `.eq("id", diagnostico_id)` com verificacao de permissao (admin ou dono)
- Verificar se o usuario e admin OU dono do diagnostico antes de prosseguir

## Detalhes Tecnicos

### Auto-save - Fluxo

```text
Usuario preenche Bloco 1
  |
  v
Clica "Proximo"
  |
  v
saveRascunho(formData) --> INSERT/UPDATE com completado=false
  |
  v
Avanca para Bloco 2
  ...
Bloco 10 --> "Enviar" --> saveAndProcess(formData) --> completado=true + IA
```

### DiagnosticoForm - Pre-popular

Receber prop `initialData` com dados do banco e inicializar `formData` com esses valores. Mapear campos do banco de volta para campos do formulario (inverso do payload do save).

### Admin - Respostas por bloco

Criar componente `DiagnosticoRespostasView` que recebe os dados brutos e organiza em secoes:
- Perfil (cargo, area, tempo, ferramentas)
- Rotina (horas repetitivas, atividade principal, frequencia, tempo)
- Processos Detalhados (array de processos com nome, passos, frequencia, tempo, impacto)
- Objetivos (objetivos_ia, resultado_sucesso, autonomia)
- Contexto Tecnico (nivel, ferramentas automacao, uso_ia)
- Disponibilidade (horas_semana, horario, preferencia)
- Empresa (tamanho, ERPs, iniciativas, maturidade)
- Desafios (desafios, processo colaborativo, automatizar)
- Organizacional (apoio lideranca, restricoes, objetivo programa, areas)
- Expectativas (resultado equipe, projeto colaborativo, barreiras)

### Edge function fix

Adicionar verificacao de admin via `user_roles`:
```typescript
// Buscar diagnostico SEM filtro de user_id
const { data: diagnostico } = await supabase
  .from("diagnosticos_skills")
  .select("*")
  .eq("id", diagnostico_id)
  .single();

// Verificar permissao: dono ou admin
const isOwner = diagnostico.user_id === user.id;
const { data: adminRole } = await supabase
  .from("user_roles")
  .select("role")
  .eq("user_id", user.id)
  .eq("role", "admin")
  .maybeSingle();

if (!isOwner && !adminRole) {
  return 403 Forbidden;
}
```

## Arquivos Alterados

1. `src/components/skills/diagnostico/DiagnosticoForm.tsx` - aceitar `initialData`, pre-popular campos
2. `src/hooks/useSkillsDiagnostico.ts` - adicionar `saveRascunho`
3. `src/components/skills/ProjetoSkillsDiagnostico.tsx` - passar initialData ao form, chamar saveRascunho ao trocar bloco
4. `src/components/admin/skills/DiagnosticosSkillsTab.tsx` - exibir respostas brutas + resultados IA
5. `src/hooks/admin/useDiagnosticosEquipeAdmin.ts` - expor campos brutos na interface
6. `supabase/functions/processar-diagnostico-skills/index.ts` - corrigir filtro de permissao
7. `src/components/admin/skills/DiagnosticoRespostasView.tsx` - novo componente para visualizar respostas

