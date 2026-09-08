import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

interface RankingItem {
  user_id: string;
  nome_completo: string;
  avatar_url: string;
  total_pontos: number;
  posicao: number;
  total_videos_assistidos: number;
  total_comentarios: number;
  total_ferramentas_compartilhadas: number;
  total_projetos_entregues: number;
}

interface RankingComunidadeProps {
  ranking: RankingItem[];
}

export function RankingComunidade({ ranking }: RankingComunidadeProps) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const top3 = ranking?.slice(0, 3) || [];
  const outros = ranking?.slice(3) || [];
  const outrosVisiveis = expanded ? outros : outros.slice(0, 7);
  const temMais = outros.length > 7;
  const minhaposicao = ranking?.find((r) => r.user_id === user?.id);

  const getInitials = (name: string) => {
    return name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  };

  const Linha = ({ item, destaque }: { item: RankingItem; destaque?: boolean }) => {
    const souEu = item.user_id === user?.id;
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors sm:p-4",
          souEu || destaque ? "border-primary/60" : "border-border hover:border-primary/40"
        )}
      >
        <span className="w-8 text-sm font-semibold tabular-nums text-muted-foreground">{item.posicao}º</span>
        <Avatar className="h-10 w-10 border border-border">
          <AvatarImage src={item.avatar_url} />
          <AvatarFallback className="bg-muted text-foreground">{getInitials(item.nome_completo)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className={cn("truncate font-medium", souEu ? "text-primary" : "text-foreground")}>
            {item.nome_completo}
            {souEu && <span className="ml-2 text-xs font-normal text-primary">(você)</span>}
          </p>
          <p className="text-xs text-muted-foreground">
            {item.total_videos_assistidos} vídeos · {item.total_ferramentas_compartilhadas} ferramentas
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold leading-none text-foreground">{item.total_pontos?.toLocaleString() || 0}</p>
          <p className="mt-1 text-xs text-muted-foreground">pontos</p>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-serif-display text-2xl font-normal">
          Ranking da <em className="font-serif-italic text-primary">comunidade</em>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top 3 - Pódio */}
        {top3.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {top3.map((item, index) => {
              const posicao = index + 1;
              return (
                <div
                  key={item.user_id}
                  className={cn(
                    "rounded-xl border bg-card p-3 text-center sm:p-4",
                    posicao === 1 ? "border-primary/60" : "border-border"
                  )}
                >
                  <div className="relative mx-auto w-fit">
                    <Avatar className={cn("h-14 w-14 border-2 sm:h-16 sm:w-16", posicao === 1 ? "border-primary" : "border-border")}>
                      <AvatarImage src={item.avatar_url || undefined} />
                      <AvatarFallback className="bg-muted text-foreground">{getInitials(item.nome_completo)}</AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
                        posicao === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      )}
                    >
                      {posicao === 1 ? <Trophy className="h-3.5 w-3.5" /> : posicao}
                    </span>
                  </div>
                  <p className="mt-3 truncate text-sm font-semibold text-foreground">{item.nome_completo}</p>
                  <p className="text-xs font-medium text-primary">{item.total_pontos?.toLocaleString() || 0} pontos</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Lista do 4º em diante */}
        {outrosVisiveis.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Demais posições</p>
            {outrosVisiveis.map((item) => (
              <Linha key={item.user_id} item={item} />
            ))}

            {temMais && (
              <Button
                variant="ghost"
                onClick={() => setExpanded(!expanded)}
                className="mt-2 w-full rounded-full text-muted-foreground hover:text-foreground"
              >
                <ChevronDown className={cn("mr-2 h-4 w-4 transition-transform duration-200", expanded && "rotate-180")} />
                {expanded ? "Ver menos" : `Ver mais ${outros.length - 7} posições`}
              </Button>
            )}
          </div>
        )}

        {/* Minha posição (se não estiver visível) */}
        {minhaposicao && minhaposicao.posicao > 10 && !expanded && (
          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Sua posição</p>
            <Linha item={minhaposicao} destaque />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
