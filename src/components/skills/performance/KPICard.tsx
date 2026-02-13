import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: string;
  variant?: "default" | "dark" | "accent";
}

const variantStyles = {
  default: {
    card: "bg-card border-border",
    title: "text-muted-foreground",
    value: "text-foreground",
    subtitle: "text-muted-foreground",
    icon: "text-muted-foreground",
    trend: "text-[hsl(72,50%,35%)]",
  },
  dark: {
    card: "bg-[#0D0D0D] border-[#0D0D0D]",
    title: "text-white/70",
    value: "text-white",
    subtitle: "text-white/60",
    icon: "text-[#9EB038]",
    trend: "text-[#9EB038]",
  },
  accent: {
    card: "bg-[#9EB038]/15 border-[#9EB038]/30 border-l-4 border-l-[#9EB038]",
    title: "text-[#1a1a1a]",
    value: "text-[#0D0D0D]",
    subtitle: "text-[#3a3a3a]",
    icon: "text-[#6B7A20]",
    trend: "text-[#5a6a1a]",
  },
};

export default function KPICard({ title, value, subtitle, icon, trend, variant = "default" }: KPICardProps) {
  const s = variantStyles[variant];

  return (
    <Card className={cn("rounded-xl border", s.card)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <p className={cn("text-sm font-medium", s.title)}>{title}</p>
        <div className={cn(s.icon)}>{icon}</div>
      </CardHeader>
      <CardContent>
        <p className={cn("text-2xl font-bold", s.value)}>{value}</p>
        <p className={cn("text-xs mt-1", s.subtitle)}>{subtitle}</p>
        {trend && (
          <div className={cn("flex items-center gap-1 mt-2 text-xs", s.trend)}>
            <TrendingUp className="h-3 w-3" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
