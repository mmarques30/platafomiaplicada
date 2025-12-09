import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, ChevronDown } from "lucide-react";
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
  const minhaposicao = ranking?.find(r => r.user_id === user?.id);

  const getBorderColor = (posicao: number) => {
    if (posicao === 1) return "border-yellow-500";
    if (posicao === 2) return "border-zinc-400";
    if (posicao === 3) return "border-orange-600";
    return "border-aplicada-green-900/30";
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  };

  return (
    <Card className="border border-primary/30 bg-card">
      <CardHeader>
        <CardTitle className="text-2xl">
          Ranking da Comunidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top 3 - Pódio */}
        {top3.length > 0 && (
          <div className="grid grid-cols-3 gap-4 pb-6 border-b border-border">
            {top3.map((item, index) => {
              const posicao = index + 1;
              return (
                <div
                  key={item.user_id}
                  className={`relative p-4 rounded-lg border ${getBorderColor(posicao)} bg-card`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-16 w-16 border-2 border-background">
                        <AvatarImage src={item.avatar_url || undefined} />
                        <AvatarFallback className="bg-muted">{getInitials(item.nome_completo)}</AvatarFallback>
                      </Avatar>
                      {posicao === 1 && (
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                          <Trophy className="h-5 w-5 text-yellow-500" />
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground">{item.nome_completo}</p>
                      <p className="text-sm text-primary font-medium">
                        {item.total_pontos?.toLocaleString() || 0} pontos
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lista do 4º em diante */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground mb-3">Demais posições</h3>
          {outrosVisiveis.map((item) => (
            <div
              key={item.user_id}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                item.user_id === user?.id 
                  ? 'bg-primary/10 border-primary/40 ring-1 ring-primary/30' 
                  : 'bg-card border-border hover:bg-muted/50'
              }`}
            >
              <span className="font-mono text-sm font-semibold text-foreground w-8">{item.posicao}º</span>
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={item.avatar_url} />
                <AvatarFallback className="bg-muted">{getInitials(item.nome_completo)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${item.user_id === user?.id ? 'text-primary' : 'text-foreground'}`}>
                  {item.nome_completo}
                  {item.user_id === user?.id && (
                    <span className="ml-2 text-xs text-primary">(Você)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.total_videos_assistidos} vídeos • {item.total_ferramentas_compartilhadas} ferramentas
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg text-foreground">{item.total_pontos}</p>
                <p className="text-xs text-muted-foreground">pontos</p>
              </div>
            </div>
          ))}
          
          {temMais && (
            <Button 
              variant="ghost" 
              onClick={() => setExpanded(!expanded)}
              className="w-full mt-2 text-muted-foreground hover:text-foreground"
            >
              <ChevronDown className={`h-4 w-4 mr-2 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
              {expanded ? 'Ver menos' : `Ver mais ${outros.length - 7} posições`}
            </Button>
          )}
        </div>

        {/* Minha posição (se não estiver no top) */}
        {minhaposicao && minhaposicao.posicao > 10 && (
          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-primary/40 ring-1 ring-primary/30">
              <span className="font-mono text-sm text-muted-foreground w-8">{minhaposicao.posicao}º</span>
              <Avatar className="h-10 w-10 border border-primary">
                <AvatarImage src={minhaposicao.avatar_url} />
                <AvatarFallback className="bg-muted">{getInitials(minhaposicao.nome_completo)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-primary">Você - {minhaposicao.nome_completo}</p>
                <p className="text-xs text-muted-foreground">Sua posição atual</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg text-foreground">{minhaposicao.total_pontos}</p>
                <p className="text-xs text-muted-foreground">pontos</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
