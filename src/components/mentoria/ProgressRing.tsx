import { getPerformanceColor } from "@/lib/chartColors";

interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  autoColor?: boolean; // Se true, usa cor baseada no valor de performance
  label: string;
  subtitle?: string;
}

export function ProgressRing({ 
  value, 
  size = 120, 
  strokeWidth = 8,
  color,
  autoColor = false,
  label,
  subtitle
}: ProgressRingProps) {
  const finalColor = autoColor ? getPerformanceColor(value) : (color || "hsl(var(--primary))");
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            fill="none"
            opacity={0.2}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={finalColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{Math.round(value)}%</span>
        </div>
      </div>
      <div className="text-center">
        <div className="font-medium text-sm">{label}</div>
        {subtitle && (
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        )}
      </div>
    </div>
  );
}
