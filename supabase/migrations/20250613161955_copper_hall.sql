/*
  # Fix user_sessions unique constraint definitively

  1. Data Cleanup
    - Remove any duplicate user_sessions entries, keeping only the most recent one per user
  
  2. Constraint Management
    - Drop existing unique constraint if it exists (to handle edge cases)
    - Add the unique constraint on user_id column
    - This ensures upsert operations work correctly

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

-- Drop the unique constraint if it exists (to handle any edge cases)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_sessions_user_id_key' 
    AND table_name = 'user_sessions'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.user_sessions DROP CONSTRAINT user_sessions_user_id_key;
  END IF;
END $$;

-- Also check for the UNIQUE constraint that was defined in the original table creation
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name LIKE '%user_id%' 
    AND table_name = 'user_sessions'
    AND table_schema = 'public'
    AND constraint_type = 'UNIQUE'
  ) THEN
    -- Get the actual constraint name and drop it
    EXECUTE (
      SELECT 'ALTER TABLE public.user_sessions DROP CONSTRAINT ' || constraint_name
      FROM information_schema.table_constraints 
      WHERE constraint_name LIKE '%user_id%' 
      AND table_name = 'user_sessions'
      AND table_schema = 'public'
      AND constraint_type = 'UNIQUE'
      LIMIT 1
    );
  END IF;
END $$;

-- Now add the unique constraint
ALTER TABLE public.user_sessions ADD CONSTRAINT user_sessions_user_id_key UNIQUE (user_id);