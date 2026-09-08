import { Link } from "react-router-dom";
import { Award, Trophy, ClipboardList, BookOpen, ChevronRight, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ATALHOS: { to: string; label: string; hint: string; icon: LucideIcon }[] = [
  { to: "/evolucao/certificados", label: "Certificados", hint: "Emitidos e em andamento", icon: Award },
  { to: "/evolucao/conquistas", label: "Conquistas", hint: "Metas desbloqueadas", icon: Trophy },
  { to: "/meu-diagnostico", label: "Meu diagnóstico", hint: "Seu ponto de partida", icon: ClipboardList },
  { to: "/trilhas", label: "Trilhas", hint: "Explorar conteúdos", icon: BookOpen },
];

/** Acessos rápidos da visão "Meu progresso". */
export function AtalhosProgresso() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-serif-display text-2xl font-normal">
          Acesso <em className="font-serif-italic text-primary">rápido</em>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {ATALHOS.map(({ to, label, hint, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 transition-colors hover:border-primary/50"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">{label}</span>
              <span className="block truncate text-xs text-muted-foreground">{hint}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
