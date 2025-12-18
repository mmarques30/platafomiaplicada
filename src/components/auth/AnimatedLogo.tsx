import { motion } from "framer-motion";
import logo3D from "@/assets/logo-3d.png";

export function AnimatedLogo() {
  return (
    <motion.img
      src={logo3D}
      alt=""
      className="absolute w-40 h-40 opacity-25 pointer-events-none"
      initial={{ x: "-20%", y: "10%" }}
      animate={{
        x: ["0%", "300%", "150%", "350%", "50%", "0%"],
        y: ["10%", "60%", "30%", "70%", "45%", "10%"],
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}
