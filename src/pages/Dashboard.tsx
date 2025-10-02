import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info, AlertCircle, AlertTriangle, MessageSquare, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");

  const { data: avisos } = useQuery({
    queryKey: ["avisos-ativos"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("avisos")
        .select("*")
        .eq("ativo", true)
        .or(`data_expiracao.is.null,data_expiracao.gt.${now}`)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      navigate('/chat', { state: { initialMessage: question } });
    }
  };

  const handleQuickQuestion = (q: string) => {
    navigate('/chat', { state: { initialMessage: q } });
  };

  const getAvisoIcon = (tipo: string) => {
    switch (tipo) {
      case "info":
        return <Info className="h-5 w-5" />;
      case "alerta":
        return <AlertCircle className="h-5 w-5" />;
      case "urgente":
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getAvisoVariant = (tipo: string) => {
    switch (tipo) {
      case "urgente":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-8">
        {/* Avisos */}
        {avisos && avisos.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Avisos Importantes</h2>
            <div className="space-y-3">
              {avisos.map((aviso) => (
                <Alert key={aviso.id} variant={getAvisoVariant(aviso.tipo)}>
                  {getAvisoIcon(aviso.tipo)}
                  <AlertTitle>{aviso.titulo}</AlertTitle>
                  <AlertDescription>{aviso.mensagem}</AlertDescription>
                </Alert>
              ))}
            </div>
          </section>
        )}

        {/* Ask IA Aplicada */}
        <section className="flex items-center justify-center py-16">
          <div className="w-full max-w-3xl px-6">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-5xl font-bold mb-4">
                Ask <span className="text-accent">IA Aplicada</span>
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
                      placeholder="Ask IA Aplicada..."
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