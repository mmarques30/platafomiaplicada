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
import { X } from "lucide-react";

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
  ctaBg: string;
  ctaTextColor: string;
}

function StepCircle({ status }: { status: StepStatus }) {
  const base = "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold";
  if (status === "feito") {
    return (
      <div className={base} style={{ background: "rgba(175,192,64,0.15)", color: "#AFC040", border: "1.5px solid #AFC040" }}>
        ✓
      </div>
    );
  }
  if (status === "agora") {
    return (
      <div className={base} style={{ background: "#AFC040", color: "#0C0F0A" }}>
        →
      </div>
    );
  }
  return (
    <div className={base} style={{ background: "#2E3229", color: "rgba(255,255,255,0.3)", border: "1.5px solid #2E3229" }}>
      ○
    </div>
  );
}

function labelColor(status: StepStatus) {
  if (status === "feito") return "#AFC040";
  if (status === "agora") return "#AFC040";
  return "rgba(255,255,255,0.3)";
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
    if (profile?.primeiro_acesso === false && profile?.senha_temporaria !== true && !localStorage.getItem(chave)) {
      setMostrar(true);
    }
  }, [profile?.primeiro_acesso, user?.id, previewMode]);

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
        ctaBg: "#AFC040",
        ctaTextColor: "#0C0F0A",
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
          { status: "proximo", label: "Após o diagnóstico", titulo: "Comece sua primeira Trilha recomendada", desc: "Vídeos práticos, exercícios aplicados e projetos reais. Progresso salvo automaticamente. Acesse também prompts prontos e ferramentas nas Bibliotecas." },
          { status: "proximo", label: "Ao longo da jornada", titulo: "Acumule conquistas e emita seu Certificado", desc: "Cada trilha gera conquistas rastreadas em Evolução. O certificado é emitido ao concluir — compartilhável no LinkedIn." },
        ],
        ctaLabel: "Iniciar meu Diagnóstico →",
        ctaHref: "/mentoria/diagnostico",
        ctaBg: "#AFC040",
        ctaTextColor: "#0C0F0A",
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
        ctaBg: "#E8A43C",
        ctaTextColor: "#0C0F0A",
      };
    }

    if (effectivePlan === "business_parceria") {
      const totalEtapas = etapas?.length ?? 0;
      const primeiraEtapa = etapas?.[0]?.titulo ?? "Etapa inicial";

      return {
        planoLabel: "Business Parceria",
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
        ctaBg: "#2CBBA6",
        ctaTextColor: "#ffffff",
      };
    }

    if (effectivePlan === "business_sistemas") {
      return {
        planoLabel: "Business Sistemas",
        titulo: `Seu sistema está sendo construído, ${nome}.`,
        sub: "A IAplicada constrói e entrega seu sistema por etapas. Acompanhe o andamento em Meu Sistema — e use o Academy enquanto isso.",
        passos: [
          { status: "feito", titulo: "Acesso configurado", desc: "Sua conta Business Sistemas está ativa." },
          { status: "agora", label: "Comece por aqui", titulo: "Conheça o Meu Sistema", desc: "Aqui você acompanha cada etapa de construção, documentos entregues e o status do seu projeto. Você será notificado sempre que algo novo for adicionado.", cta: "Ir para Meu Sistema →", href: "/meu-sistema" },
          { status: "proximo", label: "Ao longo do projeto", titulo: "Acompanhe etapas e documentos entregues", desc: "Cada etapa tem documentos e entregas específicas. O progresso é atualizado pela equipe IAplicada conforme o trabalho avança." },
          { status: "proximo", label: "Acesso paralelo — disponível agora", titulo: "Use o Academy enquanto o sistema é construído", desc: "Você tem acesso a trilhas de aprendizado, biblioteca de prompts e ferramentas de IA. Aprenda enquanto seu sistema é entregue.", cta: "Ver trilhas disponíveis →", href: "/trilhas" },
        ],
        ctaLabel: "Ir para Meu Sistema →",
        ctaHref: "/meu-sistema",
        ctaBg: "#2CBBA6",
        ctaTextColor: "#ffffff",
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

  // Loading state for gratuito
  if (isGratuito && loadingVideos) {
    return createPortal(
      <div style={{ position: "fixed", inset: 0, zIndex: 9998, background: "#0C0F0A", display: "flex", alignItems: "center", justifyContent: "center", overflowY: "auto", padding: "16px 0" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #AFC040 1px, transparent 1px)", backgroundSize: "28px 28px", opacity: 0.025 }} />
        <div style={{ position: "relative", zIndex: 1, background: "#141810", border: "0.5px solid rgba(175,192,64,0.15)", borderRadius: 20, maxWidth: 680, width: "100%", margin: "auto 16px", maxHeight: "calc(100vh - 32px)", overflowY: "auto", padding: 32 }}>
          <Skeleton className="h-4 w-32 mb-4" style={{ background: "#2E3229" }} />
          <Skeleton className="h-6 w-full mb-2" style={{ background: "#2E3229" }} />
          <Skeleton className="h-4 w-3/4 mb-6" style={{ background: "#2E3229" }} />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 mb-4">
              <Skeleton className="h-8 w-8 rounded-full" style={{ background: "#2E3229" }} />
              <div className="flex-1">
                <Skeleton className="h-4 w-full mb-1" style={{ background: "#2E3229" }} />
                <Skeleton className="h-3 w-2/3" style={{ background: "#2E3229" }} />
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
    <div style={{ position: "fixed", inset: 0, zIndex: 9998, background: "#0C0F0A", display: "flex", alignItems: "center", justifyContent: "center", overflowY: "auto", padding: "16px 0" }}>
      {/* Dot grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #AFC040 1px, transparent 1px)", backgroundSize: "28px 28px", opacity: 0.025 }} />

      {/* Modal */}
      <div style={{ position: "relative", zIndex: 1, background: "#141810", border: "0.5px solid rgba(175,192,64,0.15)", borderRadius: 20, maxWidth: 680, width: "100%", margin: "auto 16px", maxHeight: "calc(100vh - 32px)", overflowY: "auto" }}>
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", padding: 4, zIndex: 2 }}
          aria-label="Fechar"
        >
          <X style={{ width: 18, height: 18, color: "rgba(255,255,255,0.3)" }} />
        </button>

        {/* Header */}
        <div style={{ padding: "28px 32px 20px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 10, color: "#AFC040", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, fontWeight: 600 }}>
            ✱ IAplicada — {config.planoLabel}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: "#E2E5DC", lineHeight: 1.3, margin: 0 }}>
            {config.titulo}
          </h2>
          <p style={{ fontSize: 13, color: "#6B7060", lineHeight: 1.6, margin: "8px 0 0" }}>
            {config.sub}
          </p>
        </div>

        {/* Steps */}
        <div style={{ padding: "20px 32px" }}>
          {config.passos.map((passo, i) => (
            <div key={i} style={{ display: "flex", gap: 14, marginBottom: i < config.passos.length - 1 ? 16 : 0 }}>
              <StepCircle status={passo.status} />
              <div style={{ minWidth: 0, flex: 1 }}>
                {passo.label && (
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: labelColor(passo.status), marginBottom: 3, fontWeight: 500 }}>
                    {passo.label}
                  </div>
                )}
                <div style={{ fontSize: 14, fontWeight: 500, color: "#E2E5DC", lineHeight: 1.4 }}>
                  {passo.titulo}
                </div>
                <div style={{ fontSize: 12, color: "#6B7060", lineHeight: 1.55, marginTop: 2 }}>
                  {passo.desc}
                </div>
                {passo.cta && passo.href && (
                  <Link
                    to={passo.href}
                    onClick={handleClose}
                    style={{ fontSize: 12, fontWeight: 500, color: config.ctaBg, textDecoration: "none", display: "inline-block", marginTop: 6 }}
                  >
                    {passo.cta}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 32px", borderTop: "0.5px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 11, color: "#6B7060", whiteSpace: "nowrap" }}>
            {feitos} de {total}
          </span>
          <div style={{ flex: 1, height: 3, background: "#2E3229", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${(feitos / total) * 100}%`, height: "100%", background: "#AFC040", borderRadius: 2, transition: "width 400ms ease" }} />
          </div>
          <Link
            to={config.ctaHref}
            onClick={handleClose}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 20px",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 10,
              background: config.ctaBg,
              color: config.ctaTextColor,
              textDecoration: "none",
              whiteSpace: "nowrap",
              transition: "opacity 150ms",
            }}
          >
            {config.ctaLabel}
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
