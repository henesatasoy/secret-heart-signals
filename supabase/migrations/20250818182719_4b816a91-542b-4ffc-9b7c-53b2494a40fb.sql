-- Fix RLS policies for proper INSERT operations

-- Drop and recreate connections policies with correct syntax
DROP POLICY IF EXISTS "Users can create their own connection" ON public.connections;
DROP POLICY IF EXISTS "Users can send their own messages" ON public.messages;

-- Create proper INSERT policies with WITH CHECK
CREATE POLICY "Users can create their own connection" 
ON public.connections 
FOR INSERT 
WITH CHECK (auth.uid()::text = connection_id);

CREATE POLICY "Users can send their own messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (auth.uid()::text = from_connection_id);

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_connections_connection_id ON public.connections(connection_id);
CREATE INDEX IF NOT EXISTS idx_connections_partner_id ON public.connections(partner_id);
CREATE INDEX IF NOT EXISTS idx_messages_from_to ON public.messages(from_connection_id, to_connection_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);