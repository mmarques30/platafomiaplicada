

# Varredura 360 — Relatório Completo

---

## 🔴 CRÍTICOS

### 1. Tabela `password_reset_tokens` — RLS sem policies
- **Categoria**: Segurança / Banco
- **Local**: Tabela `password_reset_tokens` (Supabase)
- **Problema**: RLS está habilitado mas **nenhuma policy existe**, o que bloqueia 100% dos acessos via API (anon/authenticated). Se o sistema depende dela para redefinir senhas, o fluxo falha silenciosamente.
- **Impacto**: Funcionalidade de redefinição de senha pode estar completamente quebrada.
- **Sugestão**: Criar policies para INSERT (público) e SELECT/DELETE (service role via function).

### 2. Tabela `password_reset_requests` — INSERT com `WITH CHECK (true)`
- **Categoria**: Segurança
- **Local**: Policy `Qualquer um pode solicitar reset` em `password_reset_requests`
- **Problema**: Qualquer pessoa (mesmo não autenticada) pode inserir registros ilimitadamente. Sem rate limiting no banco.
- **Impacto**: Vetor de abuso — atacante pode inundar a tabela com solicitações falsas de reset.
- **Sugestão**: Adicionar throttling via trigger ou edge function antes do insert.

### 3. Views com SECURITY DEFINER (`historico_completo`, `ranking_dashboard`, `profiles_community`)
- **Categoria**: Segurança
- **Local**: Views `historico_completo`, `ranking_dashboard`, `profiles_community`
- **Problema**: O linter detectou SECURITY DEFINER views. Estas views executam com permissões do criador, ignorando RLS. `historico_completo` expõe dados de auditoria completos (dados anteriores/novos de qualquer tabela) para qualquer usuário que consiga fazer SELECT.
- **Impacto**: Vazamento potencial de dados sensíveis via `historico_completo`.
- **Sugestão**: Converter para SECURITY INVOKER ou restringir acesso via RLS na tabela base.

### 4. Leaked Password Protection desabilitada
- **Categoria**: Segurança
- **Local**: Configuração de autenticação (Auth settings)
- **Problema**: A proteção contra senhas vazadas (HaveIBeenPwned) está desativada.
- **Impacto**: Usuários podem usar senhas já comprometidas em vazamentos públicos.
- **Sugestão**: Habilitar via configurações de autenticação.

---

## 🟡 IMPORTANTES

### 5. Imports não usados em `App.tsx`
- **Categoria**: Código morto
- **Local**: `src/App.tsx` linhas 7, 67-68, 80, 86
- **Problema**: Os seguintes imports existem mas **não são usados em nenhuma rota**:
  - `TrocarSenhaModal` (importado mas nunca referenciado no JSX do App — só usado em MainLayout)
  - `FormulariosDisponiveis` — importado, sem rota
  - `ResponderFormulario` — importado, sem rota
  - `CadastrarUsuario` — importado, sem rota
  - `GerenciarMentoria` — importado, sem rota
- **Impacto**: Bundle maior sem necessidade; confusão na manutenção.
- **Sugestão**: Remover imports não usados.

### 6. Páginas órfãs (sem rota definida)
- **Categoria**: Código morto
- **Local**: Arquivos no diretório `src/pages/`
- **Problema**: Estas páginas existem mas **não são importadas/roteadas** em `App.tsx`:
  - `src/pages/Index.tsx` — placeholder "Welcome to Your Blank App" nunca usado
  - `src/pages/skills/SkillsPainelLider.tsx` — componente completo sem rota
  - `src/pages/MentoriaTarefasDetalhes.tsx` — componente completo sem rota
- **Impacto**: Código morto aumentando bundle e confundindo manutenção.
- **Sugestão**: Remover esses arquivos se não forem necessários.

### 7. Console.log/warn espalhados em produção (~189 ocorrências em 15 arquivos)
- **Categoria**: Performance / Código morto
- **Local**: Múltiplos arquivos incluindo `useVersionCheck.tsx`, `GeracaoEntregasModal.tsx`, `DocumentosUploadSection.tsx`, `useCommunityPosts.tsx`, `GerenciarMentoria.tsx`, `useContratoBusinessMutations.tsx`, `useCommunityStats.tsx`, `pwaUpdate.ts`, `about-section.tsx`
- **Problema**: Logs de debug espalhados pelo código de produção.
- **Impacto**: Exposição de informações internas no console do usuário; poluição visual em debugging.
- **Sugestão**: Remover ou envolver em `if (import.meta.env.DEV)`.

### 8. Tabelas no banco sem referência no frontend
- **Categoria**: Banco / Código morto
- **Local**: Supabase tables
- **Problema**: As seguintes tabelas **não parecem ser usadas** no código frontend (exceto via `types.ts` auto-gerado):
  - `premiacoes_comunidade`
  - `signup_attempts`
  - `tentativas_acesso_nao_autorizado`
  - `conteudos_liberados_skills`
  - Possivelmente `metricas_skills`, `links_skills`, `reports_skills` (precisaria auditoria mais profunda)
- **Impacto**: Tabelas ocupando espaço e confundindo schema.
- **Sugestão**: Verificar se são usadas por triggers/functions internos; se não, considerar remoção.

### 9. `user_has_access_level` — lógica `skills` restritiva demais
- **Categoria**: Bug potencial
- **Local**: Função SQL `user_has_access_level`
- **Problema**: `WHEN 'skills' THEN RETURN user_plan = 'skills'` — um usuário `business` ou `business_iaplicada` **não** tem acesso a conteúdo de nível `skills`. A hierarquia parece incompleta (business deveria incluir skills).
- **Impacto**: Usuários business podem não ver conteúdo skills que deveriam acessar.
- **Sugestão**: Alterar para `RETURN user_plan IN ('skills', 'business', 'business_iaplicada')` se business deve incluir skills.

### 10. `handle_google_auth` — trigger referencia bloquear novos cadastros Google
- **Categoria**: Bug potencial / Fluxo
- **Local**: Função SQL `handle_google_auth`
- **Problema**: A função tenta `UPDATE profiles SET id = NEW.id` quando o ID do auth difere do profile. Isso pode causar conflitos de FK em cascata (user_roles, progresso_videos, favoritos, etc.).
- **Impacto**: Login Google de usuário existente com ID diferente pode corromper dados.
- **Sugestão**: Revisar a lógica de merge de IDs para garantir que todas as tabelas com FK para profiles.id sejam atualizadas.

### 11. `inicializar_fases_processo` — referência a "Club IAplicada" na fase 9
- **Categoria**: Código morto / Inconsistência
- **Local**: Função SQL `inicializar_fases_processo`, fase 9
- **Problema**: Descrição diz "12 meses de acesso à plataforma e **Club IAplicada**" — o plano `club` foi removido.
- **Impacto**: Texto legado visível para usuários; confusão.
- **Sugestão**: Atualizar descrição para remover referência ao Club.

---

## 🟢 MENORES

### 12. Código comentado residual
- **Categoria**: Código morto
- **Local**: `src/components/ProtectedRoute.tsx` (linhas 19-23), possivelmente outros
- **Problema**: Bloco de debug comentado.
- **Sugestão**: Remover.

### 13. `about-section.tsx` — console.log em handleVideoEnd
- **Categoria**: Código morto
- **Local**: `src/components/ui/about-section.tsx` linha 17
- **Problema**: `console.log("Video ended at 3:26")` — log de debug hardcoded.
- **Sugestão**: Remover.

### 14. Dependência `react-markdown` + `remark-gfm` — verificar uso
- **Categoria**: Dependências
- **Local**: `package.json`
- **Problema**: Pacotes de rendering Markdown instalados. Se pouco usados, adicionam peso ao bundle.
- **Sugestão**: Verificar se realmente necessários; aplicar lazy loading se usados em poucas páginas.

### 15. `vite-plugin-pwa` — verificar configuração completa
- **Categoria**: Configuração
- **Local**: `vite.config.ts` / `package.json`
- **Problema**: PWA plugin instalado; verificar se manifest, icons e service worker estão corretamente configurados.
- **Sugestão**: Auditar configuração PWA.

### 16. Views `ranking_dashboard` e `historico_completo` sem filtros de acesso
- **Categoria**: Performance
- **Local**: Views SQL
- **Problema**: `historico_completo` faz LEFT JOIN sem filtro — retorna TODOS os registros de auditoria. `ranking_dashboard` varre todos os profiles.
- **Sugestão**: Considerar materializar ou limitar com WHERE clause.

---

## Resumo

| Severidade | Total |
|---|---|
| 🔴 Crítico | 4 |
| 🟡 Importante | 7 |
| 🟢 Menor | 5 |
| **Total** | **16** |

| Categoria | Total |
|---|---|
| Segurança | 5 |
| Código morto | 5 |
| Banco | 2 |
| Bug potencial | 2 |
| Performance | 1 |
| Dependência | 1 |

### Top 5 Prioridades de Correção Imediata

1. **`password_reset_tokens` sem policies** — pode estar quebrando o fluxo de redefinição de senha
2. **Views SECURITY DEFINER** — `historico_completo` pode vazar dados de auditoria
3. **Leaked Password Protection** — habilitar para bloquear senhas comprometidas
4. **`user_has_access_level` hierarquia skills** — business pode não acessar conteúdo skills
5. **Imports/páginas mortas em App.tsx** — limpeza para reduzir bundle e confusão

