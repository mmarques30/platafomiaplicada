import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { CheckCircle2, Circle } from "lucide-react";

export function OnboardingProgressCard() {
  const { user } = useAuth();
  const { profile } = useUserProfile();

  const { data: hasOnboarding } = useQuery({
    queryKey: ["onboarding-responses", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { count } = await supabase
        .from("user_onboarding_responses")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);
      return (count ?? 0) > 0;
    },
  });

  if (!profile) return null;

  const items = [
    { label: "Nome preenchido", done: !!profile.nome_completo },
    { label: "Foto de perfil", done: !!profile.avatar_url },
    { label: "Senha personalizada", done: profile.senha_temporaria === false },
    { label: "Tour concluído", done: profile.primeiro_acesso === false },
    { label: "Perfil de onboarding", done: !!hasOnboarding },
  ];

  const doneCount = items.filter((i) => i.done).length;
  const pct = Math.round((doneCount / items.length) * 100);

  if (pct === 100) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <UserAvatar
            name={profile.nome_completo}
            avatarUrl={profile.avatar_url}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base">Complete seu perfil</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {pct}% concluído — {items.length - doneCount} {items.length - doneCount === 1 ? "passo restante" : "passos restantes"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress
          value={pct}
          className="h-2"
          indicatorClassName="transition-all duration-700 ease-out bg-primary"
        />
        <ul className="grid gap-1.5">
          {items.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm">
              {item.done ? (
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
              )}
              <span className={item.done ? "text-muted-foreground line-through" : "text-foreground"}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
