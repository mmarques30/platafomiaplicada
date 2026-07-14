import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffectivePlan } from "@/hooks/useUserPlan";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useEtapasBusiness } from "@/hooks/useEtapasBusiness";
import { useOnboardingTracking } from "@/hooks/useOnboardingTracking";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type StepStatus = "feito" | "agora" | "proximo";

interface Passo {
  status: StepStatus;
  label?: string;
  titulo: string;
  desc: string;
  cta?: string;
  href?: string;
}

interface PlanConfig {
  planoLabel: string;
  titulo: string;
  sub: string;
  passos: Passo[];
  ctaLabel: string;
  ctaHref: string;
}

function StepCircle({ status }: { status: StepStatus }) {
  const base = "w-9 h-9 rounded-full flex items-center justify-center shrink-0";
  if (status === "feito") {
    return (
      <div className={cn(base, "bg-brand-strong/12 border border-brand-strong/50 text-brand-strong")}>
        <Check className="h-4 w-4" strokeWidth={2.25} />
      </div>
    );
  }
  if (status === "agora") {
    return (
      <div className={cn(base, "bg-brand-strong text-brand-cream shadow-sm shadow-brand-strong/20")}>
        <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
      </div>
    );
  }
  return (
    <div className={cn(base, "border border-brand-hairline text-muted-foreground/50")}>
      <span className="block h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
    </div>
  );
}

function labelColorClass(status: StepStatus) {
  if (status === "feito" || status === "agora") return "text-brand-strong";
  return "text-muted-foreground/70";
}

interface ProximosPassosCardProps {
  previewMode?: boolean;
  onClose?: () => void;
}

export function ProximosPassosCard({ previewMode, onClose: onCloseExternal }: ProximosPassosCardProps = {}) {
  const [mostrar, setMostrar] = useState(previewMode ?? false);
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { effectivePlan } = useEffectivePlan(isAdmin, roleLoading);

  // Business data
  const isBizParceria = effectivePlan === "business_parceria";
  const { contrato } = useContratosBusiness(isBizParceria ? user?.id : undefined);
  const { data: etapas } = useEtapasBusiness(isBizParceria ? contrato?.id : undefined);

  // Gratuito videos
  const isGratuito = effectivePlan === null;
  const { data: videosGratuitos, isLoading: loadingVideos } = useQuery({
    queryKey: ["videos-visitantes-onboarding"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conteudos_dashboard")
        .select("id, titulo, resumo")
        .eq("visivel_gratuitos", true)
        .eq("ativo", true)
        .order("ordem", { ascending: true })
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: isGratuito && mostrar,
  });

  const nome = profile?.nome_completo?.split(" ")[0] ?? "";

  useEffect(() => {
    if (previewMode) return;
    if (!user?.id) return;
    const chave = `proximos_passos_v2_${user.id}`;
    const jaViuVideo = sessionStorage.getItem('onboarding_video_visto') === 'true';
    if (
      profile?.senha_temporaria !== true &&
      !localStorage.getItem(chave) &&
      (profile?.primeiro_acesso === false || jaViuVideo)
    ) {
      setMostrar(true);
    }
  }, [profile?.primeiro_acesso, user?.id, previewMode]);

  // Permite reabrir os "Primeiros passos" a qualquer momento (ex.: botão na Home).
  useEffect(() => {
    if (previewMode) return;
    const abrir = () => setMostrar(true);
    window.addEventListener("abrir-primeiros-passos", abrir);
    return () => window.removeEventListener("abrir-primeiros-passos", abrir);
  }, [previewMode]);

  const config = useMemo((): PlanConfig | null => {
    if (!mostrar) return null;

    if (effectivePlan === null) {
      // Gratuito / Visitante
      const v = videosGratuitos ?? [];
      const passos: Passo[] = [];

      if (v[0]) passos.push({ status: "agora", titulo: v[0].titulo, desc: v[0].resumo ?? "Assista ao primeiro conteúdo disponível.", cta: "Assistir agora →", href: `/videos/${v[0].id}` });
      if (v[1]) passos.push({ status: "proximo", titulo: v[1].titulo, desc: v[1].resumo ?? "", cta: "Assistir →", href: `/videos/${v[1].id}` });
      if (v[2]) passos.push({ status: "proximo", titulo: v[2].titulo, desc: v[2].resumo ?? "", cta: "Assistir →", href: `/videos/${v[2].id}` });

      passos.push({ status: "proximo", label: "Quando quiser ir além", titulo: "Conheça o plano Academy", desc: "Acesse trilhas completas, diagnóstico personalizado, MarIAna IA e certificados.", cta: "Ver o Academy →", href: "/servicos" });

      return {
        planoLabel: "Acesso Gratuito",
        titulo: `Bem-vindo, ${nome}. Você já tem vídeos disponíveis.`,
        sub: "Sem cadastro extra, sem cartão. Estes vídeos são seus agora.",
        passos,
        ctaLabel: "Assistir primeiro vídeo →",
        ctaHref: `/videos/${v[0]?.id ?? ""}`,
      };
    }

    if (effectivePlan === "academy") {
      return {
        planoLabel: "Academy",
        titulo: `Sua jornada começa agora, ${nome}.`,
        sub: "Você tem acesso completo a trilhas, diagnóstico, evolução e certificados. Siga a ordem — cada passo potencializa o próximo.",
        passos: [
          { status: "feito", titulo: "Plataforma configurada e tour concluído", desc: "Você já conhece os recursos principais e sabe onde encontrar tudo." },
          { status: "agora", label: "Faça agora — 15 minutos", titulo: "Preencha seu Diagnóstico de IA", desc: "A MarIAna analisa seu perfil e gera um painel com seus principais gaps, pontos fortes e prioridades de aprendizado personalizado.", cta: "Iniciar Diagnóstico →", href: "/mentoria/diagnostico" },
          { status: "proximo", label: "Após o diagnóstico", titulo: "Comece sua primeira Trilha e explore as Bibliotecas", desc: "Vídeos práticos e projetos reais, com progresso salvo. E nas Bibliotecas você já tem prompts prontos e ferramentas de IA para usar no dia a dia.", cta: "Ver Bibliotecas →", href: "/biblioteca-prompts" },
          { status: "proximo", label: "Ao longo da jornada", titulo: "Acumule conquistas e emita seu Certificado", desc: "Cada trilha gera conquistas rastreadas em Evolução. O certificado é emitido ao concluir — compartilhável no LinkedIn." },
        ],
        ctaLabel: "Iniciar meu Diagnóstico →",
        ctaHref: "/mentoria/diagnostico",
      };
    }

    if (effectivePlan === "skills") {
      return {
        planoLabel: "Skills",
        titulo: `O programa Skills começa com você, ${nome}.`,
        sub: "Cada membro faz seu diagnóstico individual. A IA consolida tudo e gera automaticamente o plano coletivo do squad.",
        passos: [
          { status: "feito", titulo: "Equipe configurada no sistema", desc: "Seu squad está ativo. Cada membro já pode acessar a plataforma." },
          { status: "agora", label: "Faça agora — você primeiro", titulo: "Complete seu Diagnóstico individual", desc: "Leva 15 minutos. Avalia seu uso de IA em 5 dimensões: automação, análise, criação, comunicação e gestão. Cada membro faz o próprio — os dados ficam privados até a consolidação.", cta: "Iniciar meu Diagnóstico →", href: "/skills/diagnostico" },
          { status: "proximo", label: "Quando todos do squad concluírem", titulo: "A IA gera o Backlog e Roadmap do squad", desc: "Gaps prioritários, projetos recomendados e distribuição por membro — gerados automaticamente. O líder acessa o Painel do Líder para visão consolidada." },
          { status: "proximo", label: "Semanas 2–12", titulo: "Execute projetos e acompanhe no Painel de Entregas", desc: "Backlog priorizado, roadmap da equipe, entregas por membro e progresso coletivo. Você também pode acessar trilhas Academy para aprendizado individual." },
        ],
        ctaLabel: "Iniciar meu Diagnóstico →",
        ctaHref: "/skills/diagnostico",
      };
    }

    if (effectivePlan === "business_parceria") {
      const totalEtapas = etapas?.length ?? 0;
      const primeiraEtapa = etapas?.[0]?.titulo ?? "Etapa inicial";

      return {
        planoLabel: "Builder",
        titulo: totalEtapas > 0
          ? `Seu projeto tem ${totalEtapas} etapas, ${nome}. Veja o que fazer agora.`
          : `Sua mentoria está ativa, ${nome}. Veja os primeiros passos.`,
        sub: "Você tem mentoria 1:1, sessões, entregas, roadmap executivo, validações e acompanhamento de ROI — além de acesso completo ao Academy.",
        passos: [
          { status: "feito", titulo: "Conta Business configurada", desc: "Seu projeto e acesso estão ativos. O Academy também está disponível para você." },
          {
            status: "agora", label: "Comece por aqui",
            titulo: totalEtapas > 0 ? `Explore seu Roadmap — começando pela "${primeiraEtapa}"` : "Explore seu Roadmap executivo",
            desc: totalEtapas > 0
              ? `Veja as ${totalEtapas} etapas do seu projeto, o que será entregue em cada uma e os marcos de resultado. Suas entregas, validações e tasks ficam em Minha Trajetória.`
              : "Visualize as etapas do seu projeto e o que será construído. Suas entregas, validações e tasks ficam em Minha Trajetória.",
            cta: "Ver meu Roadmap →", href: "/mentoria",
          },
          { status: "proximo", label: "Aguardar confirmação", titulo: "1ª Sessão será agendada em breve", desc: "Você receberá notificação quando a data for confirmada. As sessões ficam em Mentoria → Sessões, com link de entrada direta para a reunião." },
          { status: "proximo", label: "Durante todo o projeto", titulo: "Acompanhe entregas, validações e ROI", desc: "Cada etapa tem entregas e validações definidas. O painel de ROI mostra impacto financeiro real conforme o projeto avança. Reports executivos disponíveis em Mentoria → Reports." },
        ],
        ctaLabel: "Ver meu Roadmap →",
        ctaHref: "/mentoria",
      };
    }

    if (effectivePlan === "business_sistemas") {
      return {
        planoLabel: "System",
        titulo: `Seu sistema está sendo construído, ${nome}.`,
        sub: "A IAplicada constrói e entrega seu sistema por etapas. Acompanhe o andamento em Meu Sistema — e use o Academy enquanto isso.",
        passos: [
          { status: "feito", titulo: "Acesso configurado", desc: "Sua conta System está ativa." },
          { status: "agora", label: "Comece por aqui", titulo: "Conheça o Meu Sistema", desc: "Aqui você acompanha cada etapa de construção, documentos entregues e o status do seu projeto. Você será notificado sempre que algo novo for adicionado.", cta: "Ir para Meu Sistema →", href: "/meu-sistema" },
          { status: "proximo", label: "Ao longo do projeto", titulo: "Acompanhe etapas e documentos entregues", desc: "Cada etapa tem documentos e entregas específicas. O progresso é atualizado pela equipe IAplicada conforme o trabalho avança." },
          { status: "proximo", label: "Acesso paralelo — disponível agora", titulo: "Use o Academy enquanto o sistema é construído", desc: "Você tem acesso a trilhas de aprendizado, biblioteca de prompts e ferramentas de IA. Aprenda enquanto seu sistema é entregue.", cta: "Ver trilhas disponíveis →", href: "/trilhas" },
        ],
        ctaLabel: "Ir para Meu Sistema →",
        ctaHref: "/meu-sistema",
      };
    }

    return null;
  }, [mostrar, effectivePlan, nome, videosGratuitos, etapas, contrato]);

  const { track } = useOnboardingTracking();

  const handleClose = () => {
    if (previewMode) {
      setMostrar(false);
      onCloseExternal?.();
      return;
    }
    if (user?.id) {
      track('proximos_passos_vistos');
      localStorage.setItem(`proximos_passos_v2_${user.id}`, "true");
    }
    setMostrar(false);
  };

  if (!mostrar || !config) return null;

  // Loading skeleton (gratuito carrega vídeos)
  if (isGratuito && loadingVideos) {
    return createPortal(
      <div className="fixed inset-0 z-[9998] bg-foreground/40 backdrop-blur-sm flex items-center justify-center overflow-y-auto py-4">
        <div className="relative bg-brand-cream-soft border border-brand-hairline rounded-2xl max-w-[680px] w-full mx-4 max-h-[calc(100vh-32px)] overflow-y-auto p-8 shadow-2xl shadow-foreground/15">
          <Skeleton className="h-4 w-32 mb-4 bg-brand-hairline" />
          <Skeleton className="h-7 w-full mb-2 bg-brand-hairline" />
          <Skeleton className="h-4 w-3/4 mb-6 bg-brand-hairline" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 mb-4">
              <Skeleton className="h-9 w-9 rounded-full bg-brand-hairline" />
              <div className="flex-1">
                <Skeleton className="h-4 w-full mb-1 bg-brand-hairline" />
                <Skeleton className="h-3 w-2/3 bg-brand-hairline" />
              </div>
            </div>
          ))}
        </div>
      </div>,
      document.body
    );
  }

  const feitos = config.passos.filter((p) => p.status === "feito").length;
  const total = config.passos.length;

  return createPortal(
    <div className="fixed inset-0 z-[9998] bg-foreground/40 backdrop-blur-sm flex items-center justify-center overflow-y-auto py-4">
      {/* Modal */}
      <div className="relative bg-brand-cream-soft border border-brand-hairline rounded-2xl max-w-[680px] w-full mx-4 max-h-[calc(100vh-32px)] overflow-y-auto shadow-2xl shadow-foreground/15">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors z-10"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-brand-hairline">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-brand-strong mb-3">
            IAplicada · {config.planoLabel}
          </p>
          <h2 className="font-serif-display text-2xl md:text-[28px] leading-[1.15] tracking-tight text-foreground">
            {config.titulo}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            {config.sub}
          </p>
        </div>

        {/* Steps */}
        <div className="px-8 py-6 space-y-5">
          {config.passos.map((passo, i) => (
            <div key={i} className="flex gap-4">
              <StepCircle status={passo.status} />
              <div className="min-w-0 flex-1 pt-1">
                {passo.label && (
                  <div className={cn("text-[10px] uppercase tracking-[0.08em] font-medium mb-1", labelColorClass(passo.status))}>
                    {passo.label}
                  </div>
                )}
                <div className={cn(
                  "text-sm font-medium leading-snug",
                  passo.status === "proximo" ? "text-muted-foreground" : "text-foreground"
                )}>
                  {passo.titulo}
                </div>
                <div className="text-xs text-muted-foreground/90 leading-relaxed mt-1.5">
                  {passo.desc}
                </div>
                {passo.cta && passo.href && (
                  <Link
                    to={passo.href}
                    onClick={handleClose}
                    className="inline-block text-xs font-medium text-brand-strong hover:text-brand-strong/80 transition-colors mt-2"
                  >
                    {passo.cta}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-brand-hairline flex items-center gap-4">
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
            {feitos} de {total}
          </span>
          <div className="flex-1 h-[3px] bg-brand-hairline rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-strong rounded-full transition-[width] duration-500 ease-out"
              style={{ width: `${(feitos / total) * 100}%` }}
            />
          </div>
          <Link
            to={config.ctaHref}
            onClick={handleClose}
            className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium rounded-lg bg-brand-strong text-brand-cream hover:bg-brand-strong/90 whitespace-nowrap transition-colors shadow-sm"
          >
            {config.ctaLabel}
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
