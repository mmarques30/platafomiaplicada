import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  severity: "error" | "warning";
  onClick?: () => void;
}

export function AlertCard({ title, value, icon: Icon, severity, onClick }: AlertCardProps) {
  const isClickable = !!onClick;
  
  return (
    <Card 
      className={cn(
        "border-2 transition-all",
        severity === "error" && "border-status-danger bg-status-danger/15 dark:bg-status-danger/20",
        severity === "warning" && "border-status-warning bg-status-warning/15 dark:bg-status-warning/20",
        isClickable && "cursor-pointer hover:shadow-lg"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={cn(
              "text-sm font-medium",
              severity === "error" && "text-status-danger dark:text-status-danger",
              severity === "warning" && "text-status-warning dark:text-status-warning"
            )}>
              {title}
            </p>
            <p className={cn(
              "text-3xl font-bold mt-1",
              severity === "error" && "text-status-danger dark:text-status-danger",
              severity === "warning" && "text-status-warning dark:text-status-warning"
            )}>
              {value}
            </p>
          </div>
          <Icon className={cn(
            "h-8 w-8",
            severity === "error" && "text-status-danger dark:text-status-danger",
            severity === "warning" && "text-status-warning dark:text-status-warning"
          )} />
        </div>
      </CardContent>
    </Card>
  );
}
