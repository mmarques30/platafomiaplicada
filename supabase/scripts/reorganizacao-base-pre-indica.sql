-- ============================================================================
-- Reorganização da base antes do programa Indica / Insiders
--
-- Objetivo: deixar plano, papel e situação de acesso coerentes para todo mundo
-- que JÁ está dentro, sem apagar nenhum dado e sem mexer em quem está correto.
-- Nada aqui cria estrutura nova: os papéis e painéis do Indica entram depois,
-- somando, em migração própria.
--
-- Como rodar (SQL do Lovable Cloud), um bloco por vez, na ordem:
--   PASSO 0  cópia de segurança
--   PASSO 1  conferência ANTES  (guarde o resultado)
--   PASSOS 2 a 6  os ajustes
--   PASSO 7  conferência DEPOIS (compare com o do passo 1)
-- ============================================================================


-- ============================================================================
-- PASSO 0 · Cópia de segurança (obrigatório)
-- Cria tabelas espelho com a data no nome. Não afeta o sistema.
-- Para desfazer qualquer passo, os valores originais estão aqui.
-- ============================================================================

create table if not exists public.backup_profiles_20260916 as
  select * from public.profiles;

create table if not exists public.backup_user_roles_20260916 as
  select * from public.user_roles;

create table if not exists public.backup_contratos_business_20260916 as
  select * from public.contratos_business;


-- ============================================================================
-- PASSO 1 · Conferência ANTES  (guarde este resultado)
-- ============================================================================

select 'a_planos' as bloco, jsonb_build_object(
         'plano', plano_mentoria::text, 'visitante', is_visitante,
         'ativa', conta_ativa, 'usuarios', count(*)) as dados
  from public.profiles
 group by plano_mentoria, is_visitante, conta_ativa
union all
select 'b_papeis', jsonb_build_object('papel', role::text, 'usuarios', count(*))
  from public.user_roles group by role
union all
select 'c_pendencias', jsonb_build_object(
         'visitantes_vencidos_ainda_ativos', (
           select count(*) from public.profiles
            where is_visitante and conta_ativa and acesso_expira_em < now()),
         'alunos_com_data_antiga', (
           select count(*) from public.profiles
            where not is_visitante and acesso_expira_em is not null
              and plano_mentoria in ('academy', 'business_sistemas')),
         'papel_parceiros', (
           select count(*) from public.user_roles where role = 'parceiros'),
         'contratos_ativos_de_academy', (
           select count(*) from public.contratos_business c
             join public.profiles p on p.id = c.user_id
            where p.plano_mentoria = 'academy' and c.status = 'ativo'))
union all
select 'd_dados_preservados', jsonb_build_object(
         'progresso_videos', (select count(*) from public.progresso_videos),
         'favoritos', (select count(*) from public.favoritos),
         'community_posts', (select count(*) from public.community_posts),
         'contratos', (select count(*) from public.contratos_business),
         'perfis', (select count(*) from public.profiles))
order by 1;


-- ============================================================================
-- PASSO 2 · Visitantes vencidos -> expirar de verdade
--
-- 207 pessoas estão com a data de acesso vencida (março a junho) e continuam
-- entrando, porque a tela bloqueia pela flag `acesso_expirado` e não pela data.
-- Isto faz o que a rotina automática deveria ter feito.
-- O perfil e tudo que a pessoa produziu continuam no banco: ela só deixa de
-- entrar. Reverter é colocar as duas colunas de volta no valor antigo.
-- ============================================================================

update public.profiles
   set acesso_expirado = true,
       conta_ativa     = false,
       updated_at      = now()
 where is_visitante = true
   and conta_ativa = true
   and acesso_expirado = false
   and acesso_expira_em is not null
   and acesso_expira_em < now();


-- ============================================================================
-- PASSO 3 · Alunos com data de expiração antiga -> liberar
--
-- Sobra da conversão de visitante para aluno. Hoje não bloqueia, mas qualquer
-- regra nova que leia a data derruba essas pessoas. Limpa a data e garante a
-- conta liberada. Não toca em quem foi desativado de propósito (esses estão
-- sem data nenhuma e seguem inativos).
-- ============================================================================

update public.profiles
   set acesso_expira_em = null,
       acesso_expirado  = false,
       conta_ativa      = true,
       updated_at       = now()
 where is_visitante = false
   and plano_mentoria in ('academy', 'business_sistemas')
   and acesso_expira_em is not null;


-- ============================================================================
-- PASSO 4 · Papel antigo "parceiros" -> aluno Academy
--
-- Duas pessoas têm só o papel `parceiros`, que faz a plataforma tratá-las
-- como o plano antigo. Elas entram, veem o menu de Academy e as trilhas
-- aparecem vazias. Ficam como Academy de verdade: papel de aluno somado,
-- papel antigo removido. O plano delas já é academy.
-- (A ordem importa: primeiro dá o papel novo, depois tira o antigo.)
-- ============================================================================

insert into public.user_roles (user_id, role)
select ur.user_id, 'aluno_trilha'::app_role
  from public.user_roles ur
 where ur.role = 'parceiros'
   and not exists (
     select 1 from public.user_roles x
      where x.user_id = ur.user_id and x.role = 'aluno_trilha');

update public.profiles
   set plano_mentoria = 'academy',
       conta_ativa    = true,
       updated_at     = now()
 where id in (select user_id from public.user_roles where role = 'parceiros')
   and plano_mentoria is distinct from 'academy';

delete from public.user_roles where role = 'parceiros';


-- ============================================================================
-- PASSO 5 · Contratos dormentes de alunos Academy -> encerrar
--
-- Sete contratos ficaram ativos de quando essas pessoas estavam no plano
-- antigo. Elas são alunas Academy e continuam assim. O contrato é encerrado
-- para não contar como cliente em nenhuma regra ou métrica nova; o registro
-- e os documentos continuam no banco.
-- ============================================================================

update public.contratos_business c
   set status = 'encerrado',
       updated_at = now()
  from public.profiles p
 where p.id = c.user_id
   and p.plano_mentoria = 'academy'
   and c.status = 'ativo';


-- ============================================================================
-- PASSO 6 · Conta interna no plano pago -> equipe
--
-- maria.tech@iaplicada.com é conta da IAplicada e estava contando como
-- Insider Pago. Vira equipe e sai do plano de cliente. O papel `equipe`
-- mantém o acesso à plataforma e ao painel interno.
-- Os outros quatro Insider Pago sem contrato continuam como estão.
-- ============================================================================

insert into public.user_roles (user_id, role)
select p.id, 'equipe'::app_role
  from public.profiles p
 where lower(p.email) = 'maria.tech@iaplicada.com'
   and not exists (
     select 1 from public.user_roles x where x.user_id = p.id and x.role = 'equipe');

update public.profiles
   set plano_mentoria = null,
       updated_at     = now()
 where lower(email) = 'maria.tech@iaplicada.com';


-- ============================================================================
-- PASSO 7 · Conferência DEPOIS  (compare com o PASSO 1)
--
-- O que tem de bater:
--  • 'd_dados_preservados' idêntico ao de antes (nada foi apagado)
--  • em 'c_pendencias', tudo zero
--  • em 'b_papeis', 'parceiros' sumiu e 'aluno_trilha' subiu 2
--  • em 'a_planos', business_sistemas caiu de 15 para 14 (a conta interna)
-- ============================================================================

select 'a_planos' as bloco, jsonb_build_object(
         'plano', plano_mentoria::text, 'visitante', is_visitante,
         'ativa', conta_ativa, 'usuarios', count(*)) as dados
  from public.profiles
 group by plano_mentoria, is_visitante, conta_ativa
union all
select 'b_papeis', jsonb_build_object('papel', role::text, 'usuarios', count(*))
  from public.user_roles group by role
union all
select 'c_pendencias', jsonb_build_object(
         'visitantes_vencidos_ainda_ativos', (
           select count(*) from public.profiles
            where is_visitante and conta_ativa and acesso_expira_em < now()),
         'alunos_com_data_antiga', (
           select count(*) from public.profiles
            where not is_visitante and acesso_expira_em is not null
              and plano_mentoria in ('academy', 'business_sistemas')),
         'papel_parceiros', (
           select count(*) from public.user_roles where role = 'parceiros'),
         'contratos_ativos_de_academy', (
           select count(*) from public.contratos_business c
             join public.profiles p on p.id = c.user_id
            where p.plano_mentoria = 'academy' and c.status = 'ativo'))
union all
select 'd_dados_preservados', jsonb_build_object(
         'progresso_videos', (select count(*) from public.progresso_videos),
         'favoritos', (select count(*) from public.favoritos),
         'community_posts', (select count(*) from public.community_posts),
         'contratos', (select count(*) from public.contratos_business),
         'perfis', (select count(*) from public.profiles))
union all
-- Ninguém pode ficar sem papel nenhum: quem aparecer aqui não entra mais.
select 'e_sem_papel', jsonb_build_object('email', p.email, 'plano', p.plano_mentoria::text)
  from public.profiles p
 where p.conta_ativa
   and not exists (select 1 from public.user_roles ur where ur.user_id = p.id)
order by 1;


-- ============================================================================
-- Como desfazer (só se algo sair errado)
-- ============================================================================
/*
update public.profiles p
   set plano_mentoria = b.plano_mentoria, is_visitante = b.is_visitante,
       conta_ativa = b.conta_ativa, acesso_expirado = b.acesso_expirado,
       acesso_expira_em = b.acesso_expira_em
  from public.backup_profiles_20260916 b
 where b.id = p.id;

update public.contratos_business c
   set status = b.status
  from public.backup_contratos_business_20260916 b
 where b.id = c.id;

delete from public.user_roles;
insert into public.user_roles select * from public.backup_user_roles_20260916;
*/
