-- Fix the critical RLS policy issue for connections table
-- The current UPDATE policy prevents proper disconnection when partner_id becomes NULL

-- Drop the problematic UPDATE policy
DROP POLICY IF EXISTS "Users can update connections for partnership" ON public.connections;

-- Create a new, fixed UPDATE policy that properly handles NULL partner_id cases
CREATE POLICY "Users can update connections for partnership" ON public.connections
FOR UPDATE 
USING (
  -- Users can update their own connection OR 
  -- if they are currently the partner (but allow updating when partner_id becomes NULL)
  ((auth.uid())::text = connection_id) OR 
  ((auth.uid())::text = partner_id AND partner_id IS NOT NULL)
);