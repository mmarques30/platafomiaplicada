import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Trash2, ExternalLink } from "lucide-react";
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

interface MediaItem {
  type: string;
  url: string;
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

  // Parse media array from post
  const mediaItems: MediaItem[] = Array.isArray(post.media)
    ? (post.media as MediaItem[]).filter((m) => m.type === "image" && m.url)
    : [];

  const mediaCount = mediaItems.length;

  return (
    <article className="border-b border-border p-4 hover:bg-muted/30 transition-colors">
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-10 w-10 flex-shrink-0">
          {post.profiles.avatar_url && (
            <AvatarImage src={post.profiles.avatar_url} />
          )}
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
            {getInitials(post.profiles.nome_completo)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="font-semibold text-foreground hover:underline cursor-pointer">
                {post.profiles.nome_completo}
              </span>
              <span className="text-muted-foreground text-sm">
                @lvl{post.profiles.nivel_comunidade}
              </span>
              <span className="text-muted-foreground/50">·</span>
              <span className="text-muted-foreground text-sm hover:underline cursor-pointer">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: false,
                  locale: ptBR,
                })}
              </span>
              {post.community_categories && (
                <>
                  <span className="text-muted-foreground/50">·</span>
                  <span className="text-primary text-sm">
                    {post.community_categories.name}
                  </span>
                </>
              )}
            </div>

            {canDelete && (
              <button
                onClick={onDelete}
                className="p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Post Title */}
          {post.title && (
            <h3 className="text-lg font-semibold text-foreground mt-1">{post.title}</h3>
          )}

          {/* Content + Image Layout */}
          <div className={cn(
            "mt-1",
            mediaCount === 1 && "sm:flex sm:gap-4"
          )}>
            {/* Post Content with Markdown links */}
            <div className={cn(
              "text-foreground prose prose-sm max-w-none dark:prose-invert",
              mediaCount === 1 && "flex-1 min-w-0"
            )}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">{children}</p>
                  ),
                  strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                  em: ({ children }) => <em className="italic text-foreground">{children}</em>,
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {children}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Single Image - Lateral (tamanho médio) */}
            {mediaCount === 1 && (
              <div className="mt-3 sm:mt-0 flex-shrink-0 sm:w-72">
                <div className="rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center">
                  <img
                    src={mediaItems[0].url}
                    alt=""
                    className="w-full h-auto max-h-64 object-contain cursor-pointer hover:opacity-95 transition-opacity"
                    loading="lazy"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Media Grid for 2+ images */}
          {mediaCount >= 2 && (
            <div
              className={cn(
                "mt-3 rounded-2xl overflow-hidden border border-border",
                mediaCount === 2 && "grid grid-cols-2 gap-0.5 max-h-72",
                mediaCount === 3 && "grid grid-cols-2 gap-0.5 max-h-72",
                mediaCount >= 4 && "grid grid-cols-2 gap-0.5 max-h-72"
              )}
            >
              {mediaItems.slice(0, 4).map((media, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "relative overflow-hidden bg-muted",
                    mediaCount === 2 && "h-40",
                    mediaCount === 3 && idx === 0 && "row-span-2",
                    mediaCount === 3 && idx > 0 && "h-[calc(50%-1px)]",
                    mediaCount >= 4 && "h-36"
                  )}
                >
                  <img
                    src={media.url}
                    alt=""
                    className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                    loading="lazy"
                  />
                  {idx === 3 && mediaCount > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer">
                      <span className="text-white text-2xl font-bold">
                        +{mediaCount - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 mt-3 -ml-2">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors group"
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
                  : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
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
            <div className="mt-4 pt-4 border-t border-border">
              <PostComments postId={post.id} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
