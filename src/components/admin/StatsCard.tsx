import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  onClick?: () => void;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: number;
  };
}

export function StatsCard({ title, value, description, icon: Icon, onClick, trend }: StatsCardProps) {
  return (
    <Card 
      className={onClick ? "cursor-pointer hover:bg-accent/50 transition-colors card-interactive" : ""}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-card-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-card-foreground">{value}</div>
          {trend && trend.value > 0 && (
            <div className={`flex items-center gap-0.5 text-xs font-medium ${
              trend.direction === 'up' ? 'text-green-600' : 
              trend.direction === 'down' ? 'text-red-600' : 
              'text-muted-foreground'
            }`}>
              {trend.direction === 'up' && <TrendingUp className="h-3 w-3" />}
              {trend.direction === 'down' && <TrendingDown className="h-3 w-3" />}
              {trend.direction === 'stable' && <Minus className="h-3 w-3" />}
              {trend.value}%
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-card-foreground/60">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
