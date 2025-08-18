-- Fix critical privacy issue: Restrict connection data access to only relevant users
-- Drop the overly permissive policy that allows all users to view all connections
DROP POLICY IF EXISTS "Users can view all connections" ON public.connections;

-- Create a new restrictive policy that only allows users to see their own connections or connections where they are the partner
CREATE POLICY "Users can view their own connections" 
ON public.connections 
FOR SELECT 
USING (
  (auth.uid())::text = connection_id OR 
  (auth.uid())::text = partner_id
);