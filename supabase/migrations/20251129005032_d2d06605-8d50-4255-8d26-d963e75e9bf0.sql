-- Add data_conversao field to profiles table to track when visitors convert to mentorados
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS data_conversao TIMESTAMP WITH TIME ZONE;