import { motion } from "framer-motion";
import { BookOpen, Zap, Cog, Rocket, Clock, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClassificacaoIconsProps {
  classificacoes: string[];
  activeFilter: string;
  onSelect: (cls: string) => void;
}

interface IconConfig {
  icon: LucideIcon;
  label: string;
}

const ICON_MAP: Record<string, IconConfig> = {
  "Aprendizado Inicial": { icon: BookOpen, label: "Aprendizado" },
  "Produtividade": { icon: Zap, label: "Produtividade" },
  "Automação": { icon: Cog, label: "Automação" },
  "Carreira": { icon: Rocket, label: "Carreira" },
  "Rotina": { icon: Clock, label: "Rotina" },
};

const ANIMATION_VARIANTS: Record<string, any> = {
  "Aprendizado Inicial": {
    scale: [1, 1.15, 1],
    opacity: [0.85, 1, 0.85],
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
  },
  "Produtividade": {
    scale: [1, 1.2, 1],
    transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
  },
  "Automação": {
    rotate: 360,
    transition: { duration: 4, repeat: Infinity, ease: "linear" },
  },
  "Carreira": {
    y: [0, -6, 0],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
  "Rotina": {
    rotate: [0, 15, -15, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
};

export function ClassificacaoIcons({ classificacoes, activeFilter, onSelect }: ClassificacaoIconsProps) {
  const orderedKeys = ["Aprendizado Inicial", "Produtividade", "Automação", "Carreira", "Rotina"];
  const items = orderedKeys.filter((k) => classificacoes.includes(k));

  // Add any classificacoes not in the predefined map
  classificacoes.forEach((c) => {
    if (!items.includes(c)) items.push(c);
  });

  if (items.length === 0) return null;

  return (
    <div className="flex items-center justify-center gap-6 sm:gap-8 py-4 flex-wrap">
      {items.map((cls) => {
        const config = ICON_MAP[cls] || { icon: Sparkles, label: cls };
        const Icon = config.icon;
        const isActive = activeFilter === cls;
        const animVariant = ANIMATION_VARIANTS[cls] || {
          scale: [1, 1.1, 1],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        };

        return (
          <button
            key={cls}
            onClick={() => onSelect(isActive ? "todas" : cls)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl px-3 py-2 transition-all duration-200 cursor-pointer",
              "hover:bg-primary/10",
              isActive
                ? "bg-primary/15 border border-primary/30 shadow-sm"
                : "border border-transparent"
            )}
          >
            <motion.div
              animate={animVariant}
              className={cn(
                "p-2.5 rounded-full",
                isActive ? "text-primary" : "text-primary/60"
              )}
            >
              <Icon size={24} strokeWidth={1.8} />
            </motion.div>
            <span
              className={cn(
                "text-[10px] font-medium leading-tight",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {config.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
