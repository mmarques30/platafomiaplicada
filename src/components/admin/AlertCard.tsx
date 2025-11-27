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
        severity === "error" && "border-red-500 bg-red-50 dark:bg-red-950/20",
        severity === "warning" && "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
        isClickable && "cursor-pointer hover:shadow-lg"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={cn(
              "text-sm font-medium",
              severity === "error" && "text-red-700 dark:text-red-400",
              severity === "warning" && "text-yellow-700 dark:text-yellow-400"
            )}>
              {title}
            </p>
            <p className={cn(
              "text-3xl font-bold mt-1",
              severity === "error" && "text-red-900 dark:text-red-300",
              severity === "warning" && "text-yellow-900 dark:text-yellow-300"
            )}>
              {value}
            </p>
          </div>
          <Icon className={cn(
            "h-8 w-8",
            severity === "error" && "text-red-600 dark:text-red-400",
            severity === "warning" && "text-yellow-600 dark:text-yellow-400"
          )} />
        </div>
      </CardContent>
    </Card>
  );
}
