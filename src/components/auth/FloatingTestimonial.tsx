import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const feedbacks = [
  { texto: "Pensei que o valor seria 10x mais. Com certeza vale!", autor: "Pietra Oliveira" },
  { texto: "Minha primeira aula! Sensacional!", autor: "Roberto Rodrigues" },
  { texto: "Amei a sacada de economizar créditos.", autor: "Bruna Requena" },
  { texto: "Que maravilha! Isso vai virar rotina.", autor: "Dani Lopes" },
  { texto: "Amei o resumo automático da reunião!", autor: "Giovanna" },
  { texto: "Arrasou! Salvou minha apresentação.", autor: "Juliana Carvalho" },
  { texto: "Já estou aplicando no meu trabalho.", autor: "Ana Paula" },
  { texto: "Aula incrível! Parabéns pela didática.", autor: "Fernanda Costa" },
  { texto: "Esse método mudou minha rotina!", autor: "Lucas Pereira" },
  { texto: "Estou economizando horas toda semana.", autor: "Mariana Silva" },
  { texto: "A comunidade é sensacional!", autor: "Rafael Souza" },
  { texto: "Finalmente entendi como usar IA!", autor: "Camila Rocha" },
  { texto: "Melhor investimento que fiz esse ano.", autor: "Pedro Almeida" },
  { texto: "Nunca recebi um direcional como esse pra usar a ferramenta certa pra tarefa certa.", autor: "Carolina Mendes" },
  { texto: "Fiz um MBA de IA e aprendi só teoria, aqui eu aprendo e consigo aplicar no dia seguinte.", autor: "Thiago Barros" },
  { texto: "Meu chefe ficou assustado com o dashboard que criei depois de só uma aula!", autor: "Amanda Santana" },
  { texto: "Consegui a promoção que eu não tinha há anos. Depois da mentoria do Club, virei líder de tecnologia!", autor: "Ricardo Gomes" },
  { texto: "É muito mais que uma mentoria de IA, a Mari ajudou a minha carreira acelerar.", autor: "Patrícia Nunes" },
  { texto: "Nunca pensei que ia criar um sistema sozinha, minha cabeça está explodindo! rsrs", autor: "Beatriz Lima" },
];

export function FloatingTestimonial() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % feedbacks.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const current = feedbacks[currentIndex];

  return (
    <div className="absolute bottom-16 left-12 right-12 z-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xl text-white/90 font-light italic leading-relaxed">
            "{current.texto}"
          </p>
          {current.autor && (
            <p className="text-white/50 mt-3 text-sm">
              — {current.autor}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
