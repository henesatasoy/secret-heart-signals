-- Fix critical security vulnerability: Replace overly permissive RLS policies

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow all operations on messages" ON public.messages;
DROP POLICY IF EXISTS "Allow all operations on connections" ON public.connections;

-- Create secure RLS policies for messages table
-- Users can only read messages where they are sender or recipient
CREATE POLICY "Users can view their own messages" 
ON public.messages 
FOR SELECT 
USING (
  auth.uid()::text = from_connection_id OR 
  auth.uid()::text = to_connection_id
);

-- Users can only insert messages as themselves
CREATE POLICY "Users can send their own messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (auth.uid()::text = from_connection_id);

-- Users can update their own sent messages
CREATE POLICY "Users can update their own messages" 
ON public.messages 
FOR UPDATE 
USING (auth.uid()::text = from_connection_id);

-- Users can delete their own sent messages  
CREATE POLICY "Users can delete their own messages" 
ON public.messages 
FOR DELETE 
USING (auth.uid()::text = from_connection_id);

-- Create secure RLS policies for connections table
-- Users can only see their own connection record
CREATE POLICY "Users can view their own connection" 
ON public.connections 
FOR SELECT 
USING (auth.uid()::text = connection_id);

-- Users can only insert their own connection
CREATE POLICY "Users can create their own connection" 
ON public.connections 
FOR INSERT 
WITH CHECK (auth.uid()::text = connection_id);

-- Users can only update their own connection
CREATE POLICY "Users can update their own connection" 
ON public.connections 
FOR UPDATE 
USING (auth.uid()::text = connection_id);

-- Users can only delete their own connection
CREATE POLICY "Users can delete their own connection" 
ON public.connections 
FOR DELETE 
USING (auth.uid()::text = connection_id);