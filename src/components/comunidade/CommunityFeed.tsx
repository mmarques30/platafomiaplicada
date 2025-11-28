import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { PostCard } from "./PostCard";
import { CreatePostModal } from "./CreatePostModal";
import { Skeleton } from "@/components/ui/skeleton";

export function CommunityFeed() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { posts, isLoading, toggleLike, deletePost } = useCommunityPosts();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create Post Button */}
      <Button
        onClick={() => setShowCreateModal(true)}
        className="w-full bg-[#9EB038] hover:bg-[#8a9d32] text-[#2F302B]"
      >
        <Plus className="h-4 w-4 mr-2" />
        Criar Post
      </Button>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
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
