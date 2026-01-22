import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AnimatedAvatarTooltipProps {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

export function AnimatedAvatarTooltip({ name, avatarUrl, size = "md" }: AnimatedAvatarTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);
  
  const rotate = useSpring(useTransform(x, [-100, 100], [-45, 45]), springConfig);
  const translateX = useSpring(useTransform(x, [-100, 100], [-50, 50]), springConfig);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const halfWidth = target.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth);
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.6 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { type: "spring", stiffness: 260, damping: 10 },
            }}
            exit={{ opacity: 0, y: 20, scale: 0.6 }}
            style={{ translateX, rotate, whiteSpace: "nowrap" }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center rounded-md bg-foreground px-3 py-1.5 text-xs shadow-xl z-50"
          >
            <div className="absolute inset-x-10 z-30 w-[20%] -bottom-px bg-gradient-to-r from-transparent via-primary to-transparent h-px" />
            <div className="absolute left-10 w-[40%] z-30 -bottom-px bg-gradient-to-r from-transparent via-primary/50 to-transparent h-px" />
            <span className="font-bold text-background relative z-30">
              {name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Avatar className={`${sizeClasses[size]} ring-2 ring-transparent group-hover:ring-primary/50 transition-all duration-200 cursor-pointer`}>
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
          {name?.charAt(0)?.toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
