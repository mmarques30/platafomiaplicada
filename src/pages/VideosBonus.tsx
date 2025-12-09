import { useState } from "react";
import { VideosVisitante } from "@/components/dashboard/VideosVisitante";
import { MateriaisGratuitosTab } from "@/components/comunidade/MateriaisGratuitosTab";
import { cn } from "@/lib/utils";

type SalaTabValue = "aula" | "materiais";

const salaTabs: { value: SalaTabValue; label: string }[] = [
  { value: "aula", label: "Aula" },
  { value: "materiais", label: "Materiais" },
];

export default function VideosBonus() {
  const [activeTab, setActiveTab] = useState<SalaTabValue>("aula");

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6">
        {/* Header */}
        <section>
          <h1 className="text-3xl md:text-4xl font-bold">Sala de Aula</h1>
        </section>

        {/* Tab Navigation - X/Twitter Style */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <nav className="flex">
            {salaTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "flex-1 py-4 px-4 text-sm font-medium transition-colors relative hover:bg-muted/50",
                  activeTab === tab.value
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                {activeTab === tab.value && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[calc(100vh-200px)]">
          {activeTab === "aula" && <VideosVisitante />}
          {activeTab === "materiais" && <MateriaisGratuitosTab />}
        </div>
      </main>
    </div>
  );
}
