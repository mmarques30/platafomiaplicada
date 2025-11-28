-- Remove emojis from community categories
UPDATE community_categories SET emoji = NULL WHERE emoji IS NOT NULL;