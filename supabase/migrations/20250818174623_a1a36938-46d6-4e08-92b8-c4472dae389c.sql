-- Create connections table for pairing users
CREATE TABLE public.connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id TEXT NOT NULL UNIQUE,
  partner_id TEXT,
  is_connected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table for storing messages between connections
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_connection_id TEXT NOT NULL,
  to_connection_id TEXT NOT NULL,
  message TEXT NOT NULL,
  mood TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow all operations for connections (no auth required for this use case)
CREATE POLICY "Allow all operations on connections" ON public.connections
FOR ALL USING (true) WITH CHECK (true);

-- Allow all operations for messages (no auth required for this use case)
CREATE POLICY "Allow all operations on messages" ON public.messages
FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;