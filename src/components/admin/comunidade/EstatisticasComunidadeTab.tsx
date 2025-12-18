import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useContentAccessMetrics } from "@/hooks/admin/useContentAccessMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, TrendingUp, Activity, Trophy, Heart, FolderOpen, Eye, Video, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export function EstatisticasComunidadeTab() {
  // Buscar IDs de visitantes para filtrar
  const { data: visitanteIds } = useQuery({
    queryKey: ["admin-visitante-ids"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("is_visitante", true)
        .eq("conta_ativa", true);
      return data?.map(v => v.id) || [];
    },
  });

  // Overview stats - APENAS VISITANTES
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["admin-community-stats-visitantes"],
    queryFn: async () => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));

      const [
        { count: totalVisitantes },
        { count: activeVisitantes },
        { count: postsThisWeek },
        { count: totalPosts },
        { count: totalComments },
      ] = await Promise.all([
        // Total de visitantes cadastrados
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("conta_ativa", true)
          .eq("is_visitante", true),
        // Visitantes ativos nos últimos 7 dias
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("conta_ativa", true)
          .eq("is_visitante", true)
          .gte("ultimo_acesso", sevenDaysAgo.toISOString()),
        // Posts da semana (comunidade geral)
        supabase
          .from("community_posts")
          .select("*", { count: "exact", head: true })
          .gte("created_at", weekStart.toISOString()),
        // Total de posts
        supabase
          .from("community_posts")
          .select("*", { count: "exact", head: true }),
        // Total de comentários
        supabase
          .from("community_comments")
          .select("*", { count: "exact", head: true }),
      ]);

      const engagementRate = totalVisitantes && totalVisitantes > 0 
        ? Math.round(((totalPosts || 0) + (totalComments || 0)) / totalVisitantes * 100) / 100
        : 0;

      return {
        totalVisitantes: totalVisitantes || 0,
        activeVisitantes: activeVisitantes || 0,
        postsThisWeek: postsThisWeek || 0,
        engagementRate,
      };
    },
  });

  // Top 5 ranking engajamento - FILTRADO POR VISITANTES
  const { data: ranking, isLoading: loadingRanking } = useQuery({
    queryKey: ["admin-top-ranking-engajamento-visitantes", visitanteIds],
    queryFn: async () => {
      if (!visitanteIds || visitanteIds.length === 0) return [];
      
      const { data, error } = await supabase.rpc("get_ranking_engajamento");
      if (error) throw error;
      
      // Filtrar apenas visitantes
      return (data || [])
        .filter((user: any) => visitanteIds.includes(user.user_id))
        .slice(0, 5);
    },
    enabled: !!visitanteIds,
  });

  // Top 5 Posts Mais Populares (substituindo vídeos)
  const { data: topPosts, isLoading: loadingPosts } = useQuery({
    queryKey: ["admin-top-posts-popular"],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from("community_posts")
        .select(`
          id,
          title,
          content,
          likes_count,
          comments_count,
          created_at,
          user_id,
          profiles:user_id (nome_completo, avatar_url)
        `)
        .order("likes_count", { ascending: false })
        .limit(5);

      if (error) throw error;
      return posts || [];
    },
  });

  // Conteúdos mais acessados por visitantes
  const { data: accessMetrics, isLoading: loadingAccess } = useContentAccessMetrics();

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
      title: "Visitantes Cadastrados",
      value: stats?.totalVisitantes || 0,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Visitantes Ativos (7 dias)",
      value: stats?.activeVisitantes || 0,
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
      suffix: "/ visitante",
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
        {/* Top 5 Ranking Engajamento - VISITANTES */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Top 5 Engajamento (Visitantes)
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
                Nenhum visitante com engajamento ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Posts Mais Populares */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              Top 5 Posts Mais Populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPosts ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : topPosts && topPosts.length > 0 ? (
              <div className="space-y-3">
                {topPosts.map((post: any, index: number) => (
                  <div
                    key={post.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                  >
                    <span className="text-sm font-bold text-muted-foreground w-5">
                      #{index + 1}
                    </span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.profiles?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {post.profiles?.nome_completo?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {post.title || post.content?.substring(0, 40) + "..."}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        por {post.profiles?.nome_completo || "Usuário"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-red-500">
                        {post.likes_count || 0} ❤️
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {post.comments_count || 0} 💬
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum post encontrado ainda
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top 5 Conteúdos Mais Acessados */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4 text-emerald-500" />
              Top 5 Conteúdos Mais Acessados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAccess ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : accessMetrics?.topContent && accessMetrics.topContent.length > 0 ? (
              <div className="space-y-3">
                {accessMetrics.topContent.slice(0, 5).map((content, index) => (
                  <div
                    key={content.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                  >
                    <span className="text-sm font-bold text-muted-foreground w-5">
                      #{index + 1}
                    </span>
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted">
                      {content.type === 'video' ? (
                        <Video className="h-4 w-4 text-purple-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {content.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {content.type === 'video' ? 'Vídeo' : 'Material'}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-500">
                      {content.count} acessos
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum conteúdo acessado ainda
              </p>
            )}
          </CardContent>
        </Card>

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
    </div>
  );
}
