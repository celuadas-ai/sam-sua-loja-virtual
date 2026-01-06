-- Create operators table to store operator-specific information
-- Links to auth.users via user_id and extends profiles data
CREATE TABLE public.operators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  deliveries_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;

-- Create policies for operators table
-- Admins have full access
CREATE POLICY "Admins have full access to operators" 
ON public.operators 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Operators can view their own record
CREATE POLICY "Operators can view their own record" 
ON public.operators 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_operators_updated_at
BEFORE UPDATE ON public.operators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_operators_user_id ON public.operators(user_id);
CREATE INDEX idx_operators_is_active ON public.operators(is_active);