import { useEffect, useState } from 'react';

interface ProgressBarProps {
  value: number;
  color?: string;
  height?: number;
  label?: string;
  showValue?: boolean;
}

export function ProgressBar({
  value,
  color = 'hsl(var(--primary))',
  height = 6,
  label,
  showValue,
}: ProgressBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 80);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1">
          {label && <span className="text-sm text-muted-foreground">{label}</span>}
          {showValue && <span className="text-sm font-medium">{value}%</span>}
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden bg-border"
        style={{ height: `${height}px` }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            backgroundColor: color,
            transition: 'all 500ms ease-out',
          }}
        />
      </div>
    </div>
  );
}
