import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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
  const top3 = ranking?.slice(0, 3) || [];
  const outros = ranking?.slice(3) || [];
  const minhaposicao = ranking?.find(r => r.user_id === user?.id);

  const getMedalIcon = (posicao: number) => {
    if (posicao === 1) return <Trophy className="h-8 w-8 text-yellow-500" />;
    if (posicao === 2) return <Medal className="h-7 w-7 text-gray-400" />;
    if (posicao === 3) return <Medal className="h-6 w-6 text-orange-600" />;
    return null;
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  };

  return (
    <Card className="border-aplicada-green-900/20">
      <CardHeader>
        <CardTitle className="text-2xl">
          Ranking da Comunidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top 3 - Pódio */}
        {top3.length > 0 && (
          <div className="flex items-end justify-center gap-4 pb-6 border-b border-aplicada-green-900/20">
            {/* 2º Lugar */}
            {top3[1] && (
              <div className="flex flex-col items-center flex-1">
                <div className="mb-2">{getMedalIcon(2)}</div>
                <Avatar className="h-16 w-16 border-2 border-zinc-400">
                  <AvatarImage src={top3[1].avatar_url} />
                  <AvatarFallback className="bg-zinc-800">{getInitials(top3[1].nome_completo)}</AvatarFallback>
                </Avatar>
                <p className="font-semibold text-sm mt-2 text-center line-clamp-1 text-white">
                  {top3[1].nome_completo}
                </p>
                <p className="text-xs text-zinc-500">{top3[1].total_pontos} pts</p>
              </div>
            )}
            
            {/* 1º Lugar */}
            {top3[0] && (
              <div className="flex flex-col items-center flex-1">
                <div className="mb-2">{getMedalIcon(1)}</div>
                <Avatar className="h-20 w-20 border-4 border-yellow-500">
                  <AvatarImage src={top3[0].avatar_url} />
                  <AvatarFallback className="bg-zinc-800">{getInitials(top3[0].nome_completo)}</AvatarFallback>
                </Avatar>
                <p className="font-bold text-base mt-2 text-center line-clamp-1 text-white">
                  {top3[0].nome_completo}
                </p>
                <p className="text-sm font-semibold text-primary">{top3[0].total_pontos} pts</p>
              </div>
            )}
            
            {/* 3º Lugar */}
            {top3[2] && (
              <div className="flex flex-col items-center flex-1">
                <div className="mb-2">{getMedalIcon(3)}</div>
                <Avatar className="h-14 w-14 border-2 border-orange-600">
                  <AvatarImage src={top3[2].avatar_url} />
                  <AvatarFallback className="bg-zinc-800">{getInitials(top3[2].nome_completo)}</AvatarFallback>
                </Avatar>
                <p className="font-semibold text-xs mt-2 text-center line-clamp-1 text-white">
                  {top3[2].nome_completo}
                </p>
                <p className="text-xs text-zinc-500">{top3[2].total_pontos} pts</p>
              </div>
            )}
          </div>
        )}

        {/* Lista do 4º em diante */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-zinc-400 mb-3">Demais posições</h3>
          {outros.map((item) => (
            <div
              key={item.user_id}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                item.user_id === user?.id 
                  ? 'bg-aplicada-dark border-primary/40 ring-1 ring-primary/30' 
                  : 'bg-zinc-800/30 border-aplicada-green-900/20 hover:bg-zinc-800/50 hover:border-primary/20'
              }`}
            >
              <span className="font-mono text-sm text-zinc-400 w-8">{item.posicao}º</span>
              <Avatar className="h-10 w-10 border border-aplicada-green-900/30">
                <AvatarImage src={item.avatar_url} />
                <AvatarFallback className="bg-zinc-800">{getInitials(item.nome_completo)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${item.user_id === user?.id ? 'text-primary' : 'text-white'}`}>
                  {item.nome_completo}
                  {item.user_id === user?.id && (
                    <span className="ml-2 text-xs text-primary">(Você)</span>
                  )}
                </p>
                <p className="text-xs text-zinc-500">
                  {item.total_videos_assistidos} vídeos • {item.total_ferramentas_compartilhadas} ferramentas
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg text-white">{item.total_pontos}</p>
                <p className="text-xs text-zinc-500">pontos</p>
              </div>
            </div>
          ))}
        </div>

        {/* Minha posição (se não estiver no top) */}
        {minhaposicao && minhaposicao.posicao > 10 && (
          <div className="border-t border-aplicada-green-900/20 pt-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-aplicada-dark border border-primary/40 ring-1 ring-primary/30">
              <span className="font-mono text-sm text-zinc-400 w-8">{minhaposicao.posicao}º</span>
              <Avatar className="h-10 w-10 border border-primary">
                <AvatarImage src={minhaposicao.avatar_url} />
                <AvatarFallback className="bg-zinc-800">{getInitials(minhaposicao.nome_completo)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-primary">Você - {minhaposicao.nome_completo}</p>
                <p className="text-xs text-zinc-500">Sua posição atual</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg text-white">{minhaposicao.total_pontos}</p>
                <p className="text-xs text-zinc-500">pontos</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
