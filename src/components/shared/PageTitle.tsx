import { ReactNode } from "react";

interface PageTitleProps {
  primary: string;
  secondary?: string;
  icon?: ReactNode;
  className?: string;
}

export function PageTitle({ primary, secondary, icon, className = "" }: PageTitleProps) {
  return (
    <h1 className={`flex items-center gap-3 text-2xl sm:text-3xl font-bold tracking-tight ${className}`}>
      {icon}
      <span>
        <span className="relative inline-block">
          {primary}
          <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/30 rounded-full" />
        </span>
        {secondary && (
          <>
            {" "}
            <span className="text-muted-foreground font-medium">{secondary}</span>
          </>
        )}
      </span>
    </h1>
  );
}
