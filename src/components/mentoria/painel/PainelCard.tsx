import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { getPainelTheme } from "./painelTheme";

interface PainelCardProps {
  children: ReactNode;
  isBusiness?: boolean;
  className?: string;
  accentBorder?: boolean;
}

export const PainelCard = ({ 
  children, 
  isBusiness = false, 
  className,
  accentBorder = false 
}: PainelCardProps) => {
  const theme = getPainelTheme(isBusiness);
  
  return (
    <div
      className={cn(
        "rounded-2xl border p-6 transition-all duration-300",
        theme.cardBg,
        theme.cardBorder,
        theme.cardShadow,
        accentBorder && `border-l-4 ${theme.accentBorderColor}`,
        isBusiness && "hover:translate-y-[-1px] hover:shadow-[0_24px_70px_rgba(0,0,0,0.5)]",
        className
      )}
    >
      {children}
    </div>
  );
};

interface PainelCardHeaderProps {
  title: string;
  description?: string;
  isBusiness?: boolean;
  rightSlot?: ReactNode;
}

export const PainelCardHeader = ({ 
  title, 
  description, 
  isBusiness = false,
  rightSlot 
}: PainelCardHeaderProps) => {
  const theme = getPainelTheme(isBusiness);
  
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className={cn(
          "text-2xl font-bold tracking-tight",
          theme.textPrimary
        )}>
          {title}
        </h2>
        {description && (
          <p className={cn("mt-1", theme.textMuted)}>
            {description}
          </p>
        )}
      </div>
      {rightSlot && (
        <div className="flex-shrink-0">
          {rightSlot}
        </div>
      )}
    </div>
  );
};

interface PainelSeparatorProps {
  isBusiness?: boolean;
  className?: string;
}

export const PainelSeparator = ({ isBusiness = false, className }: PainelSeparatorProps) => {
  const theme = getPainelTheme(isBusiness);
  
  return (
    <div className={cn(theme.separator, "my-6", className)} />
  );
};
