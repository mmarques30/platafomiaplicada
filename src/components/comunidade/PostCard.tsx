import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CommunityPost } from "@/hooks/useCommunityPosts";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useState } from "react";
import { PostComments } from "./PostComments";

interface PostCardProps {
  post: CommunityPost;
  onLike: () => void;
  onDelete: () => void;
}

export function PostCard({ post, onLike, onDelete }: PostCardProps) {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [showComments, setShowComments] = useState(false);

  const canDelete = user?.id === post.user_id || isAdmin;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-[#9EB038] text-[#2F302B]">
                {getInitials(post.profiles.nome_completo)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-zinc-200">
                  {post.profiles.nome_completo}
                </span>
                <Badge variant="outline" className="text-xs">
                  Nível {post.profiles.nivel_comunidade}
                </Badge>
              </div>
              <div className="text-xs text-zinc-500">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </div>
            </div>
          </div>

          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-zinc-400 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {post.community_categories && (
          <Badge variant="secondary" className="w-fit">
            {post.community_categories.emoji} {post.community_categories.name}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {post.title && (
          <h3 className="text-lg font-semibold text-zinc-100">{post.title}</h3>
        )}

        <p className="text-zinc-300 whitespace-pre-wrap">{post.content}</p>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t border-zinc-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLike}
            className={
              post.user_has_liked
                ? "text-red-500 hover:text-red-600"
                : "text-zinc-400 hover:text-zinc-300"
            }
          >
            <Heart
              className={`h-4 w-4 mr-1 ${
                post.user_has_liked ? "fill-red-500" : ""
              }`}
            />
            {post.likes_count}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="text-zinc-400 hover:text-zinc-300"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {post.comments_count}
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && <PostComments postId={post.id} />}
      </CardContent>
    </Card>
  );
}
