import { VideosVisitante } from "@/components/dashboard/VideosVisitante";

export default function VideosBonus() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-8">
        {/* Header */}
        <section>
          <h1 className="text-3xl md:text-4xl font-bold">Sala de Aula</h1>
        </section>

        {/* Vídeos Grid */}
        <section>
          <VideosVisitante />
        </section>
      </main>
    </div>
  );
}
