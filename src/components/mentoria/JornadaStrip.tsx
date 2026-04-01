import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type StageStatus = "concluido" | "atual" | "proximo";

export interface Estagio {
  numero: number;
  label: string;
  status: StageStatus;
}

interface JornadaStripProps {
  estagios: Estagio[];
}

function StageCircle({ numero, status }: { numero: number; status: StageStatus }) {
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
        {numero}
      </div>
    );
  }

  return (
    <div className={cn(base, "bg-secondary border-muted text-muted-foreground")}>
      {numero}
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

export function JornadaStrip({ estagios }: JornadaStripProps) {
  if (!estagios || estagios.length === 0) return null;

  return (
    <div className="flex items-center gap-0 overflow-x-auto py-2 mb-4">
      {estagios.map((estagio, i) => (
        <div key={i} className="flex items-center flex-1 min-w-0">
          <div className="flex flex-col items-center gap-1">
            <StageCircle numero={estagio.numero} status={estagio.status} />
            <span
              className={cn(
                "text-[10px] sm:text-xs text-center whitespace-nowrap",
                estagio.status === "atual"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {estagio.label}
            </span>
          </div>
          {i < estagios.length - 1 && <Connector prevStatus={estagio.status} />}
        </div>
      ))}
    </div>
  );
}
