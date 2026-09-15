-- ============================================================================
-- Diagnóstico de acesso de um aluno (Academy)
--
-- Uso: no SQL do Lovable Cloud, troque o e-mail na primeira linha da consulta
-- (dentro de lower('...')) e rode. É UMA consulta só: cada linha do resultado
-- tem a seção (1_auth, 2_perfil, 3_papel, 4_progresso, 5_webhook) e os dados.
-- ============================================================================

with alvo as (
  select lower('kryptasec@gmail.com') as email      -- >>> troque aqui
),
ids as (
  select a.id from auth.users a, alvo where lower(a.email) = alvo.email
  union
  select p.id from public.profiles p, alvo where lower(p.email) = alvo.email
)
-- 1) Contas no auth (deveria haver exatamente uma)
select '1_auth' as secao, jsonb_build_object(
  'id', a.id, 'email', a.email, 'confirmado_em', a.email_confirmed_at,
  'ultimo_login', a.last_sign_in_at, 'criado_em', a.created_at,
  'provedor', a.raw_app_meta_data->>'provider') as dados
from auth.users a, alvo
where lower(a.email) = alvo.email

union all
-- 2) Perfis. O id do perfil TEM de ser igual ao id do auth. Dois perfis
--    (um antigo de lead e um novo) ou id diferente = conta quebrada.
select '2_perfil', jsonb_build_object(
  'id', p.id, 'email', p.email, 'nome', p.nome_completo,
  'plano', p.plano_mentoria, 'visitante', p.is_visitante, 'ativa', p.conta_ativa,
  'senha_temporaria', p.senha_temporaria, 'primeiro_acesso', p.primeiro_acesso,
  'expira_em', p.acesso_expira_em, 'criado_em', p.created_at)
from public.profiles p
where p.id in (select id from ids)
   or lower(p.email) in (select email from alvo)

union all
-- 3) Papéis. Aluno Academy precisa de 'aluno_trilha' (ou 'mentorado').
--    Só 'visitante' = vê apenas as trilhas liberadas para visitantes.
select '3_papel', jsonb_build_object('user_id', ur.user_id, 'role', ur.role)
from public.user_roles ur
where ur.user_id in (select id from ids)

union all
-- 4) Progresso gravado (se estiver em outro id, foi para um perfil antigo)
select '4_progresso', jsonb_build_object(
  'user_id', pv.user_id,
  'concluidos', count(*) filter (where pv.completado),
  'total', count(*), 'ultimo', max(pv.ultima_visualizacao))
from public.progresso_videos pv
where pv.user_id in (select id from ids)
group by pv.user_id

union all
-- 5) Últimos eventos do webhook de compra (Lia). "error" explica promoção
--    que não aconteceu; vários "processed" da mesma cobrança explicam a
--    senha resetada repetidas vezes.
select '5_webhook', jsonb_build_object(
  'quando', w.created_at, 'evento', w.event_type, 'status', w.status,
  'bill_id', w.bill_id, 'erro', w.error_message)
from (
  select w.* from public.webhook_lia_logs w, alvo
  where lower(w.customer_email) = alvo.email
  order by w.created_at desc limit 20
) w

order by 1;

-- ============================================================================
-- Como ler
--  • Sem 'aluno_trilha' em 3_papel          -> CONSERTO A
--  • plano nulo ou visitante = true         -> CONSERTO A
--  • senha_temporaria = true                -> CONSERTO A (zera a flag)
--  • Dois perfis / id diferente em 2_perfil -> CONSERTO B antes do A
--  • Trocar o e-mail                        -> CONSERTO C
-- Troque <ID> pelo id que aparece em 1_auth. Rode um bloco por vez.
-- ============================================================================

-- CONSERTO A: plano Academy, papel de aluno, sem troca obrigatória de senha
/*
update public.profiles
   set plano_mentoria = 'academy', is_visitante = false, conta_ativa = true,
       senha_temporaria = false, primeiro_acesso = false
 where id = '<ID>';

delete from public.user_roles where user_id = '<ID>' and role = 'visitante';

insert into public.user_roles (user_id, role)
select '<ID>', 'aluno_trilha'
 where not exists (
   select 1 from public.user_roles where user_id = '<ID>' and role = 'aluno_trilha');
*/

-- CONSERTO B: havia um perfil antigo (lead) com outro id. Move o que estiver
-- nele para o id do auth e remove o perfil antigo.
-- (<ID_ANTIGO> = id do perfil que não bate com o auth; <ID> = id do auth)
/*
update public.progresso_videos set user_id = '<ID>' where user_id = '<ID_ANTIGO>';
update public.user_roles      set user_id = '<ID>' where user_id = '<ID_ANTIGO>'
   and role not in (select role from public.user_roles where user_id = '<ID>');
delete from public.user_roles where user_id = '<ID_ANTIGO>';
delete from public.profiles   where id = '<ID_ANTIGO>';
*/

-- CONSERTO C: trocar o e-mail de login (sempre em minúsculas)
/*
update auth.users
   set email = 'kryptasec@gmail.com',
       email_confirmed_at = coalesce(email_confirmed_at, now())
 where id = '<ID>';
update public.profiles set email = 'kryptasec@gmail.com' where id = '<ID>';
*/
