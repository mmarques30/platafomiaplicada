import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles, AlertCircle, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { NovidadesSemana } from "@/components/dashboard/NovidadesSemana";
import { UltimosConteudos } from "@/components/dashboard/UltimosConteudos";
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
          <Alert className="border-warning bg-warning/10">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex-1">
                <strong>Senha temporária detectada:</strong> Por segurança, recomendamos que você{" "}
                <Link 
                  to="/configuracoes" 
                  className="underline font-medium hover:text-warning"
                >
                  altere sua senha em Configurações
                </Link>
                .
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-4"
                onClick={() => setMostrarAvisoSenha(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Novidades da Semana */}
        <section>
          <NovidadesSemana />
        </section>

        {/* Últimos Conteúdos Adicionados */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Últimos Conteúdos Adicionados</h2>
          <UltimosConteudos />
        </section>

        {/* Aprenda com a Mari */}
        <section className="flex items-center justify-center py-12">
          <div className="w-full max-w-3xl px-6">
            {/* Título simples centralizado */}
            <h2 className="text-3xl font-bold text-center mb-8">
              Aprenda com a <span className="text-accent">Mari</span>
            </h2>
            
            {/* Input com foto da Mari como ícone à esquerda + dropdown de sugestões */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent/30 to-primary/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-card border-2 border-accent/30 rounded-2xl p-2 shadow-2xl">
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                  {/* Avatar da Mari como ícone */}
                  <img 
                    src={mariAvatar} 
                    alt="Mari" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-accent flex-shrink-0 ml-2"
                  />
                  
                  {/* Input com dropdown de sugestões */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Pergunte à Mari..."
                      className="w-full bg-background rounded-xl px-5 py-4 border-none outline-none text-foreground placeholder:text-muted-foreground text-lg"
                    />
                    
                    {/* Dropdown de sugestões (aparece no focus) */}
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
                    size="lg"
                    disabled={!question.trim()}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 rounded-xl glow-accent transition-all"
                  >
                    <Sparkles className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}