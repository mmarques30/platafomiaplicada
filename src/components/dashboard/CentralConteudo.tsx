import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, Globe, Lightbulb, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConteudosDashboard, TipoConteudo } from "@/hooks/useConteudosDashboard";
import { ConteudoCard } from "./ConteudoCard";
import { useCapasConteudo } from "@/hooks/useCapasConteudo";
import { Link } from "react-router-dom";

const tabs: { value: TipoConteudo; label: string; icon: typeof Globe }[] = [
  { value: "noticia", label: "Notícias IA", icon: Globe },
  { value: "dica", label: "Dicas práticas", icon: Lightbulb },
  { value: "newsletter", label: "Newsletter", icon: Newspaper },
];

export function CentralConteudo() {
  const [activeTab, setActiveTab] = useState<TipoConteudo>("noticia");
  const { data: conteudos, isLoading } = useConteudosDashboard(activeTab);
  useCapasConteudo(conteudos);

  return (
    <section className="rounded-2xl border border-border bg-card p-4 md:p-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TipoConteudo)} className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-3 md:mb-6 md:inline-flex md:w-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 px-3 text-xs sm:text-sm">
              <tab.icon className="h-3.5 w-3.5" />
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
                {isLoading ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-[220px] w-full animate-pulse rounded-2xl bg-muted" />
                    ))}
                  </>
                ) : conteudos && conteudos.length > 0 ? (
                  conteudos.slice(0, 5).map((conteudo) => <ConteudoCard key={conteudo.id} conteudo={conteudo} />)
                ) : (
                  <div className="col-span-full w-full py-10 text-center">
                    <tab.icon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
                    <p className="text-sm text-muted-foreground">Nenhum conteúdo disponível nesta categoria</p>
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
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Ver todos os conteúdos
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
