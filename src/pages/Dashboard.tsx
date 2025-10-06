import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NovidadesSemana } from "@/components/dashboard/NovidadesSemana";
import { UltimosConteudos } from "@/components/dashboard/UltimosConteudos";

export default function Dashboard() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      navigate('/chat', { state: { initialMessage: question } });
    }
  };

  const handleQuickQuestion = (q: string) => {
    navigate('/chat', { state: { initialMessage: q } });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-8">
        {/* Novidades da Semana */}
        <section>
          <NovidadesSemana />
        </section>

        {/* Últimos Conteúdos Adicionados */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">🆕 Últimos Conteúdos Adicionados</h2>
          <UltimosConteudos />
        </section>

        {/* Ask IA Aplicada */}
        <section className="flex items-center justify-center py-12">
          <div className="w-full max-w-3xl px-6">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-5xl font-bold mb-4">
                Ask <span className="text-accent">IAplicada</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Sua assistente inteligente para todas as dúvidas sobre os cursos
              </p>
            </div>
            
            {/* Input com gradiente */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent/30 to-primary/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-card border-2 border-accent/30 rounded-2xl p-2 shadow-2xl">
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-3 bg-background rounded-xl px-5 py-4">
                    <MessageSquare className="h-5 w-5 text-accent flex-shrink-0" />
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask IAplicada..."
                      className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-lg"
                    />
                  </div>
                  <Button 
                    type="submit"
                    size="lg"
                    disabled={!question.trim()}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 rounded-xl glow-accent transition-all"
                  >
                    <Sparkles className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </div>

            {/* Sugestões rápidas */}
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Button variant="outline" size="sm" onClick={() => handleQuickQuestion("Como funciona a plataforma?")}>
                Como funciona a plataforma?
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickQuestion("Quais cursos disponíveis?")}>
                Quais cursos disponíveis?
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickQuestion("Como usar as ferramentas de IA?")}>
                Como usar as ferramentas de IA?
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}