import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LensProps {
  children: React.ReactNode;
  zoomFactor?: number;
  lensSize?: number;
  className?: string;
}

export function Lens({ children, zoomFactor = 1.5, lensSize = 170, className }: LensProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      {children}
      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ opacity: 0, scale: 0.58 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute pointer-events-none rounded-full border-2 border-white/60 shadow-2xl z-50"
            style={{
              width: lensSize,
              height: lensSize,
              left: mousePosition.x - lensSize / 2,
              top: mousePosition.y - lensSize / 2,
              overflow: "hidden",
            }}
          >
            <div
              className="absolute"
              style={{
                width: containerRef.current?.offsetWidth,
                height: containerRef.current?.offsetHeight,
                left: -(mousePosition.x * zoomFactor - lensSize / 2),
                top: -(mousePosition.y * zoomFactor - lensSize / 2),
                transform: `scale(${zoomFactor})`,
                transformOrigin: "0 0",
              }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
