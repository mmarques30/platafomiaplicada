import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { useEffectivePlan } from "@/hooks/useUserPlan";
import { useUserRole } from "@/hooks/useUserRole";
import { useOnboardingTracking } from "@/hooks/useOnboardingTracking";
import { FormularioWizard } from "@/components/mentoria/FormularioWizard";
import { InsightIA } from "@/components/mentoria/InsightIA";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, CheckCircle2, Clock, ExternalLink, Edit3, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/shared/PageContainer";
import { MentoriaPageHeader } from "@/components/mentoria/MentoriaPageHeader";

/**
 * Tela única e unificada do diagnóstico (Academy + Business). Reorganizada em
 * 12/06 após feedback:
 *   "As telas deveriam se conversar e não se conversam… o propósito é a pessoa
 *    fazer o diagnóstico, isso ser salvo e histórico, e ela ver após finalizar
 *    em tempo real."
 *
 * Resultado: um único layout que mostra status, formulário (quando incompleto)
 * OU resumo + Insight da IA (quando há resultado), link pro painel completo
 * e CTA contextual. Sem mais "naoPreencheu vs preenchido" engessado.
 */
export default function MentoriaDiagnostico() {
  const navigate = useNavigate();
  const location = useLocation();
  const { formulario, isLoading, refetch } = useMentoriaForm();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { effectivePlan, isVisitante, isBusiness, isSimulating, isLoading: planLoading } =
    useEffectivePlan(isAdmin, roleLoading);
  const { track } = useOnboardingTracking();
  const trackedRef = useRef(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!planLoading && !isLoading && !trackedRef.current) {
      trackedRef.current = true;
      track("diagnostico_iniciado");
    }
  }, [planLoading, isLoading, track]);

  const isAcademyRoute = location.pathname.startsWith("/diagnostico");
  const isFormularioRoute = location.pathname === "/diagnostico/formulario";
  const canEdit = new URLSearchParams(location.search).get("edit") === "1";

  // Visitantes + Skills redirecionam (não pertencem a este fluxo)
  useEffect(() => {
    if (planLoading) return;
    if (isVisitante) {
      toast.info("Esta funcionalidade requer um plano ativo");
      navigate("/trilhas", { replace: true });
      return;
    }
    if (effectivePlan === "skills") {
      navigate("/skills/projeto/diagnostico", { replace: true });
    }
  }, [isVisitante, effectivePlan, planLoading, navigate]);

  // Admin real (não simulando) na rota de formulário vai pro painel
  useEffect(() => {
    if (planLoading) return;
    const isRealAdmin = isAdmin && !isSimulating;
    if (isRealAdmin && isFormularioRoute && !canEdit) {
      navigate("/diagnostico/painel", { replace: true });
    }
  }, [isAdmin, isSimulating, isFormularioRoute, canEdit, planLoading, navigate]);

  // Estados derivados
  const completado = formulario?.completado === true;
  const temInsight = !!formulario?.insight_ia;
  const temAlgumDado =
    !!formulario &&
    (!!formulario.profissao ||
      !!formulario.area_atuacao ||
      !!formulario.objetivo_principal ||
      temInsight);
  const planoGerado = formulario?.plano_gerado === true;

  // Wizard aparece quando: ainda não respondeu nada OU usuário clicou em "Editar"
  const mostrarWizard = !completado && (!temAlgumDado || editing) || (completado && editing);

  const handleFormularioFinalizado = () => {
    setEditing(false);
    refetch();
    toast.success("Diagnóstico atualizado!");
  };

  const isRealAdmin = isAdmin && !isSimulating;
  const voltarUrl = isRealAdmin
    ? "/mentoria"
    : !effectivePlan
      ? "/comunidade"
      : effectivePlan === "academy" || isAcademyRoute
        ? "/meu-diagnostico"
        : "/mentoria";
  const voltarLabel = isRealAdmin
    ? "Voltar para Mentoria"
    : !effectivePlan
      ? "Voltar para Comunidade"
      : effectivePlan === "academy" || isAcademyRoute
        ? "Voltar para Meu Diagnóstico"
        : "Voltar para Mentoria";

  if (isLoading || planLoading || isVisitante) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-brand-strong" />
      </div>
    );
  }

  // Status do diagnóstico (badge no header)
  const statusBadge = completado
    ? { icon: CheckCircle2, label: "Finalizado", className: "bg-brand-strong/15 text-brand-strong border-brand-strong/30" }
    : temAlgumDado
      ? { icon: Clock, label: "Em andamento", className: "bg-amber-500/15 text-amber-700 border-amber-500/30" }
      : { icon: Sparkles, label: "Não iniciado", className: "bg-muted text-muted-foreground border-brand-hairline" };

  return (
    <PageContainer>
      <MentoriaPageHeader
        eyebrow="Diagnóstico IA"
        primary="Seu diagnóstico"
        secondary="personalizado"
        backTo={voltarUrl}
        backLabel={voltarLabel}
        actions={
          <>
            {completado && !editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                className="border-brand-hairline"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Editar respostas
              </Button>
            )}
            {planoGerado && (
              <Button
                size="sm"
                onClick={() => navigate(isBusiness ? "/mentoria" : "/diagnostico/painel")}
                className="bg-brand-strong text-brand-cream hover:bg-brand-strong/90"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir painel completo
              </Button>
            )}
          </>
        }
      />

      {/* Status do diagnóstico */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={`${statusBadge.className} gap-1.5`}>
          <statusBadge.icon className="h-3 w-3" />
          {statusBadge.label}
        </Badge>
        {planoGerado && (
          <Badge variant="outline" className="bg-brand-strong/15 text-brand-strong border-brand-strong/30 gap-1.5">
            <CheckCircle2 className="h-3 w-3" />
            Publicado no painel
          </Badge>
        )}
      </div>

      {/* Banner contextual quando preenchido por admin */}
      {completado && formulario?.preenchido_por === "admin" && (
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <CardContent className="py-3 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900/80">
              Este diagnóstico foi preenchido durante a sessão com seu mentor.
              {formulario.arquivo_diagnostico_url && (
                <Button
                  variant="link"
                  className="h-auto p-0 ml-2 text-blue-700"
                  onClick={() => window.open(formulario.arquivo_diagnostico_url, "_blank")}
                >
                  Baixar documento original
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CASO 1: Wizard (não iniciou OU está editando) */}
      {mostrarWizard && (
        <FormularioWizard
          onFinalizado={handleFormularioFinalizado}
          onCancelar={editing ? () => setEditing(false) : undefined}
        />
      )}

      {/* CASO 2: Visualização do resultado (Insight + ações)
          Aparece SEMPRE que tem dado/insight, mesmo que incompleto.
          Não tem mais split rígido por Academy/Business — InsightIA cuida
          das duas, e o link "Abrir painel" leva pra view específica. */}
      {!mostrarWizard && temAlgumDado && (
        <div className="space-y-6">
          {/* Banner incompleto: convida a terminar */}
          {!completado && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-amber-900">
                  <Clock className="h-4 w-4" />
                  Você ainda não finalizou o diagnóstico
                </CardTitle>
                <CardDescription className="text-amber-900/80">
                  A IA gerou um resultado parcial com base no que você já respondeu.
                  Termine de preencher pra receber um plano personalizado completo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setEditing(true)}
                  className="bg-brand-strong text-brand-cream hover:bg-brand-strong/90"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Continuar de onde parei
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Insight da IA (o resultado do diagnóstico) */}
          <InsightIA formulario={formulario} onInsightGerado={refetch} />
        </div>
      )}

      {/* CASO 3: Sem dados ainda (estado vazio explícito) — só cai aqui se
          algo travou no wizard antes de salvar. Mostra CTA pra começar. */}
      {!mostrarWizard && !temAlgumDado && !isLoading && (
        <Card className="bg-brand-cream-soft border-brand-hairline">
          <CardContent className="py-12 text-center">
            <div className="h-14 w-14 rounded-2xl bg-brand-strong/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-brand-strong" />
            </div>
            <h3 className="font-serif-display text-2xl text-foreground mb-2">
              Vamos começar seu diagnóstico
            </h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
              Responda algumas perguntas pra nossa IA montar um plano de
              aprendizado personalizado pra você.
            </p>
            <Button
              onClick={() => setEditing(true)}
              size="lg"
              className="bg-brand-strong text-brand-cream hover:bg-brand-strong/90"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Iniciar diagnóstico
            </Button>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
