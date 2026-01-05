import { motion } from "framer-motion";

export function AnimatedLogo() {
  return (
    <motion.img
      src="/logo-3d.png?v=10"
      alt="IAplicada"
      className="absolute w-64 h-auto opacity-30 pointer-events-none"
      style={{ top: 0, left: 0 }}
      animate={{
        x: ["0%", "120%", "40%", "150%", "80%", "100%", "20%", "0%"],
        y: ["0%", "300%", "100%", "350%", "200%", "320%", "80%", "0%"],
      }}
      transition={{
        duration: 30,
        repeat: Infinity,
        ease: "linear",
      }}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
}
