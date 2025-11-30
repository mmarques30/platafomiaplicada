import { UltimosConteudos } from "@/components/dashboard/UltimosConteudos";

export default function Trilhas() {

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Trilhas de Aprendizado</h1>
          <p className="text-muted-foreground">
            Vídeos organizados por trilha
          </p>
        </div>

        <UltimosConteudos />
      </main>
    </div>
  );
}