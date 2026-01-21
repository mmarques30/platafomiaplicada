import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function RatingStars({ rating, size = "md", interactive = false, onRatingChange }: RatingStarsProps) {
  const sizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const handleClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((index) => {
        const filled = index < Math.floor(rating);
        const partial = index === Math.floor(rating) && rating % 1 > 0;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(index)}
            className={cn(
              "relative",
              interactive && "cursor-pointer hover:scale-110 transition-transform",
              !interactive && "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizes[size],
                filled
                  ? "fill-primary text-primary"
                  : "text-muted-foreground/30"
              )}
            />
            {partial && (
              <Star
                className={cn(
                  sizes[size],
                  "absolute inset-0 fill-primary text-primary"
                )}
                style={{
                  clipPath: `inset(0 ${100 - (rating % 1) * 100}% 0 0)`,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
