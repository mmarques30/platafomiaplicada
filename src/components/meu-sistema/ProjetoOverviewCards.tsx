import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { differenceInDays } from "date-fns";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjetoOverviewCardsProps {
  etapaAtualNumero: number | null;
  dataInicio: string | null;
  dataFim: string | null;
  entregasConcluidas: number;
  totalEntregas: number;
}

function CountUpValue({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionValue, value, { duration, ease: "easeOut" });
    return controls.stop;
  }, [value, duration, motionValue]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = String(v);
    });
    return unsubscribe;
  }, [rounded]);

  return <span ref={ref}>0</span>;
}

interface StatCardProps {
  title: string;
  value?: number;
  textValue?: string;
  suffix?: string;
  changeValue: string;
  changeLabel: string;
  trendType: "positive" | "negative" | "neutral";
  index: number;
}

function StatCard({ title, value, textValue, suffix, changeValue, changeLabel, trendType, index }: StatCardProps) {
  const TrendIcon = trendType === "positive" ? ArrowUpRight : trendType === "negative" ? ArrowDownRight : Minus;

  const trendStyles = {
    positive: {
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      changeColor: "text-emerald-600 dark:text-emerald-400",
    },
    negative: {
      iconBg: "bg-red-500/15",
      iconColor: "text-red-600 dark:text-red-400",
      changeColor: "text-red-600 dark:text-red-400",
    },
    neutral: {
      iconBg: "bg-muted",
      iconColor: "text-muted-foreground",
      changeColor: "text-muted-foreground",
    },
  }[trendType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: "easeOut" }}
    >
      <Card className="rounded-xl border border-border bg-card p-4 space-y-2.5">
        {/* Title */}
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70">{title}</p>

        {/* Value */}
        <div className="flex items-baseline gap-0.5">
          {textValue ? (
            <motion.span
              className="text-2xl font-bold tracking-tight text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {textValue}
            </motion.span>
          ) : (
            <span className="text-2xl font-bold tracking-tight text-foreground">
              <CountUpValue value={value ?? 0} />
            </span>
          )}
          {suffix && (
            <span className="text-lg font-semibold text-foreground/50">{suffix}</span>
          )}
        </div>

        {/* Trend badge */}
        <div className="flex items-center gap-1.5">
          <div className={cn("flex items-center justify-center w-5 h-5 rounded-full", trendStyles.iconBg)}>
            <TrendIcon className={cn("h-3 w-3", trendStyles.iconColor)} />
          </div>
          <span className={cn("text-xs font-semibold", trendStyles.changeColor)}>
            {changeValue}
          </span>
          <span className="text-[11px] text-foreground/50">{changeLabel}</span>
        </div>
      </Card>
    </motion.div>
  );
}

export function ProjetoOverviewCards({
  etapaAtualNumero,
  dataInicio,
  dataFim,
  entregasConcluidas,
  totalEntregas,
}: ProjetoOverviewCardsProps) {
  const diasDecorridos = dataInicio ? differenceInDays(new Date(), new Date(dataInicio)) : 0;
  const diasTotais = dataInicio && dataFim ? differenceInDays(new Date(dataFim), new Date(dataInicio)) : 1;
  const cronogramaPercentual = Math.min(100, Math.max(0, Math.round((diasDecorridos / diasTotais) * 100)));
  const diasRestantes = dataFim ? Math.max(0, differenceInDays(new Date(dataFim), new Date())) : 0;

  const progressoEntregas = totalEntregas > 0 ? (entregasConcluidas / totalEntregas) * 100 : 0;
  const progressoEntregasRounded = Math.round(progressoEntregas);

  let saude: { label: string; trend: "positive" | "negative" | "neutral"; changeValue: string; changeLabel: string };
  if (progressoEntregas > cronogramaPercentual + 10) {
    saude = { label: "Avançado", trend: "positive", changeValue: `+${Math.round(progressoEntregas - cronogramaPercentual)}%`, changeLabel: "à frente do cronograma" };
  } else if (progressoEntregas >= cronogramaPercentual) {
    saude = { label: "Saudável", trend: "positive", changeValue: "On track", changeLabel: "alinhado ao cronograma" };
  } else {
    saude = { label: "Em Risco", trend: "negative", changeValue: `${Math.round(progressoEntregas - cronogramaPercentual)}%`, changeLabel: "atrasado vs cronograma" };
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        index={0}
        title="Saúde do Projeto"
        textValue={saude.label}
        changeValue={saude.changeValue}
        changeLabel={saude.changeLabel}
        trendType={saude.trend}
      />
      <StatCard
        index={1}
        title="Roadmap"
        value={etapaAtualNumero ?? 0}
        suffix={etapaAtualNumero ? "ª fase" : undefined}
        changeValue={`${etapaAtualNumero ?? 0} de ${etapaAtualNumero ? etapaAtualNumero + 1 : 1}`}
        changeLabel="fase atual"
        trendType="neutral"
      />
      <StatCard
        index={2}
        title="Cronograma"
        value={cronogramaPercentual}
        suffix="%"
        changeValue={`${diasRestantes}d`}
        changeLabel="dias restantes"
        trendType={cronogramaPercentual > 80 ? "negative" : "positive"}
      />
      <StatCard
        index={3}
        title="Entregas"
        value={entregasConcluidas}
        suffix={`/${totalEntregas}`}
        changeValue={`${progressoEntregasRounded}%`}
        changeLabel="concluído"
        trendType={progressoEntregasRounded >= 50 ? "positive" : "neutral"}
      />
    </div>
  );
}
