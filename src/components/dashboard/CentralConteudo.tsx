import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, Globe, Lightbulb, ArrowRight, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConteudosDashboard, TipoConteudo } from "@/hooks/useConteudosDashboard";
import { useMateriaisGratuitos } from "@/hooks/useMateriaisGratuitos";
import { ConteudoCard } from "./ConteudoCard";
import { MaterialCard } from "./MaterialCard";
import { Link } from "react-router-dom";

type TabValue = TipoConteudo | "material";

const tabs = [
  { value: "noticia" as TabValue, label: "Noticias IA", icon: Globe },
  { value: "dica" as TabValue, label: "Dicas Praticas", icon: Lightbulb },
  { value: "material" as TabValue, label: "Materiais Gratuitos", icon: FileText },
  { value: "newsletter" as TabValue, label: "Newsletter", icon: Newspaper },
];

export function CentralConteudo() {
  const [activeTab, setActiveTab] = useState<TabValue>("noticia");
  const { data: conteudos, isLoading } = useConteudosDashboard(activeTab !== "material" ? activeTab as TipoConteudo : "newsletter");
  const { data: materiais, isLoading: isLoadingMateriais } = useMateriaisGratuitos(10);

  return (
    <section className="rounded-xl border border-brand-hairline bg-card p-4 md:p-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="w-full">
        <TabsList className="w-full md:w-auto grid grid-cols-4 md:inline-flex gap-1 bg-brand-cream-soft border border-brand-hairline p-1 rounded-lg mb-4 md:mb-6">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center justify-center gap-1.5 text-foreground/70 data-[state=active]:bg-brand-strong data-[state=active]:text-brand-strong-foreground rounded-md px-3 py-1.5 transition-colors text-xs sm:text-sm"
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <AnimatePresence mode="wait">
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="flex gap-3 md:gap-4 overflow-x-auto pb-3 scrollbar-thin snap-x snap-mandatory -mx-1 px-1"
              >
                {tab.value === "material" ? (
                  isLoadingMateriais ? (
                    <>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="min-w-[200px] max-w-[240px] sm:min-w-[280px] sm:max-w-[320px] flex-shrink-0">
                          <div className="h-[160px] sm:h-[200px] w-full rounded-lg bg-brand-hairline/40 animate-pulse" />
                        </div>
                      ))}
                    </>
                  ) : materiais && materiais.length > 0 ? (
                    materiais.map((material) => (
                      <div key={material.id} className="snap-start">
                        <MaterialCard material={material} />
                      </div>
                    ))
                  ) : (
                    <div className="w-full py-10 text-center">
                      <tab.icon className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" strokeWidth={1.5} />
                      <p className="text-sm text-muted-foreground">Nenhum material disponivel</p>
                    </div>
                  )
                ) : isLoading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="min-w-[200px] max-w-[240px] sm:min-w-[280px] sm:max-w-[320px] flex-shrink-0">
                        <div className="h-[160px] sm:h-[200px] w-full rounded-lg bg-brand-hairline/40 animate-pulse" />
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
                  <div className="w-full py-10 text-center">
                    <tab.icon className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" strokeWidth={1.5} />
                    <p className="text-sm text-muted-foreground">Nenhum conteudo disponivel nesta categoria</p>
                  </div>
                )}
              </motion.div>
            </TabsContent>
          ))}
        </AnimatePresence>
      </Tabs>

      <div className="mt-4 flex justify-end">
        <Link
          to="/central"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Ver todos os conteúdos
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
