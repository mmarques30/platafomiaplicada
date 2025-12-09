-- Add comment_id column to community_reactions for liking comments
ALTER TABLE public.community_reactions
ADD COLUMN comment_id uuid REFERENCES public.community_comments(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_community_reactions_comment_id ON public.community_reactions(comment_id);

-- Add constraint to ensure reaction is for either post OR comment, not both
ALTER TABLE public.community_reactions
ADD CONSTRAINT reaction_target_check 
CHECK (
  (post_id IS NOT NULL AND comment_id IS NULL) OR 
  (post_id IS NULL AND comment_id IS NOT NULL)
);

-- Make post_id nullable since reactions can now be on comments instead
ALTER TABLE public.community_reactions
ALTER COLUMN post_id DROP NOT NULL;