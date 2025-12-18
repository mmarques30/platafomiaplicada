import { useNavigate } from "react-router-dom";
import { useUsers } from "@/hooks/admin/useUsers";
import { useMentoriaBonus } from "@/hooks/useMentoriaBonus";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, GraduationCap, Crown, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MentoriaIndex() {
  const navigate = useNavigate();
  const { data: users = [] } = useUsers();
  const { bonus: bonusGlobais } = useMentoriaBonus();

  // Filtrar usuários por plano
  const usersAcademy = users.filter(u => u.plano_mentoria === "academy");
  const usersClub = users.filter(u => u.plano_mentoria === "club");
  const usersLab = users.filter(u => u.plano_mentoria === "lab");
  const usersBoost = users.filter(u => u.plano_mentoria === "boost");
  const usersLegacy = users.filter(u => u.plano_mentoria === "legacy");

  const cards = [
    {
      title: "Bônus Globais",
      description: "Gerencie bônus disponíveis para todos os mentorados",
      icon: Gift,
      count: bonusGlobais?.filter(b => b.publico_alvo === "todos").length || 0,
      countLabel: "bônus cadastrados",
      path: "/admin/mentoria/bonus",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Mentoria Academy",
      description: "Mentorados do plano Academy - acesso a trilhas e conteúdos",
      icon: GraduationCap,
      count: usersAcademy.length,
      countLabel: "mentorados",
      path: "/admin/mentoria/academy",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Mentoria Club",
      description: "Mentorados do plano Club - mentoria 1:1 completa",
      icon: Crown,
      count: usersClub.length,
      countLabel: "mentorados",
      path: "/admin/mentoria/club",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gerenciar Mentoria</h1>
        <p className="text-muted-foreground">
          Visão geral e acesso rápido às áreas de mentoria
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mentorados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              usuários ativos na plataforma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Academy</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersAcademy.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Club</CardTitle>
            <Crown className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersClub.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersLab.length + usersBoost.length + usersLegacy.length}</div>
            <p className="text-xs text-muted-foreground">Lab, Boost, Legacy</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card 
              key={card.path} 
              className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
              onClick={() => navigate(card.path)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-bold">{card.count}</span>
                    <span className="text-sm text-muted-foreground ml-2">{card.countLabel}</span>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
