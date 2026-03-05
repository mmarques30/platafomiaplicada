import { useEffect, useRef, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { differenceInDays } from "date-fns";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Activity, Map, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

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

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = useMemo(() => data.map((v, i) => ({ v, i })), [data]);
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          fill={`url(#grad-${color})`}
          dot={false}
          isAnimationActive
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface StatCardProps {
  title: string;
  value?: number;
  textValue?: string;
  suffix?: string;
  changeText: string;
  trendType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  sparkData: number[];
  index: number;
}

function StatCard({ title, value, textValue, suffix, changeText, trendType, icon, sparkData, index }: StatCardProps) {
  const changeColor = {
    positive: "text-aplicada-green-500",
    negative: "text-red-400",
    neutral: "text-white/50",
  }[trendType];

  const sparkColor = {
    positive: "hsl(73, 37%, 58%)",
    negative: "#f87171",
    neutral: "hsl(73, 40%, 75%)",
  }[trendType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.09, ease: "easeOut" }}
    >
      <Card className="relative overflow-hidden rounded-xl border-0 bg-[hsl(var(--chart-4))] p-5 flex flex-col justify-between min-h-[150px]">
        {/* Header: title + icon */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white/60">{title}</p>
          <div className="text-white/30">{icon}</div>
        </div>

        {/* Value + sparkline row */}
        <div className="flex items-end justify-between mt-3 gap-3">
          <div className="flex items-baseline gap-1 min-w-0">
            {textValue ? (
              <motion.span
                className="text-2xl font-bold text-white truncate"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                {textValue}
              </motion.span>
            ) : (
              <span className="text-2xl font-bold text-white">
                <CountUpValue value={value ?? 0} />
              </span>
            )}
            {suffix && (
              <span className="text-base font-semibold text-white/50">{suffix}</span>
            )}
          </div>
          {/* Mini sparkline */}
          <div className="w-24 h-10 flex-shrink-0">
            <MiniSparkline data={sparkData} color={sparkColor} />
          </div>
        </div>

        {/* Change text */}
        <p className={cn("text-xs font-medium mt-2", changeColor)}>
          {changeText}
        </p>
      </Card>
    </motion.div>
  );
}

// Generate fake sparkline data based on a target percentage
function generateSparkData(target: number, points = 7): number[] {
  const data: number[] = [];
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    data.push(Math.max(0, Math.round(target * progress + (Math.random() - 0.5) * target * 0.3)));
  }
  return data;
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

  let saude: { label: string; trend: "positive" | "negative" | "neutral"; changeText: string };
  if (progressoEntregas > cronogramaPercentual + 10) {
    saude = { label: "Avançado", trend: "positive", changeText: `+${Math.round(progressoEntregas - cronogramaPercentual)}% à frente do cronograma` };
  } else if (progressoEntregas >= cronogramaPercentual) {
    saude = { label: "Saudável", trend: "positive", changeText: "Alinhado ao cronograma" };
  } else {
    saude = { label: "Em Risco", trend: "negative", changeText: `${Math.round(progressoEntregas - cronogramaPercentual)}% atrasado vs cronograma` };
  }

  const sparkSaude = useMemo(() => generateSparkData(progressoEntregasRounded), [progressoEntregasRounded]);
  const sparkRoadmap = useMemo(() => generateSparkData((etapaAtualNumero ?? 1) * 20), [etapaAtualNumero]);
  const sparkCronograma = useMemo(() => generateSparkData(cronogramaPercentual), [cronogramaPercentual]);
  const sparkEntregas = useMemo(() => generateSparkData(progressoEntregasRounded), [progressoEntregasRounded]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        index={0}
        title="Saúde do Projeto"
        textValue={saude.label}
        changeText={saude.changeText}
        trendType={saude.trend}
        icon={<Activity className="h-5 w-5" />}
        sparkData={sparkSaude}
      />
      <StatCard
        index={1}
        title="Roadmap"
        value={etapaAtualNumero ?? 0}
        suffix={etapaAtualNumero ? "ª fase" : undefined}
        changeText={`Fase ${etapaAtualNumero ?? 0} em andamento`}
        trendType="neutral"
        icon={<Map className="h-5 w-5" />}
        sparkData={sparkRoadmap}
      />
      <StatCard
        index={2}
        title="Cronograma"
        value={cronogramaPercentual}
        suffix="%"
        changeText={`${diasRestantes} dias restantes`}
        trendType={cronogramaPercentual > 80 ? "negative" : "positive"}
        icon={<Clock className="h-5 w-5" />}
        sparkData={sparkCronograma}
      />
      <StatCard
        index={3}
        title="Entregas"
        value={entregasConcluidas}
        suffix={`/${totalEntregas}`}
        changeText={`+${progressoEntregasRounded}% concluído`}
        trendType={progressoEntregasRounded >= 50 ? "positive" : "neutral"}
        icon={<CheckCircle2 className="h-5 w-5" />}
        sparkData={sparkEntregas}
      />
    </div>
  );
}
