import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, ThumbsUp, BookOpen } from "lucide-react";

export function EstatisticasComunidadeTab() {
  const { data: stats } = useQuery({
    queryKey: ["admin-community-stats"],
    queryFn: async () => {
      const [
        { count: totalMembers },
        { count: totalPosts },
        { count: totalComments },
        { count: totalCourses },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("conta_ativa", true),
        supabase
          .from("community_posts")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("community_comments")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("classroom_courses")
          .select("*", { count: "exact", head: true })
          .eq("ativo", true),
      ]);

      // Get total likes
      const { data: posts } = await supabase
        .from("community_posts")
        .select("likes_count");

      const totalLikes = posts?.reduce((sum, post) => sum + post.likes_count, 0) || 0;

      return {
        totalMembers: totalMembers || 0,
        totalPosts: totalPosts || 0,
        totalComments: totalComments || 0,
        totalLikes,
        totalCourses: totalCourses || 0,
      };
    },
  });

  const statCards = [
    {
      title: "Total de Membros",
      value: stats?.totalMembers || 0,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Posts Criados",
      value: stats?.totalPosts || 0,
      icon: MessageSquare,
      color: "text-green-500",
    },
    {
      title: "Comentários",
      value: stats?.totalComments || 0,
      icon: MessageSquare,
      color: "text-purple-500",
    },
    {
      title: "Total de Likes",
      value: stats?.totalLikes || 0,
      icon: ThumbsUp,
      color: "text-red-500",
    },
    {
      title: "Cursos Ativos",
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
