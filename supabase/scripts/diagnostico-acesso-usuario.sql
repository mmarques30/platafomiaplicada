-- ============================================================================
-- Diagnóstico de acesso de um aluno (Academy)
--
-- Uso: no SQL do Lovable Cloud, troque o e-mail abaixo e rode o bloco inteiro.
-- Cada consulta responde a uma pergunta. Veja "Como ler" no fim.
-- ============================================================================

-- >>> troque aqui (pode ser qualquer e-mail que a pessoa já usou)
\set email 'kryptasec@gmail.com'

-- 1) Contas no auth com esse e-mail (deveria haver exatamente uma)
select id, email, email_confirmed_at, last_sign_in_at, created_at,
       raw_app_meta_data->>'provider' as provedor
from auth.users
where lower(email) = lower(:'email');

-- 2) Perfis com esse e-mail. O id do perfil TEM de ser igual ao id do auth.
--    Dois perfis (um antigo de lead e um novo) ou id diferente = conta quebrada.
select id, email, nome_completo, plano_mentoria, is_visitante, conta_ativa,
       senha_temporaria, primeiro_acesso, acesso_expira_em, data_expiracao_acesso,
       created_at, updated_at
from public.profiles
where lower(email) = lower(:'email')
   or id in (select id from auth.users where lower(email) = lower(:'email'));

-- 3) Papéis. Aluno Academy precisa ter 'aluno_trilha' (ou 'mentorado') e
--    NÃO pode ter só 'visitante': com 'visitante' ele vê apenas as trilhas
--    liberadas para visitantes (por isso "só aparecem 1, 2, 14 e 21").
select ur.user_id, ur.role
from public.user_roles ur
where ur.user_id in (select id from auth.users where lower(email) = lower(:'email'))
   or ur.user_id in (select id from public.profiles where lower(email) = lower(:'email'));

-- 4) Progresso gravado (se estiver em outro id, foi para um perfil antigo)
select user_id, count(*) filter (where completado) as concluidos, count(*) as total,
       max(ultima_visualizacao) as ultima
from public.progresso_videos
where user_id in (select id from auth.users where lower(email) = lower(:'email'))
   or user_id in (select id from public.profiles where lower(email) = lower(:'email'))
group by user_id;

-- 5) Histórico do webhook de compra (Lia). "error" explica promoção que não
--    aconteceu; vários "processed" para a mesma cobrança explicam senha
--    resetada repetidas vezes.
select created_at, event_type, status, bill_id, error_message
from public.webhook_lia_logs
where lower(customer_email) = lower(:'email')
order by created_at desc
limit 20;

-- 6) Pedidos de recuperação de senha recentes
select email, created_at
from public.password_reset_requests
where lower(email) = lower(:'email')
order by created_at desc
limit 10;

-- ============================================================================
-- Como ler
--  • Sem 'aluno_trilha' em (3)            -> rode o CONSERTO A
--  • plano_mentoria nulo ou is_visitante  -> rode o CONSERTO A
--  • senha_temporaria = true              -> rode o CONSERTO A (zera a flag)
--  • Dois perfis / id diferente em (2)    -> rode o CONSERTO B antes do A
--  • Trocar o e-mail                      -> CONSERTO C
-- ============================================================================

-- CONSERTO A: garantir plano Academy, papel de aluno e sem troca obrigatória
-- (troque <ID> pelo id do auth.users da consulta 1)
/*
update public.profiles
   set plano_mentoria = 'academy', is_visitante = false, conta_ativa = true,
       senha_temporaria = false, primeiro_acesso = false
 where id = '<ID>';

delete from public.user_roles where user_id = '<ID>' and role = 'visitante';

insert into public.user_roles (user_id, role)
select '<ID>', 'aluno_trilha'
 where not exists (select 1 from public.user_roles where user_id = '<ID>' and role = 'aluno_trilha');
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
   set email = 'kryptasec@gmail.com', email_confirmed_at = coalesce(email_confirmed_at, now())
 where id = '<ID>';
update public.profiles set email = 'kryptasec@gmail.com' where id = '<ID>';
*/
