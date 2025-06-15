
-- Create table for storing court record search results
CREATE TABLE public.court_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  business_name TEXT NOT NULL,
  case_name TEXT,
  case_number TEXT,
  court_name TEXT,
  case_date DATE,
  case_url TEXT,
  case_summary TEXT,
  search_query TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.court_records ENABLE ROW LEVEL SECURITY;

-- Create policies for court records
CREATE POLICY "Users can view their own court records" 
  ON public.court_records 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own court records" 
  ON public.court_records 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own court records" 
  ON public.court_records 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own court records" 
  ON public.court_records 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for faster searches
CREATE INDEX idx_court_records_business_name ON public.court_records(business_name);
CREATE INDEX idx_court_records_user_created ON public.court_records(user_id, created_at DESC);

-- Add trigger for updated_at
CREATE OR REPLACE TRIGGER update_court_records_updated_at
  BEFORE UPDATE ON public.court_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
