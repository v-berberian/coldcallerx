
-- Enable RLS on both tables (this is safe to run multiple times)
ALTER TABLE public.lead_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own lead lists" ON public.lead_lists;
DROP POLICY IF EXISTS "Users can create their own lead lists" ON public.lead_lists;
DROP POLICY IF EXISTS "Users can update their own lead lists" ON public.lead_lists;
DROP POLICY IF EXISTS "Users can delete their own lead lists" ON public.lead_lists;

DROP POLICY IF EXISTS "Users can view leads in their lists" ON public.leads;
DROP POLICY IF EXISTS "Users can create leads in their lists" ON public.leads;
DROP POLICY IF EXISTS "Users can update leads in their lists" ON public.leads;
DROP POLICY IF EXISTS "Users can delete leads in their lists" ON public.leads;

-- Create RLS policies for lead_lists
CREATE POLICY "Users can view their own lead lists" 
ON public.lead_lists FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lead lists" 
ON public.lead_lists FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lead lists" 
ON public.lead_lists FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lead lists" 
ON public.lead_lists FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for leads
CREATE POLICY "Users can view leads in their lists" 
ON public.leads FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.lead_lists 
    WHERE lead_lists.id = leads.list_id 
    AND lead_lists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create leads in their lists" 
ON public.leads FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.lead_lists 
    WHERE lead_lists.id = leads.list_id 
    AND lead_lists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update leads in their lists" 
ON public.leads FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.lead_lists 
    WHERE lead_lists.id = leads.list_id 
    AND lead_lists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete leads in their lists" 
ON public.leads FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.lead_lists 
    WHERE lead_lists.id = leads.list_id 
    AND lead_lists.user_id = auth.uid()
  )
);
