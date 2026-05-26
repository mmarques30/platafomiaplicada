import { useState } from "react";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { PostCard } from "./PostCard";
import { CreatePostModal } from "./CreatePostModal";
import { WritePostInput } from "./WritePostInput";
import { MessageSquarePlus } from "lucide-react";

export function CommunityFeed() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { posts, isLoading, toggleLike, deletePost } = useCommunityPosts();

  return (
    <div className="space-y-4">
      {/* Composer */}
      <WritePostInput onClick={() => setShowCreateModal(true)} />

      {/* Posts */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-brand-cream-soft border border-brand-hairline rounded-2xl p-5 animate-pulse"
            >
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-brand-hairline shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-1/3 bg-brand-hairline rounded" />
                  <div className="h-4 w-full bg-brand-hairline rounded" />
                  <div className="h-4 w-2/3 bg-brand-hairline rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-brand-cream-soft border border-brand-hairline rounded-2xl py-16 px-6 text-center">
          <div className="h-14 w-14 rounded-2xl bg-brand-strong/10 flex items-center justify-center mx-auto mb-4">
            <MessageSquarePlus className="h-6 w-6 text-brand-strong" />
          </div>
          <h3 className="font-serif-display text-xl text-foreground mb-1">Comece a conversa</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
            Ainda não há posts por aqui. Compartilhe uma ideia, dúvida ou conquista com a comunidade.
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 bg-brand-strong text-brand-cream rounded-full px-5 py-2 text-sm font-medium hover:bg-brand-strong/90 transition-colors"
          >
            <MessageSquarePlus className="h-4 w-4" />
            Criar primeiro post
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => toggleLike(post.id)}
              onDelete={() => deletePost(post.id)}
            />
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </div>
  );
}
