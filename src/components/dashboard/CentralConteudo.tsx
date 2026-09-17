import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConteudosCurados } from "@/hooks/useConteudosDashboard";
import { ConteudoCard } from "./ConteudoCard";
import { useCapasConteudo } from "@/hooks/useCapasConteudo";
import { GRUPOS, tipoInfo } from "@/lib/conteudoTipos";
import { Link } from "react-router-dom";

/** No dashboard mostramos só o que ensina ou muda uma decisão. */
const tabs = GRUPOS.filter((g) => g.value !== "newsletter").map((g) => ({
  ...g,
  icon: tipoInfo(g.tipos[0]).icon,
}));

export function CentralConteudo() {
  const [activeTab, setActiveTab] = useState(tabs[0].value);
  const { data: conteudos, isLoading } = useConteudosCurados(40);
  useCapasConteudo(conteudos);

  const porGrupo = useMemo(() => {
    const mapa: Record<string, typeof conteudos> = {};
    for (const grupo of GRUPOS) {
      mapa[grupo.value] = (conteudos || []).filter((c) => grupo.tipos.includes(c.tipo)).slice(0, 5);
    }
    return mapa;
  }, [conteudos]);

  /* Sem nada curado, a seção inteira sai do painel em vez de deixar uma
     caixa alta e vazia no meio da coluna. */
  const temAlgum = tabs.some((t) => porGrupo[t.value]?.length);
  if (!isLoading && !temAlgum) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-4 md:p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-3 md:mb-6 md:inline-flex md:w-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 px-3 text-xs sm:text-sm">
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
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
                      <div key={i} className="h-[240px] w-full animate-pulse rounded-2xl bg-muted" />
                    ))}
                  </>
                ) : porGrupo[tab.value]?.length ? (
                  porGrupo[tab.value]!.map((conteudo) => (
                    <ConteudoCard key={conteudo.id} conteudo={conteudo} />
                  ))
                ) : (
                  <div className="col-span-full flex items-center gap-2.5 rounded-xl border border-dashed border-border px-4 py-3">
                    <tab.icon className="h-4 w-4 shrink-0 text-muted-foreground/60" strokeWidth={1.5} />
                    <p className="text-sm text-muted-foreground">
                      Nada em {tab.label.toLowerCase()} por enquanto.
                    </p>
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
