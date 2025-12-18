import { motion } from "framer-motion";
import logo3D from "@/assets/logo-3d.png";

export function AnimatedLogo() {
  return (
    <motion.img
      src={logo3D}
      alt=""
      className="absolute w-48 h-48 opacity-20 pointer-events-none"
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
    />
  );
}
