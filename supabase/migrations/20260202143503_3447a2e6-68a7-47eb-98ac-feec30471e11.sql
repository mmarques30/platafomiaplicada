-- Add skills_liberado column to profiles table
-- This allows admins to grant Skills environment access to Business users
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS skills_liberado BOOLEAN DEFAULT FALSE;