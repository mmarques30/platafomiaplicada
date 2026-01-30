import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface TypewriterProps {
  text: string[];
  speed?: number;
  deleteSpeed?: number;
  delay?: number;
  loop?: boolean;
  className?: string;
  cursorClassName?: string;
}

export function Typewriter({
  text,
  speed = 100,
  deleteSpeed = 50,
  delay = 1500,
  loop = true,
  className,
  cursorClassName,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleTyping = useCallback(() => {
    const currentText = text[currentIndex];

    if (isPaused) {
      return;
    }

    if (!isDeleting) {
      // Typing
      if (displayText.length < currentText.length) {
        setDisplayText(currentText.slice(0, displayText.length + 1));
      } else {
        // Finished typing, pause before deleting
        setIsPaused(true);
        setTimeout(() => {
          setIsPaused(false);
          if (loop || currentIndex < text.length - 1) {
            setIsDeleting(true);
          }
        }, delay);
      }
    } else {
      // Deleting
      if (displayText.length > 0) {
        setDisplayText(displayText.slice(0, -1));
      } else {
        // Finished deleting, move to next text
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % text.length);
      }
    }
  }, [displayText, currentIndex, isDeleting, isPaused, text, delay, loop]);

  useEffect(() => {
    const timeout = setTimeout(
      handleTyping,
      isDeleting ? deleteSpeed : speed
    );

    return () => clearTimeout(timeout);
  }, [handleTyping, isDeleting, deleteSpeed, speed]);

  return (
    <span className={cn("inline-flex", className)}>
      <span>{displayText}</span>
      <span
        className={cn(
          "ml-1 inline-block w-[2px] h-[1em] bg-current animate-pulse",
          cursorClassName
        )}
      />
    </span>
  );
}
