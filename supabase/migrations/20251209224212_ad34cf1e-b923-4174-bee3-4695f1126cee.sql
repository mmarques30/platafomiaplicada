-- Add realizada column to aulas_semanais table
ALTER TABLE aulas_semanais 
ADD COLUMN realizada BOOLEAN DEFAULT false;