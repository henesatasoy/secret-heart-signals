-- Add missing SELECT policy for partners to view connections
-- This fixes the RLS inconsistency where users can update partner connections they cannot view

CREATE POLICY "Partners can view connections where they are partner" ON public.connections
FOR SELECT 
USING (
  -- Users can view their own connections OR connections where they are the partner
  ((auth.uid())::text = connection_id) OR 
  ((auth.uid())::text = partner_id AND partner_id IS NOT NULL)
);