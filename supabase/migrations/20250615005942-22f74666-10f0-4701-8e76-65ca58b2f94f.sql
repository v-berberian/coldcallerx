
-- Enable RLS on lead_lists table
ALTER TABLE public.lead_lists ENABLE ROW LEVEL SECURITY;

-- Create policies for lead_lists
CREATE POLICY "Users can view their own lead lists" 
  ON public.lead_lists 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lead lists" 
  ON public.lead_lists 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lead lists" 
  ON public.lead_lists 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lead lists" 
  ON public.lead_lists 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS on leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policies for leads
CREATE POLICY "Users can view their own leads" 
  ON public.leads 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own leads" 
  ON public.leads 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads" 
  ON public.leads 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads" 
  ON public.leads 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add missing columns to leads table if they don't exist
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS last_called text;

-- Create trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for automatic updated_at updates
DROP TRIGGER IF EXISTS update_lead_lists_updated_at ON public.lead_lists;
CREATE TRIGGER update_lead_lists_updated_at 
  BEFORE UPDATE ON public.lead_lists 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at 
  BEFORE UPDATE ON public.leads 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
