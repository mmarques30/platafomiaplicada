import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, Lightbulb, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useConteudosDashboard, type TipoConteudo } from "@/hooks/useConteudosDashboard";
import { ConteudoCard } from "@/components/dashboard/ConteudoCard";

const tabs = [
  { value: 'newsletter' as TipoConteudo, label: 'Newsletter', icon: Newspaper },
  { value: 'noticia' as TipoConteudo, label: 'Notícias IA', icon: FileText },
  { value: 'dica' as TipoConteudo, label: 'Dicas Práticas', icon: Lightbulb },
];

export function FreeCentralConteudo() {
  const [activeTab, setActiveTab] = useState<TipoConteudo>('newsletter');
  const { data: conteudos, isLoading } = useConteudosDashboard(activeTab, true); // true = apenas gratuitos

  return (
    <section className="mb-8">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Central de Conteúdo</h2>
        <p className="text-sm text-muted-foreground">
          Fique por dentro das novidades e aplique hoje
        </p>
      </div>

      {/* Card Container */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as TipoConteudo)}
          className="w-full"
        >
          {/* Tabs Header */}
          <div className="border-b px-4 pt-4">
            <TabsList className="w-full md:w-auto grid grid-cols-3 md:inline-flex gap-0.5 sm:gap-1 bg-primary/20 dark:bg-primary/30 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-primary/30 dark:border-primary/40">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center justify-center gap-1 sm:gap-2 text-foreground/70 data-[state=active]:bg-[#0D0D0D] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm"
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="h-32 rounded-lg" />
                        ))}
                      </div>
                    ) : conteudos && conteudos.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {conteudos.slice(0, 4).map((conteudo) => (
                          <ConteudoCard key={conteudo.id} conteudo={conteudo} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Nenhum conteúdo disponível nesta categoria.</p>
                      </div>
                    )}
                  </motion.div>
                </TabsContent>
              ))}
            </AnimatePresence>
          </div>
        </Tabs>
      </div>
    </section>
  );
}
