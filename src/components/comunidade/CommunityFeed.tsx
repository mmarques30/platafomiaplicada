import { useState } from "react";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { PostCard } from "./PostCard";
import { CreatePostModal } from "./CreatePostModal";
import { WritePostInput } from "./WritePostInput";

export function CommunityFeed() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { posts, isLoading, toggleLike, deletePost } = useCommunityPosts();

  if (isLoading) {
    return (
      <div className="space-y-0">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-b border-border p-4 animate-pulse">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-1/3 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-2/3 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Write Post Input */}
      <WritePostInput onClick={() => setShowCreateModal(true)} />

      {/* Posts Feed */}
      <div>
        {posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            Nenhum post ainda. Seja o primeiro a postar!
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => toggleLike(post.id)}
              onDelete={() => deletePost(post.id)}
            />
          ))
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </div>
  );
}
