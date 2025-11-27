import { CalendarioAulas } from "@/components/calendario/CalendarioAulas";

export default function Calendario() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendário de Aulas</h1>
          <p className="text-muted-foreground mt-1">
            Confira as próximas aulas semanais e seus temas
          </p>
        </div>
        
        <CalendarioAulas />
      </main>
    </div>
  );
}
