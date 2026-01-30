import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface DotProps {
  x: number;
  y: number;
  delay: number;
  color: string;
  opacity: number;
}

const Dot = ({ x, y, delay, color, opacity }: DotProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: opacity, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: delay,
        ease: "easeOut"
      }}
      className="absolute w-1 h-1 rounded-full"
      style={{
        left: x,
        top: y,
        backgroundColor: color,
      }}
    />
  );
};

export function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dots, setDots] = useState<DotProps[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const spacing = 30;
    const newDots: DotProps[] = [];
    
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

    for (let x = 0; x < width; x += spacing) {
      for (let y = 0; y < height; y += spacing) {
        const distance = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        
        // Delay baseado na distância do centro
        const delay = (distance / maxDistance) * 1.5 + Math.random() * 0.3;
        
        // Opacidade aleatória
        const opacityOptions = [0.15, 0.2, 0.25, 0.3, 0.35, 0.4];
        const opacity = opacityOptions[Math.floor(Math.random() * opacityOptions.length)];
        
        // Cores - verde IAplicada
        const colorOptions = [
          "rgba(158, 176, 56, 0.8)",
          "rgba(120, 140, 40, 0.8)",
          "rgba(100, 120, 35, 0.8)",
        ];
        const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];

        newDots.push({
          x: x + Math.random() * 5 - 2.5,
          y: y + Math.random() * 5 - 2.5,
          delay,
          color,
          opacity,
        });
      }
    }

    setDots(newDots);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden bg-[#0a0a0a]">
      {/* Grid de pontos animado */}
      {dots.map((dot, index) => (
        <Dot key={index} {...dot} />
      ))}
      
      {/* Fallback estático para dots */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(158, 176, 56, 0.06) 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }}
      />
      
      {/* Gradiente central sutil */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(158, 176, 56, 0.08) 0%, transparent 60%)',
        }}
      />
      
      {/* Gradiente inferior */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
    </div>
  );
}
