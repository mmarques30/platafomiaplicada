import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const feedbacks = [
  { texto: "O sistema que criamos está funcionando perfeitamente!", autor: "Consultoria em IA" },
  { texto: "Reduzi 70% do tempo em relatórios com as automações.", autor: "Carlos Mendes" },
  { texto: "Pensei que o valor seria 10x mais. Com certeza vale!", autor: "Pietra Oliveira" },
  { texto: "O projeto de automação revolucionou nossa operação.", autor: "Empresa Tech" },
  { texto: "Minha primeira aula! Sensacional!", autor: "Roberto Rodrigues" },
  { texto: "A consultoria me ajudou a implementar IA na empresa toda.", autor: "Diretor de TI" },
  { texto: "Amei a sacada de economizar créditos.", autor: "Bruna Requena" },
  { texto: "O dashboard que criamos está gerando insights incríveis.", autor: "Startup X" },
  { texto: "Que maravilha! Isso vai virar rotina.", autor: "Dani Lopes" },
  { texto: "A mentoria valeu cada centavo investido.", autor: "Empreendedor" },
  { texto: "Amei o resumo automático da reunião!", autor: "Giovanna" },
  { texto: "Implementamos chatbot e atendimento melhorou 80%.", autor: "E-commerce" },
  { texto: "Arrasou! Salvou minha apresentação.", autor: "Juliana Carvalho" },
  { texto: "O workflow automatizado economiza 20h/semana.", autor: "Gestor de Projetos" },
  { texto: "Já estou aplicando no meu trabalho.", autor: "Ana Paula" },
  { texto: "Nossa equipe inteira usa as ferramentas agora.", autor: "RH Tech" },
  { texto: "Aula incrível! Parabéns pela didática.", autor: "Fernanda Costa" },
  { texto: "O sistema de análise de dados ficou perfeito.", autor: "Analista" },
  { texto: "Esse método mudou minha rotina!", autor: "Lucas Pereira" },
  { texto: "Integramos 5 ferramentas de IA no nosso processo.", autor: "Operações" },
  { texto: "Estou economizando horas toda semana.", autor: "Mariana Silva" },
  { texto: "A comunidade é sensacional!", autor: "Rafael Souza" },
  { texto: "Finalmente entendi como usar IA!", autor: "Camila Rocha" },
  { texto: "Melhor investimento que fiz esse ano.", autor: "Pedro Almeida" },
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
