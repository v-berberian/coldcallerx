
-- Add device tracking and conflict resolution to user_sessions
ALTER TABLE public.user_sessions 
DROP CONSTRAINT IF EXISTS user_sessions_user_id_key;

-- Add device_id column
ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS device_id TEXT NOT NULL DEFAULT gen_random_uuid()::text;

-- Add last_updated_at for conflict resolution
ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create new unique constraint on user_id + device_id
ALTER TABLE public.user_sessions 
ADD CONSTRAINT user_sessions_user_device_unique UNIQUE (user_id, device_id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_last_updated 
ON public.user_sessions (user_id, last_updated_at DESC);

-- Update the trigger to set last_updated_at
DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON public.user_sessions;
CREATE TRIGGER update_user_sessions_last_updated_at
  BEFORE UPDATE ON public.user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to clean up old device sessions (optional, for housekeeping)
CREATE OR REPLACE FUNCTION public.cleanup_old_device_sessions()
RETURNS void AS $$
BEGIN
  -- Keep only the most recent 5 sessions per user
  DELETE FROM public.user_sessions
  WHERE id NOT IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (
        PARTITION BY user_id 
        ORDER BY last_accessed_at DESC
      ) as rn
      FROM public.user_sessions
    ) ranked
    WHERE rn <= 5
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
