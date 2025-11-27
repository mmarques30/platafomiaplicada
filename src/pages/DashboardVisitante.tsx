import { useUserProfile } from "@/hooks/useUserProfile";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Users, ArrowRight, GraduationCap } from "lucide-react";

export default function DashboardVisitante() {
  const { profile } = useUserProfile();
  const firstName = profile?.nome_completo?.split(' ')[0] || 'Visitante';

  return (
    <div className="container max-w-6xl mx-auto p-8 space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 border border-primary/20">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Bem-vindo, {firstName}!
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Você está explorando a plataforma IAplicada como visitante. Conheça nosso conteúdo e comunidade!
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to="/trilhas">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Explorar Academy
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/comunidade">
                  <Users className="h-5 w-5 mr-2" />
                  Ver Comunidade
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Trilhas Disponíveis */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Trilhas Disponíveis</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Introdução à IA
              </CardTitle>
              <CardDescription>
                Aprenda os fundamentos de Inteligência Artificial aplicada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="ghost" className="w-full justify-between">
                <Link to="/trilhas">
                  Ver trilha completa
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Comunidade
              </CardTitle>
              <CardDescription>
                Conecte-se com outros profissionais aplicando IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="ghost" className="w-full justify-between">
                <Link to="/comunidade">
                  Acessar comunidade
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Upgrade */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/30">
        <CardHeader>
          <CardTitle className="text-2xl">Quer ir além?</CardTitle>
          <CardDescription className="text-base">
            Torne-se um Aplicado e tenha acesso completo a todas as trilhas, mentorias e ferramentas exclusivas da plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link to="/ecossistema">
              Conhecer os planos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
