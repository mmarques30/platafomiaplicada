import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, Globe, Lightbulb, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useConteudosDashboard, TipoConteudo } from "@/hooks/useConteudosDashboard";
import { ConteudoCard } from "./ConteudoCard";
import logo3d from "@/assets/logo-3d.png";

const tabs = [
  { value: "newsletter" as TipoConteudo, label: "Newsletter", icon: Newspaper },
  { value: "noticia" as TipoConteudo, label: "Noticias IA", icon: Globe },
  { value: "dica" as TipoConteudo, label: "Dicas Praticas", icon: Lightbulb },
];

export function CentralConteudo() {
  const [activeTab, setActiveTab] = useState<TipoConteudo>("newsletter");
  const { data: conteudos, isLoading } = useConteudosDashboard(activeTab);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card/90 via-card/70 to-card/90 backdrop-blur-sm">
      {/* Background Logo 3D */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <img 
          src={logo3d} 
          alt="" 
          className="w-[500px] h-[500px] object-contain opacity-[0.04] blur-[1px]"
        />
      </div>

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              Central de Conteudo
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Fique por dentro das novidades e aplique hoje
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TipoConteudo)} className="w-full">
          <TabsList className="w-full md:w-auto grid grid-cols-3 md:inline-flex gap-1 bg-muted/50 p-1 rounded-xl mb-6">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2.5 transition-all"
              >
                <tab.icon className="w-4 h-4" />
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
                  className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {isLoading ? (
                    <>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="min-w-[280px] max-w-[320px] flex-shrink-0">
                          <Skeleton className="h-[200px] w-full rounded-xl" />
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
                      <tab.icon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
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
          <motion.button
            whileHover={{ x: 4 }}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
          >
            Ver todos os conteudos
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
