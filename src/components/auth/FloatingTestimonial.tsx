import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const feedbacks = [
  { texto: "Pensei que o valor seria 10x mais. Com certeza vale!", autor: "Pietra Oliveira" },
  { texto: "Minha primeira aula! Sensacional!", autor: "Roberto Rodrigues" },
  { texto: "Amei a sacada de economizar créditos.", autor: "Bruna Requena" },
  { texto: "Que maravilha! Isso vai virar rotina.", autor: "Dani Lopes" },
  { texto: "Quero ver mais detalhes na próxima aula!", autor: null },
  { texto: "Amei o resumo automático da reunião!", autor: "Giovanna" },
  { texto: "Arrasou! Salvou minha apresentação.", autor: "Juliana Carvalho" },
  { texto: "Que legal! Nunca tinha usado IA assim.", autor: null },
  { texto: "Reduzi o tempo de relatórios em 70%!", autor: "Carlos Mendes" },
  { texto: "Já estou aplicando no meu trabalho.", autor: "Ana Paula" },
  { texto: "Aula incrível! Parabéns pela didática.", autor: "Fernanda Costa" },
  { texto: "Esse método mudou minha rotina!", autor: "Lucas Pereira" },
  { texto: "Estou economizando horas toda semana.", autor: "Mariana Silva" },
  { texto: "A comunidade é sensacional!", autor: "Rafael Souza" },
  { texto: "Finalmente entendi como usar IA!", autor: "Camila Rocha" },
  { texto: "Melhor investimento que fiz esse ano.", autor: "Pedro Almeida" },
  { texto: "As ferramentas são muito práticas.", autor: "Isabela Santos" },
  { texto: "Recomendo para todo mundo!", autor: "Thiago Oliveira" },
  { texto: "Conteúdo de altíssima qualidade.", autor: "Amanda Lima" },
  { texto: "Já apliquei e vi resultado imediato!", autor: "Bruno Ferreira" },
  { texto: "A Mari explica de forma muito clara.", autor: "Letícia Martins" },
  { texto: "Adorei os prompts prontos!", autor: "Gustavo Ribeiro" },
  { texto: "Aprendi mais aqui do que em cursos caros.", autor: "Natália Campos" },
  { texto: "Estou impressionado com os resultados!", autor: "Ricardo Azevedo" },
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
    <div className="absolute bottom-16 left-12 max-w-md z-10">
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
            <p className="text-white/60 mt-3 text-sm">
              — {current.autor}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
