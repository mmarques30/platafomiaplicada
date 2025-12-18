import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, TrendingUp, Activity, Trophy, Play, FolderOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export function EstatisticasComunidadeTab() {
  // Overview stats
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["admin-community-stats-enhanced"],
    queryFn: async () => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));

      const [
        { count: totalMembers },
        { count: activeMembers },
        { count: postsThisWeek },
        { count: totalPosts },
        { count: totalComments },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("conta_ativa", true),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("conta_ativa", true)
          .gte("ultimo_acesso", sevenDaysAgo.toISOString()),
        supabase
          .from("community_posts")
          .select("*", { count: "exact", head: true })
          .gte("created_at", weekStart.toISOString()),
        supabase
          .from("community_posts")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("community_comments")
          .select("*", { count: "exact", head: true }),
      ]);

      const engagementRate = totalMembers && totalMembers > 0 
        ? Math.round(((totalPosts || 0) + (totalComments || 0)) / totalMembers * 100) / 100
        : 0;

      return {
        totalMembers: totalMembers || 0,
        activeMembers: activeMembers || 0,
        postsThisWeek: postsThisWeek || 0,
        engagementRate,
      };
    },
  });

  // Top 5 ranking engajamento
  const { data: ranking, isLoading: loadingRanking } = useQuery({
    queryKey: ["admin-top-ranking-engajamento"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_ranking_engajamento");
      if (error) throw error;
      return (data || []).slice(0, 5);
    },
  });

  // Top 5 vídeos mais assistidos
  const { data: topVideos, isLoading: loadingVideos } = useQuery({
    queryKey: ["admin-top-videos-watched"],
    queryFn: async () => {
      const { data: progressData, error } = await supabase
        .from("progresso_videos")
        .select("video_id")
        .eq("completado", true);

      if (error) throw error;

      // Count views per video
      const viewCounts: Record<string, number> = {};
      progressData?.forEach((p) => {
        viewCounts[p.video_id] = (viewCounts[p.video_id] || 0) + 1;
      });

      // Get top 5 video IDs
      const topVideoIds = Object.entries(viewCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id]) => id);

      if (topVideoIds.length === 0) return [];

      // Fetch video details
      const { data: videos } = await supabase
        .from("videos")
        .select("id, titulo")
        .in("id", topVideoIds);

      return topVideoIds.map((id) => ({
        id,
        titulo: videos?.find((v) => v.id === id)?.titulo || "Vídeo",
        views: viewCounts[id],
      }));
    },
  });

  // Posts por categoria
  const { data: categoryStats, isLoading: loadingCategories } = useQuery({
    queryKey: ["admin-posts-by-category"],
    queryFn: async () => {
      const { data: categories } = await supabase
        .from("community_categories")
        .select("id, name, emoji")
        .eq("ativo", true)
        .order("ordem");

      const { data: posts } = await supabase
        .from("community_posts")
        .select("category_id");

      // Count posts per category
      const counts: Record<string, number> = {};
      posts?.forEach((p) => {
        if (p.category_id) {
          counts[p.category_id] = (counts[p.category_id] || 0) + 1;
        }
      });

      const maxCount = Math.max(...Object.values(counts), 1);

      return categories?.map((cat) => ({
        ...cat,
        count: counts[cat.id] || 0,
        percentage: ((counts[cat.id] || 0) / maxCount) * 100,
      })) || [];
    },
  });

  const overviewCards = [
    {
      title: "Membros Totais",
      value: stats?.totalMembers || 0,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Ativos (7 dias)",
      value: stats?.activeMembers || 0,
      icon: Activity,
      color: "text-green-500",
    },
    {
      title: "Posts esta Semana",
      value: stats?.postsThisWeek || 0,
      icon: MessageSquare,
      color: "text-purple-500",
    },
    {
      title: "Taxa Engajamento",
      value: stats?.engagementRate?.toFixed(2) || "0",
      icon: TrendingUp,
      color: "text-orange-500",
      suffix: "/ usuário",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <Skeleton className="h-7 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">
                    {card.value}
                    {card.suffix && (
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        {card.suffix}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top 5 Ranking Engajamento */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Top 5 Engajamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRanking ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : ranking && ranking.length > 0 ? (
              <div className="space-y-3">
                {ranking.map((user: any, index: number) => (
                  <div
                    key={user.user_id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                  >
                    <span className="text-sm font-bold text-muted-foreground w-5">
                      #{index + 1}
                    </span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {user.nome_completo?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.nome_completo || "Usuário"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.total_posts || 0} posts • {user.total_comentarios || 0} comentários
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      {user.total_pontos} pts
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum dado de engajamento ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Vídeos Mais Assistidos */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Play className="h-4 w-4 text-red-500" />
              Top 5 Vídeos Mais Assistidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingVideos ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : topVideos && topVideos.length > 0 ? (
              <div className="space-y-3">
                {topVideos.map((video, index) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                  >
                    <span className="text-sm font-bold text-muted-foreground w-5">
                      #{index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {video.titulo}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      {video.views} {video.views === 1 ? "view" : "views"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum vídeo assistido ainda
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Posts por Categoria */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-blue-500" />
            Posts por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCategories ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : categoryStats && categoryStats.length > 0 ? (
            <div className="space-y-4">
              {categoryStats.map((cat) => (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {cat.emoji && <span>{cat.emoji}</span>}
                      {cat.name}
                    </span>
                    <span className="font-medium text-muted-foreground">
                      {cat.count} {cat.count === 1 ? "post" : "posts"}
                    </span>
                  </div>
                  <Progress value={cat.percentage} className="h-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma categoria encontrada
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
