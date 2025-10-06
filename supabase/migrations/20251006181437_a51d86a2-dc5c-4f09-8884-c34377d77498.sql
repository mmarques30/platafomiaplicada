-- Adicionar coluna materiais na tabela videos
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS materiais JSONB DEFAULT '[]'::jsonb;

-- Adicionar coluna data_disponibilidade na tabela videos
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS data_disponibilidade TIMESTAMP WITH TIME ZONE;

-- Criar tabela para avaliações de vídeos
CREATE TABLE IF NOT EXISTS video_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(video_id, user_id)
);

-- Enable RLS on video_ratings
ALTER TABLE video_ratings ENABLE ROW LEVEL SECURITY;

-- Users can view all ratings
CREATE POLICY "Users can view all ratings"
  ON video_ratings FOR SELECT
  USING (true);

-- Users can create their own ratings
CREATE POLICY "Users can create their own rating"
  ON video_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own ratings
CREATE POLICY "Users can update their own rating"
  ON video_ratings FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own ratings
CREATE POLICY "Users can delete their own rating"
  ON video_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_video_ratings_video_id ON video_ratings(video_id);
CREATE INDEX IF NOT EXISTS idx_video_ratings_user_id ON video_ratings(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_video_ratings_updated_at
  BEFORE UPDATE ON video_ratings
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();