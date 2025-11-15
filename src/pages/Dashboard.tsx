import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles, ArrowRight, AlertCircle, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { NovidadesSemana } from "@/components/dashboard/NovidadesSemana";
import { UltimosConteudos } from "@/components/dashboard/UltimosConteudos";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import mariAvatar from "@/assets/mari-avatar.jpg";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [mostrarAvisoSenha, setMostrarAvisoSenha] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const verificarSenhaTemporaria = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('senha_temporaria, primeiro_acesso')
        .eq('id', user.id)
        .single();

      if (profile?.senha_temporaria || profile?.primeiro_acesso) {
        setMostrarAvisoSenha(true);
      }
    };

    verificarSenhaTemporaria();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('form') && showSuggestions) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSuggestions]);

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
        {/* Aviso de senha temporária */}
        {mostrarAvisoSenha && (
          <Alert className="border-2 border-primary bg-primary/5 shadow-md">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex-1">
                <strong className="text-primary">Senha temporária detectada:</strong> Por segurança, recomendamos que você{" "}
                <Link 
                  to="/configuracoes" 
                  className="underline font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  altere sua senha em Configurações
                </Link>
                .
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-4 hover:bg-primary/10"
                onClick={() => setMostrarAvisoSenha(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Hero Section - Inspirado na LP */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5 border-2 border-primary/10 p-8 md:p-12 shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <WelcomeHeader />
          </div>
        </section>

        {/* Novidades da Semana */}
        <section>
          <NovidadesSemana />
        </section>

        {/* Chat da Mari - Tech Executive */}
        <section className="flex items-center justify-center">
          <div className="w-full max-w-4xl px-6">
            <div className="relative card-glassmorphism rounded-2xl p-3 shadow-xl border-2 border-primary/10">
              <form onSubmit={handleSubmit} autoComplete="off" role="search" className="flex items-center gap-4">
                {/* Avatar da Mari */}
                <div className="relative">
                  <img 
                    src={mariAvatar} 
                    alt="Mari" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary shadow-md flex-shrink-0"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background"></div>
                </div>
                
                {/* Input com dropdown de sugestões */}
                <div className="flex-1 relative">
                  <input
                    type="search"
                    id="mari-question"
                    name="mari-question"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="search"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-bwignore="true"
                    aria-label="Pergunte à Mari"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Pergunte à Mari..."
                    className="w-full bg-muted text-foreground rounded-xl px-5 py-3 border-none outline-none placeholder:text-muted-foreground"
                  />
                  
                  {/* Dropdown de sugestões */}
                  {showSuggestions && !question && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden z-50">
                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleQuickQuestion("Como funciona a plataforma?");
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors text-sm"
                        >
                          Como funciona a plataforma?
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleQuickQuestion("Quais cursos disponíveis?");
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors text-sm"
                        >
                          Quais cursos disponíveis?
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleQuickQuestion("Como usar as ferramentas de IA?");
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors text-sm"
                        >
                          Como usar as ferramentas de IA?
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Botão de envio */}
                <Button 
                  type="submit"
                  size="default"
                  disabled={!question.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 rounded-xl"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Últimos Conteúdos Adicionados */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Últimos Conteúdos Adicionados</h2>
          <UltimosConteudos />
        </section>
      </main>
    </div>
  );
}