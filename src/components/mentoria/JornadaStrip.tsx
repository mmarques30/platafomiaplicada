import { Check } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffectivePlan } from "@/hooks/useUserPlan";
import { useBusinessUserId } from "@/hooks/useBusinessUserId";
import { useContratosBusiness } from "@/hooks/useContratosBusiness";
import { useEtapasBusiness } from "@/hooks/useEtapasBusiness";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { useProgressoCertificados } from "@/hooks/useProgressoCertificados";
import { useProgressoGeral } from "@/hooks/useEvolucao";
import { cn } from "@/lib/utils";

type StageStatus = "concluido" | "atual" | "proximo";

interface Stage {
  label: string;
  status: StageStatus;
}

function useBusinessStages(): Stage[] | null {
  const businessUserId = useBusinessUserId();
  const { contrato } = useContratosBusiness(businessUserId);
  const { data: etapas } = useEtapasBusiness(contrato?.id);

  if (!etapas || etapas.length === 0) return null;

  return etapas.map((e) => ({
    label: e.titulo,
    status:
      e.status === "concluida"
        ? "concluido"
        : e.status === "em_andamento"
        ? "atual"
        : "proximo",
  }));
}

function useAcademyStages(): Stage[] {
  const { formulario } = useMentoriaForm();
  const { data: trilhasProgresso } = useProgressoCertificados();
  const { data: progressoGeral } = useProgressoGeral();

  const diagCompleto = formulario?.completado === true;
  const temTrilhaIniciada = (trilhasProgresso?.length ?? 0) > 0;
  const temCertificado = (progressoGeral?.trilhasConcluidas ?? 0) > 0;

  // Derive sequential status
  const raw = [diagCompleto, temTrilhaIniciada, temCertificado, temCertificado];
  let foundCurrent = false;

  return ["Diagnóstico", "Trilhas", "Evolução", "Certificado"].map((label, i) => {
    if (raw[i]) {
      return { label, status: "concluido" as StageStatus };
    }
    if (!foundCurrent) {
      foundCurrent = true;
      return { label, status: "atual" as StageStatus };
    }
    return { label, status: "proximo" as StageStatus };
  });
}

function StageCircle({ index, status }: { index: number; status: StageStatus }) {
  const base = "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 shrink-0";

  if (status === "concluido") {
    return (
      <div className={cn(base, "bg-[#EAF3DE] dark:bg-[#173404] border-[#AFC040]")}>
        <Check className="w-4 h-4 text-[#AFC040]" />
      </div>
    );
  }

  if (status === "atual") {
    return (
      <div className={cn(base, "bg-[#AFC040] border-[#AFC040] text-[#0C0F0A]")}>
        {index + 1}
      </div>
    );
  }

  return (
    <div className={cn(base, "bg-secondary border-muted text-muted-foreground")}>
      {index + 1}
    </div>
  );
}

function Connector({ prevStatus }: { prevStatus: StageStatus }) {
  return (
    <div
      className={cn(
        "h-0.5 flex-1 min-w-4",
        prevStatus === "concluido" ? "bg-[#AFC040]" : "bg-border"
      )}
    />
  );
}

export function JornadaStrip() {
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { isBusiness, isSkills, isVisitante } = useEffectivePlan(isAdmin, roleLoading);

  const businessStages = useBusinessStages();
  const academyStages = useAcademyStages();

  // Skills / Visitante: don't render
  if (isSkills || isVisitante) return null;

  const stages = isBusiness ? businessStages : academyStages;

  // Business without stages: don't render
  if (!stages || stages.length === 0) return null;

  return (
    <div className="flex items-center gap-0 overflow-x-auto py-2 mb-4">
      {stages.map((stage, i) => (
        <div key={i} className="flex items-center flex-1 min-w-0">
          <div className="flex flex-col items-center gap-1">
            <StageCircle index={i} status={stage.status} />
            <span
              className={cn(
                "text-[10px] sm:text-xs text-center whitespace-nowrap",
                stage.status === "atual"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {stage.label}
            </span>
          </div>
          {i < stages.length - 1 && <Connector prevStatus={stage.status} />}
        </div>
      ))}
    </div>
  );
}
