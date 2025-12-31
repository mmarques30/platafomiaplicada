import { useState } from "react";
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolLogoProps {
  logoUrl?: string | null;
  toolName: string;
  linkFerramenta?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-lg",
};

export function ToolLogo({ 
  logoUrl, 
  toolName, 
  linkFerramenta, 
  size = "md",
  className 
}: ToolLogoProps) {
  const [imgError, setImgError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  // Extract domain from link for Google favicon fallback
  const getDomain = (url: string | null | undefined): string | null => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return null;
    }
  };

  const domain = getDomain(linkFerramenta);
  const fallbackUrl = domain 
    ? `https://www.google.com/s2/favicons?sz=128&domain_url=${domain}`
    : null;

  // Get initial for text fallback
  const initial = toolName?.charAt(0)?.toUpperCase() || "?";

  // Generate a consistent color based on tool name
  const getColorClass = (name: string) => {
    const colors = [
      "bg-blue-500/20 text-blue-600",
      "bg-purple-500/20 text-purple-600",
      "bg-green-500/20 text-green-600",
      "bg-orange-500/20 text-orange-600",
      "bg-pink-500/20 text-pink-600",
      "bg-cyan-500/20 text-cyan-600",
      "bg-indigo-500/20 text-indigo-600",
      "bg-teal-500/20 text-teal-600",
    ];
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const containerClass = cn(
    "rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-muted",
    sizeClasses[size],
    className
  );

  // Show text/icon fallback
  if ((imgError && fallbackError) || (imgError && !fallbackUrl)) {
    return (
      <div className={cn(containerClass, getColorClass(toolName))}>
        <span className="font-bold">{initial}</span>
      </div>
    );
  }

  // Try fallback URL (Google favicon)
  if (imgError && fallbackUrl && !fallbackError) {
    return (
      <div className={containerClass}>
        <img
          src={fallbackUrl}
          alt={toolName}
          className="w-full h-full object-contain p-1"
          onError={() => setFallbackError(true)}
        />
      </div>
    );
  }

  // Try primary logo URL
  if (logoUrl && !imgError) {
    return (
      <div className={containerClass}>
        <img
          src={logoUrl}
          alt={toolName}
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // No logo URL provided, try fallback directly
  if (!logoUrl && fallbackUrl) {
    return (
      <div className={containerClass}>
        <img
          src={fallbackUrl}
          alt={toolName}
          className="w-full h-full object-contain p-1"
          onError={() => {
            setImgError(true);
            setFallbackError(true);
          }}
        />
      </div>
    );
  }

  // Ultimate fallback: show initial
  return (
    <div className={cn(containerClass, getColorClass(toolName))}>
      <span className="font-bold">{initial}</span>
    </div>
  );
}
