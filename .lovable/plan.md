
# Plano: Preservar Feedback da Mentora ao Salvar Diagnóstico

## Problema Identificado

O sistema está **sobrepondo dados** quando salva o diagnóstico ou o feedback. Isso acontece porque ambos usam `upsert` com apenas alguns campos, e o Supabase interpreta como "substituir toda a linha".

### Cenário do Bug:
1. Mentorado preenche o diagnóstico (campos como `nome_completo`, `objetivo_principal`, `insight_ia`, etc.)
2. Admin salva o Feedback da Mentora (vídeo, transcrição, plano de execução)
3. O `upsert` no `FeedbackMentoraAdmin` envia **apenas os campos de feedback**, sobrescrevendo os campos do diagnóstico
4. Resultado: dados do diagnóstico do mentorado são perdidos

O mesmo pode ocorrer no sentido inverso.

---

## Solução

Modificar as funções de salvamento para usar `UPDATE` em vez de `UPSERT` quando o registro já existe, garantindo que apenas os campos específicos sejam atualizados.

---

## Arquivos a Modificar

### 1. `src/components/admin/mentoria/FeedbackMentoraAdmin.tsx`

**Problema (linhas 43-56):**
```typescript
const { error } = await supabase
  .from("formulario_diagnostico")
  .upsert({
    user_id: userId,
    video_call_url: videoCallUrl || null,
    // ... apenas campos de feedback
  }, { onConflict: 'user_id' });
```

**Solução:**
- Primeiro verificar se o registro existe
- Se existir, usar `UPDATE` apenas nos campos de feedback
- Se não existir, criar registro mínimo com os campos de feedback

```typescript
// Verificar se existe
const { data: existente } = await supabase
  .from("formulario_diagnostico")
  .select("id")
  .eq("user_id", userId)
  .maybeSingle();

if (existente) {
  // UPDATE apenas os campos de feedback
  const { error } = await supabase
    .from("formulario_diagnostico")
    .update({
      video_call_url: videoCallUrl || null,
      transcricao_call_url: transcricaoUrl || null,
      link_plano_execucao: planoExecucaoUrl || null,
      direcional_entregas: direcionalEntregas || null,
      feedback_mentora_em: new Date().toISOString(),
    })
    .eq("user_id", userId);
} else {
  // INSERT novo registro apenas com feedback
  const { error } = await supabase
    .from("formulario_diagnostico")
    .insert({
      user_id: userId,
      video_call_url: videoCallUrl || null,
      // ...
    });
}
```

---

### 2. `src/hooks/useDiagnosticoAdmin.tsx`

**Problema (linhas 48-76):** A função `salvarDiagnostico` usa `upsert` com payload parcial.

**Solução:** Aplicar a mesma lógica de verificar existência e usar `UPDATE` quando apropriado.

- Se já existe registro, usar `UPDATE` apenas nos campos sendo modificados
- Preservar explicitamente campos de feedback (`video_call_url`, `transcricao_call_url`, etc.)

---

### 3. `src/hooks/useMentoriaForm.tsx`

**Problema (linhas 31-52 e 55-74):** Funções `salvarMutation` e `finalizarMutation` usam `upsert`.

**Solução:** 
- Quando o mentorado salva/finaliza seu diagnóstico, os campos de feedback devem ser preservados
- Usar lógica similar: verificar se existe e usar `UPDATE` com apenas os campos do formulário

---

## Fluxo Corrigido

```text
Antes (BUG):
  [Diagnóstico preenchido] → Admin salva Feedback → UPSERT sobrescreve tudo
  Resultado: Diagnóstico perdido ❌

Depois (CORRIGIDO):
  [Diagnóstico preenchido] → Admin salva Feedback → UPDATE apenas campos de feedback
  Resultado: Ambos preservados ✓
```

---

## Resumo das Mudanças

| Arquivo | Mudança |
|---------|---------|
| `FeedbackMentoraAdmin.tsx` | Substituir `upsert` por lógica `UPDATE`/`INSERT` |
| `useDiagnosticoAdmin.tsx` | Preservar campos de feedback ao salvar diagnóstico |
| `useMentoriaForm.tsx` | Preservar campos de feedback ao mentorado salvar/finalizar |

---

## Resultado Esperado

- Quando admin salva Feedback da Mentora, o diagnóstico do mentorado permanece intacto
- Quando mentorado preenche diagnóstico, o feedback já inserido pelo admin permanece intacto
- Quando admin preenche diagnóstico manualmente, o feedback também permanece intacto
- Ambas as seções (Diagnóstico e Feedback) funcionam de forma totalmente independente
