import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { RankingEngajamentoItem } from "@/hooks/useRankingEngajamento";
import { cn } from "@/lib/utils";

interface RankingEngajamentoProps {
  ranking: RankingEngajamentoItem[];
}

export function RankingEngajamento({ ranking }: RankingEngajamentoProps) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  
  const top3 = ranking?.slice(0, 3) || [];
  const posicoes4a10 = ranking?.slice(3, 10) || [];
  const alem10 = ranking?.slice(10) || [];
  const minhaposicao = ranking?.find(r => r.user_id === user?.id);

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  };

  const getMedalColor = (posicao: number) => {
    switch (posicao) {
      case 1: return "text-yellow-500 border-yellow-500";
      case 2: return "text-muted-foreground border-muted-foreground";
      case 3: return "text-amber-600 border-amber-600";
      default: return "text-muted-foreground border-border";
    }
  };

  const getMedalBg = (posicao: number) => {
    switch (posicao) {
      case 1: return "bg-yellow-50 dark:bg-yellow-950/20";
      case 2: return "bg-muted/30";
      case 3: return "bg-amber-50/50 dark:bg-amber-950/20";
      default: return "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Sobre a Premiação - Topo, discreta, sem ícones */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-2">Sobre a Premiação</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Todo mês, o membro mais engajado é premiado com acesso especial ou sessões de mentoria exclusivas.
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Como pontuar:</span> Criar post (20pts) • Comentar (5pts) • Dar like (2pts) • Receber like (10pts) • Dia ativo (1pt)
        </p>
      </div>

      {/* Top 3 - Com destaque */}
      {top3.length > 0 && (
        <div className="space-y-2">
          {top3.map((item) => (
            <div
              key={item.user_id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border transition-colors",
                getMedalBg(item.posicao),
                item.posicao === 1 ? "border-yellow-300 dark:border-yellow-500/30" : "border-border"
              )}
            >
              <span className={cn(
                "font-bold text-lg w-8",
                getMedalColor(item.posicao).split(' ')[0]
              )}>
                {item.posicao}º
              </span>
              <Avatar className={cn(
                "border-2",
                item.posicao === 1 ? "h-14 w-14 border-yellow-500" : "h-10 w-10",
                getMedalColor(item.posicao).split(' ')[1]
              )}>
                <AvatarImage src={item.avatar_url} />
                <AvatarFallback className={cn(
                  "text-white",
                  item.posicao === 1 ? "bg-yellow-500 text-lg" : item.posicao === 2 ? "bg-muted-foreground" : "bg-amber-600"
                )}>
                  {getInitials(item.nome_completo)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium truncate",
                  item.user_id === user?.id ? "text-primary" : "text-foreground",
                  item.posicao === 1 && "text-lg"
                )}>
                  {item.nome_completo}
                  {item.user_id === user?.id && (
                    <span className="ml-2 text-xs text-primary">(Você)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.total_posts} posts • {item.total_comentarios} comentários • {item.total_likes_recebidos} likes
                </p>
              </div>
              <div className="text-right">
                <p className={cn(
                  "font-bold",
                  item.posicao === 1 ? "text-xl text-yellow-600 dark:text-yellow-500" : "text-lg text-foreground"
                )}>
                  {item.total_pontos}
                </p>
                <p className="text-xs text-muted-foreground">pts</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Posições 4-10 e além */}
      {(posicoes4a10.length > 0 || alem10.length > 0) && (
        <div className="bg-card rounded-xl overflow-hidden border border-border">
          <div className="divide-y divide-border">
            {/* Posições 4 a 10 */}
            {posicoes4a10.map((item) => (
              <div
                key={item.user_id}
                className={cn(
                  "flex items-center gap-3 p-4 transition-colors hover:bg-muted/50",
                  item.user_id === user?.id && "bg-primary/5"
                )}
              >
                <span className="font-mono text-sm font-semibold text-muted-foreground w-8">{item.posicao}º</span>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={item.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(item.nome_completo)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium truncate",
                    item.user_id === user?.id ? "text-primary" : "text-foreground"
                  )}>
                    {item.nome_completo}
                    {item.user_id === user?.id && (
                      <span className="ml-2 text-xs text-primary">(Você)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.total_posts} posts • {item.total_comentarios} comentários • {item.total_likes_recebidos} likes
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg text-foreground">{item.total_pontos}</p>
                  <p className="text-xs text-muted-foreground">pts</p>
                </div>
              </div>
            ))}

            {/* Posições além do 10 - mostrar quando expandido */}
            {expanded && alem10.map((item) => (
              <div
                key={item.user_id}
                className={cn(
                  "flex items-center gap-3 p-4 transition-colors hover:bg-muted/50",
                  item.user_id === user?.id && "bg-primary/5"
                )}
              >
                <span className="font-mono text-sm font-semibold text-muted-foreground w-8">{item.posicao}º</span>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={item.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(item.nome_completo)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium truncate",
                    item.user_id === user?.id ? "text-primary" : "text-foreground"
                  )}>
                    {item.nome_completo}
                    {item.user_id === user?.id && (
                      <span className="ml-2 text-xs text-primary">(Você)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.total_posts} posts • {item.total_comentarios} comentários • {item.total_likes_recebidos} likes
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg text-foreground">{item.total_pontos}</p>
                  <p className="text-xs text-muted-foreground">pts</p>
                </div>
              </div>
            ))}
          </div>
            
          {alem10.length > 0 && (
            <button 
              onClick={() => setExpanded(!expanded)}
              className="w-full p-4 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center justify-center gap-2 border-t border-border"
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", expanded && "rotate-180")} />
              {expanded ? 'Ver menos' : `Ver mais ${alem10.length} posições`}
            </button>
          )}

          {/* Minha posição (se não estiver visível no top 10) */}
          {minhaposicao && minhaposicao.posicao > 10 && !expanded && (
            <div className="border-t border-border p-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                <span className="font-mono text-sm text-muted-foreground w-8">{minhaposicao.posicao}º</span>
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarImage src={minhaposicao.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(minhaposicao.nome_completo)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-primary">Você - {minhaposicao.nome_completo}</p>
                  <p className="text-xs text-muted-foreground">Sua posição atual</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg text-foreground">{minhaposicao.total_pontos}</p>
                  <p className="text-xs text-muted-foreground">pts</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
