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
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 md:gap-4"
              >
                {tab.value === "material" ? (
                  isLoadingMateriais ? (
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-[180px] w-full rounded-xl bg-muted animate-pulse" />
                      ))}
                    </>
                  ) : materiais && materiais.length > 0 ? (
                    materiais.slice(0, 5).map((material) => (
                      <MaterialCard key={material.id} material={material} />
                    ))
                  ) : (
                    <div className="col-span-full w-full py-10 text-center">
                      <tab.icon className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" strokeWidth={1.5} />
                      <p className="text-sm text-muted-foreground">Nenhum material disponivel</p>
                    </div>
                  )
                ) : isLoading ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-[180px] w-full rounded-xl bg-muted animate-pulse" />
                    ))}
                  </>
                ) : conteudos && conteudos.length > 0 ? (
                  conteudos.slice(0, 5).map((conteudo) => (
                    <ConteudoCard key={conteudo.id} conteudo={conteudo} />
                  ))
                ) : (
                  <div className="col-span-full w-full py-10 text-center">
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
