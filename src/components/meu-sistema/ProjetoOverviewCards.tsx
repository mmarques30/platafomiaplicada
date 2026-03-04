import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { differenceInDays } from "date-fns";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
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
  trendLabel: string;
  trendType: "positive" | "negative" | "neutral";
  index: number;
}

function StatCard({ title, value, textValue, suffix, trendLabel, trendType, index }: StatCardProps) {
  const trendColor = {
    positive: "text-[hsl(var(--chart-3))]",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  }[trendType];

  const TrendIcon = trendType === "positive" ? TrendingUp : trendType === "negative" ? TrendingDown : ArrowRight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="border border-border rounded-xl p-5 space-y-3 hover:shadow-md transition-shadow">
        <div className="flex items-baseline gap-1">
          {textValue ? (
            <motion.span
              className="text-3xl font-bold text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {textValue}
            </motion.span>
          ) : (
            <span className="text-3xl font-bold text-foreground">
              <CountUpValue value={value ?? 0} />
            </span>
          )}
          {suffix && (
            <span className="text-xl font-semibold text-muted-foreground">{suffix}</span>
          )}
        </div>

        <p className="text-sm font-medium text-muted-foreground">{title}</p>

        <div className={cn("flex items-center gap-1.5 text-xs font-medium", trendColor)}>
          <TrendIcon className="h-3.5 w-3.5" />
          <span>{trendLabel}</span>
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

  let saude: { label: string; trend: "positive" | "negative" | "neutral"; trendLabel: string };
  if (progressoEntregas > cronogramaPercentual + 10) {
    saude = { label: "Avançado", trend: "positive", trendLabel: "Entregas à frente do cronograma" };
  } else if (progressoEntregas >= cronogramaPercentual) {
    saude = { label: "Saudável", trend: "positive", trendLabel: "Entregas alinhadas ao cronograma" };
  } else {
    saude = { label: "Em Risco", trend: "negative", trendLabel: "Entregas atrasadas vs cronograma" };
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        index={0}
        title="Saúde do Projeto"
        textValue={saude.label}
        trendLabel={saude.trendLabel}
        trendType={saude.trend}
      />
      <StatCard
        index={1}
        title="Roadmap"
        value={etapaAtualNumero ?? 0}
        suffix={etapaAtualNumero ? "ª fase" : undefined}
        trendLabel="Fase atual em andamento"
        trendType="neutral"
      />
      <StatCard
        index={2}
        title="Cronograma"
        value={cronogramaPercentual}
        suffix="%"
        trendLabel={`${diasRestantes} dias restantes`}
        trendType={cronogramaPercentual > 80 ? "negative" : "positive"}
      />
      <StatCard
        index={3}
        title="Entregas"
        value={entregasConcluidas}
        suffix={`/${totalEntregas}`}
        trendLabel={`${progressoEntregasRounded}% concluído`}
        trendType={progressoEntregasRounded >= 50 ? "positive" : "neutral"}
      />
    </div>
  );
}
