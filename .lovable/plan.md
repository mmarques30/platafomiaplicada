

# Ajustes no Formulário Business Premium

## Mudanças Solicitadas

### 1. Remover campo `nome_completo` do Step 1 (Perfil)

**Motivo:** O usuário Business Premium já está autenticado ao preencher o formulário. O nome deve ser obtido automaticamente do perfil do usuário (`profiles.nome_completo`).

**Arquivos afetados:**
- `src/components/mentoria/schema.ts` - Remover `nome_completo` do `businessStep1Schema`
- `src/components/mentoria/steps/business/BusinessStep1Perfil.tsx` - Remover campo de input do nome
- `src/components/mentoria/FormularioWizard.tsx` - Remover `nome_completo` da validação do Step 0

**Implementação:**
- Ao salvar o formulário, o `nome_completo` será preenchido automaticamente a partir do perfil do usuário autenticado
- O `useMentoriaForm` já usa `useAuth` para obter o `user.id`, então podemos buscar o nome do perfil

---

### 2. Remover opção "Aprender a criar soluções eu mesmo (Academy)" do Step 5

**Motivo:** O cliente Business Premium já tem acesso incluso à plataforma Academy. Essa opção é redundante e não representa um upsell real.

**Arquivo afetado:**
- `src/components/mentoria/steps/business/BusinessStep5Aprendizado.tsx` - Remover a opção do array `interesse_alem_entrega`

**Opções atualizadas para "Além da entrega, o que mais te interessaria?":**
- ~~Aprender a criar soluções de IA eu mesmo (Academy)~~ ❌ **REMOVER**
- Capacitar minha equipe em IA (Skills) ✅ **MANTER**
- Consultoria contínua para novos projetos ✅ **MANTER**
- Suporte prioritário estendido ✅ **MANTER**
- Apenas a entrega é suficiente ✅ **MANTER**

---

## Resumo Técnico

| Arquivo | Ação |
|---------|------|
| `src/components/mentoria/schema.ts` | Tornar `nome_completo` opcional no businessStep1Schema |
| `src/components/mentoria/steps/business/BusinessStep1Perfil.tsx` | Remover campo de input do nome |
| `src/components/mentoria/FormularioWizard.tsx` | Ajustar validação do Step 0 (remover nome_completo) |
| `src/components/mentoria/steps/business/BusinessStep5Aprendizado.tsx` | Remover opção Academy do interesse_alem_entrega |
| `src/hooks/useMentoriaForm.tsx` | Preencher automaticamente nome_completo do perfil ao salvar |

---

## Resultado Esperado

1. **Step 1 (Perfil):** Mostra apenas cargo, empresa, tamanho e equipe - sem campo de nome
2. **Step 5 (Interesse):** Lista apenas 4 opções de upsell relevantes (Skills, Consultoria, Suporte, Suficiente)
3. **Ao salvar:** O nome do usuário é preenchido automaticamente a partir do perfil autenticado

