/*
  # Fix user_sessions unique constraint

  1. Data Cleanup
    - Remove any duplicate user_sessions entries, keeping only the most recent one per user
  
  2. Constraint Management
    - Drop any existing conflicting constraints
    - Add the correct unique constraint on user_id column
    - This ensures upsert operations work correctly

  3. Security
    - Maintain existing RLS policies
*/

-- First, create a temporary table with deduplicated data
CREATE TEMP TABLE user_sessions_temp AS
SELECT DISTINCT ON (user_id) *
FROM public.user_sessions
ORDER BY user_id, updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC;

-- Clear the original table
TRUNCATE public.user_sessions;

-- Insert the deduplicated data back
INSERT INTO public.user_sessions
SELECT * FROM user_sessions_temp;

-- Drop the temporary table
DROP TABLE user_sessions_temp;

-- Drop any existing unique constraints on user_id to start fresh
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Find and drop all unique constraints on user_id
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'user_sessions' 
        AND tc.table_schema = 'public'
        AND tc.constraint_type = 'UNIQUE'
        AND ccu.column_name = 'user_id'
    LOOP
        EXECUTE 'ALTER TABLE public.user_sessions DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
    END LOOP;
END $$;

-- Add the unique constraint with a specific name
ALTER TABLE public.user_sessions ADD CONSTRAINT user_sessions_user_id_key UNIQUE (user_id);

-- Verify the constraint was added correctly
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_sessions_user_id_key' 
        AND table_name = 'user_sessions'
        AND table_schema = 'public'
        AND constraint_type = 'UNIQUE'
    ) THEN
        RAISE EXCEPTION 'Failed to create unique constraint on user_sessions.user_id';
    END IF;
END $$;