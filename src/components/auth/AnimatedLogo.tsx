import { motion } from "framer-motion";
import logo3D from "@/assets/logo-3d.png";

export function AnimatedLogo() {
  return (
    <motion.img
      src={logo3D}
      alt=""
      className="absolute w-48 h-48 opacity-20 pointer-events-none"
      initial={{ x: "0%", y: "0%" }}
      animate={{
        x: ["0%", "250%", "50%", "300%", "100%", "200%", "0%"],
        y: ["0%", "80%", "30%", "100%", "50%", "90%", "20%", "0%"],
      }}
      transition={{
        duration: 30,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}
