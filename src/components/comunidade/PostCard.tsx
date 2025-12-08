import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Trash2, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CommunityPost } from "@/hooks/useCommunityPosts";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useState } from "react";
import { PostComments } from "./PostComments";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

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
    <article className="border-b border-zinc-800 p-4 hover:bg-zinc-800/30 transition-colors">
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-10 w-10 flex-shrink-0">
          {post.profiles.avatar_url && (
            <AvatarImage src={post.profiles.avatar_url} />
          )}
          <AvatarFallback className="bg-[#9EB038] text-white text-sm">
            {getInitials(post.profiles.nome_completo)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="font-semibold text-white hover:underline cursor-pointer">
                {post.profiles.nome_completo}
              </span>
              <span className="text-zinc-500 text-sm">
                @lvl{post.profiles.nivel_comunidade}
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-500 text-sm hover:underline cursor-pointer">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: false,
                  locale: ptBR,
                })}
              </span>
              {post.community_categories && (
                <>
                  <span className="text-zinc-600">·</span>
                  <span className="text-[#9EB038] text-sm">
                    {post.community_categories.name}
                  </span>
                </>
              )}
            </div>

            {canDelete && (
              <button
                onClick={onDelete}
                className="p-2 rounded-full text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Post Content */}
          {post.title && (
            <h3 className="text-lg font-semibold text-white mt-1">{post.title}</h3>
          )}

          <div className="text-white mt-1 prose prose-sm prose-invert max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{children}</p>,
                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6 mt-3 -ml-2">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 p-2 rounded-full text-zinc-500 hover:text-[#9EB038] hover:bg-[#9EB038]/10 transition-colors group"
            >
              <MessageCircle className="h-[18px] w-[18px]" />
              <span className="text-sm">{post.comments_count || ""}</span>
            </button>

            <button
              onClick={onLike}
              className={cn(
                "flex items-center gap-2 p-2 rounded-full transition-colors group",
                post.user_has_liked
                  ? "text-red-500"
                  : "text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
              )}
            >
              <Heart
                className={cn(
                  "h-[18px] w-[18px]",
                  post.user_has_liked && "fill-red-500"
                )}
              />
              <span className="text-sm">{post.likes_count || ""}</span>
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <PostComments postId={post.id} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
