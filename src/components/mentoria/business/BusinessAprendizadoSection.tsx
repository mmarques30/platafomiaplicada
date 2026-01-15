import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BusinessAprendizadoSectionProps {
  tamanhoEquipe?: number;
  temInteresseAprendizado?: boolean;
}

export function BusinessAprendizadoSection({ 
  tamanhoEquipe,
  temInteresseAprendizado = true
}: BusinessAprendizadoSectionProps) {
  const navigate = useNavigate();

  if (!temInteresseAprendizado) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Card - Quer Aprender? */}
      <Card className="bg-gradient-to-br from-aplicada-dark/80 to-slate-900 border-aplicada-green-700/20 overflow-hidden relative group hover:border-aplicada-green-700/40 transition-colors">
        <div className="absolute top-0 right-0 w-32 h-32 bg-aplicada-green-700/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-aplicada-green-700/20 flex items-center justify-center shrink-0">
              <GraduationCap className="h-6 w-6 text-aplicada-green-600" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-100 mb-2">
                Quer aprender também?
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Sua trilha de aprendizado personalizada está disponível. 
                Aprenda IA no seu ritmo com conteúdo exclusivo.
              </p>
              
              <Button 
                onClick={() => navigate('/trilhas')}
                className="bg-aplicada-green-700 hover:bg-aplicada-green-800 text-white group"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Acessar Trilha Academy
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card - Capacitar Equipe */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-white/10 overflow-hidden relative group hover:border-white/20 transition-colors">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-100 mb-2">
                Quer capacitar sua equipe?
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                {tamanhoEquipe 
                  ? `Plano de capacitação para sua equipe de ${tamanhoEquipe} pessoas.`
                  : 'Treinamento personalizado para toda sua equipe em IA.'}
                {' '}Aumente a produtividade do time.
              </p>
              
              <Button 
                variant="outline"
                onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Tenho interesse em capacitar minha equipe em IA.', '_blank')}
                className="border-white/20 text-slate-200 hover:bg-white/10 hover:border-white/30"
              >
                <Users className="h-4 w-4 mr-2" />
                Ver Plano de Capacitação
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
