-- Drop existing policies
DROP POLICY IF EXISTS "Users can update their own connection" ON public.connections;

-- Create new update policy that allows updating when user is the partner
CREATE POLICY "Users can update connections for partnership" 
ON public.connections 
FOR UPDATE 
USING (
  ((auth.uid())::text = connection_id) OR 
  ((auth.uid())::text = partner_id)
);

-- Also create policy to allow users to update connections when they're being set as partner
CREATE POLICY "Users can be set as partners" 
ON public.connections 
FOR UPDATE 
USING (true)
WITH CHECK (
  ((auth.uid())::text = connection_id) OR 
  ((auth.uid())::text = partner_id)
);