import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Icon className="h-8 w-8 text-muted-foreground/50 mb-4" />
      <p className="text-[15px] font-medium text-foreground mb-1">{title}</p>
      <p className="text-[13px] text-muted-foreground text-center max-w-sm">{description}</p>
      {action && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => navigate(action.href)}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
