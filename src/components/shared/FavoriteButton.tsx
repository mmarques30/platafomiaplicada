import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useIsFavorito, useToggleFavorito } from "@/hooks/useFavoritos";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  tipo: string;
  itemId: string;
  variant?: "default" | "ghost" | "icon-only";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function FavoriteButton({
  tipo,
  itemId,
  variant = "default",
  size = "md",
  showLabel = false,
  className
}: FavoriteButtonProps) {
  const isFavorito = useIsFavorito(tipo, itemId);
  const { mutate: toggleFavorito, isPending } = useToggleFavorito();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorito({ tipo, item_id: itemId });
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10"
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  if (variant === "icon-only") {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          "rounded-full backdrop-blur-sm transition-all z-10",
          sizeClasses[size],
          "flex items-center justify-center",
          isFavorito 
            ? "bg-primary/90 hover:bg-primary text-primary-foreground" 
            : "bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground",
          isPending && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <Heart 
          className={cn(
            iconSizes[size],
            "transition-all",
            isFavorito && "fill-current animate-in zoom-in-50 duration-200"
          )} 
        />
      </button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size === "sm" ? "sm" : "default"}
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "gap-2 transition-all",
        isPending && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <Heart 
        className={cn(
          iconSizes[size],
          "transition-all",
          isFavorito && "fill-current text-primary animate-in zoom-in-50 duration-200"
        )}
      />
      {showLabel && (
        <span>{isFavorito ? "Favoritado" : "Favoritar"}</span>
      )}
    </Button>
  );
}
