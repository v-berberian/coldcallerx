/*
  # Fix user_sessions unique constraint

  1. Data Cleanup
    - Remove any duplicate user_sessions entries, keeping only the most recent one per user
  
  2. Constraint Addition
    - Add unique constraint on user_id column if it doesn't exist
    - This will allow upsert operations to work correctly

  3. Security
    - Maintain existing RLS policies
*/

-- First, remove any duplicate entries, keeping only the most recent one per user
DELETE FROM public.user_sessions 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM public.user_sessions
  ORDER BY user_id, updated_at DESC
);

-- Add unique constraint on user_id if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_sessions_user_id_key' 
    AND table_name = 'user_sessions'
  ) THEN
    ALTER TABLE public.user_sessions ADD CONSTRAINT user_sessions_user_id_key UNIQUE (user_id);
  END IF;
END $$;