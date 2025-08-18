import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      connections: {
        Row: {
          id: string
          connection_id: string
          partner_id: string | null
          is_connected: boolean
          created_at: string
        }
        Insert: {
          id?: string
          connection_id: string
          partner_id?: string | null
          is_connected?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          connection_id?: string
          partner_id?: string | null
          is_connected?: boolean
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          from_connection_id: string
          to_connection_id: string
          message: string
          mood: string
          created_at: string
        }
        Insert: {
          id?: string
          from_connection_id: string
          to_connection_id: string
          message: string
          mood: string
          created_at?: string
        }
        Update: {
          id?: string
          from_connection_id?: string
          to_connection_id?: string
          message?: string
          mood?: string
          created_at?: string
        }
      }
    }
  }
}