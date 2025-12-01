import { VideosVisitante } from "@/components/dashboard/VideosVisitante";

export default function VideosBonus() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-8">
        {/* Hero Section */}
        <section>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5 border-2 border-primary/10 p-6 md:p-8 shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Vídeos Bônus</h1>
              <p className="text-muted-foreground text-lg">
                Conteúdos exclusivos liberados especialmente para você
              </p>
            </div>
          </div>
        </section>

        {/* Vídeos Grid */}
        <section>
          <VideosVisitante />
        </section>
      </main>
    </div>
  );
}
