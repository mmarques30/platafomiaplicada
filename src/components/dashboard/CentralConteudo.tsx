import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, Globe, Lightbulb, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useConteudosDashboard, TipoConteudo } from "@/hooks/useConteudosDashboard";
import { ConteudoCard } from "./ConteudoCard";
import logo3d from "@/assets/logo-3d.png";
import { Link } from "react-router-dom";

const tabs = [
  { value: "newsletter" as TipoConteudo, label: "Newsletter", icon: Newspaper },
  { value: "noticia" as TipoConteudo, label: "Noticias IA", icon: Globe },
  { value: "dica" as TipoConteudo, label: "Dicas Praticas", icon: Lightbulb },
];

export function CentralConteudo() {
  const [activeTab, setActiveTab] = useState<TipoConteudo>("newsletter");
  const { data: conteudos, isLoading } = useConteudosDashboard(activeTab);

  return (
    <section className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-primary/30 sm:border-2 bg-gradient-to-br from-primary/10 via-card to-primary/5 shadow-lg sm:shadow-xl shadow-primary/10 dark:border-primary/40 dark:from-primary/15 dark:to-primary/5">
      {/* Background Logo 3D - hidden on mobile for performance */}
      <div className="hidden sm:flex absolute inset-0 items-center justify-center pointer-events-none overflow-hidden">
        <img 
          src={logo3d} 
          alt="" 
          className="w-[500px] h-[500px] md:w-[650px] md:h-[650px] object-contain opacity-[0.08] md:opacity-[0.12] select-none"
        />
      </div>

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 p-3 sm:p-5 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
          <div>
            <h2 className="text-base sm:text-xl md:text-2xl font-bold text-foreground">
              Central de Conteudo
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
              Fique por dentro das novidades e aplique hoje
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TipoConteudo)} className="w-full">
          <TabsList className="w-full md:w-auto grid grid-cols-3 md:inline-flex gap-0.5 sm:gap-1 bg-primary/20 dark:bg-primary/30 p-1 sm:p-1.5 rounded-lg sm:rounded-xl mb-3 sm:mb-4 md:mb-6 border border-primary/30 dark:border-primary/40">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
              >
                <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-2.5 sm:gap-4 overflow-x-auto pb-3 sm:pb-4 scrollbar-thin snap-x snap-mandatory -mx-1 px-1"
                >
                  {isLoading ? (
                    <>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="min-w-[200px] max-w-[240px] sm:min-w-[280px] sm:max-w-[320px] flex-shrink-0">
                          <div className="h-[160px] sm:h-[200px] w-full rounded-lg sm:rounded-xl bg-primary/20 animate-pulse" />
                        </div>
                      ))}
                    </>
                  ) : conteudos && conteudos.length > 0 ? (
                    conteudos.map((conteudo) => (
                      <div key={conteudo.id} className="snap-start">
                        <ConteudoCard conteudo={conteudo} />
                      </div>
                    ))
                  ) : (
                    <div className="w-full py-12 text-center">
                      <tab.icon className="w-12 h-12 mx-auto text-primary/30 mb-3" />
                      <p className="text-muted-foreground">
                        Nenhum conteudo disponivel nesta categoria
                      </p>
                    </div>
                  )}
                </motion.div>
              </TabsContent>
            ))}
          </AnimatePresence>
        </Tabs>

        {/* CTA */}
        <div className="flex justify-end mt-2">
          <Link to="/central">
            <motion.button
              whileHover={{ x: 4 }}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Ver todos os conteudos
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
}
