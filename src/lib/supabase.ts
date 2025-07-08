import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client component client
export const createSupabaseClient = () => createClientComponentClient();

// Server component client
export const createSupabaseServerClient = () => createServerComponentClient({ cookies });

// Service role client for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database types
export type Database = {
  public: {
    Tables: {
      license_plates: {
        Row: {
          id: string;
          plate_number: string;
          confidence: number;
          image_url: string;
          detected_at: string;
          camera_id: string;
          location: any;
          vehicle_info: any;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plate_number: string;
          confidence: number;
          image_url: string;
          detected_at: string;
          camera_id: string;
          location?: any;
          vehicle_info?: any;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plate_number?: string;
          confidence?: number;
          image_url?: string;
          detected_at?: string;
          camera_id?: string;
          location?: any;
          vehicle_info?: any;
          status?: string;
          updated_at?: string;
        };
      };
      registered_plates: {
        Row: {
          id: string;
          plate_number: string;
          owner_name: string;
          owner_phone: string;
          vehicle_make: string | null;
          vehicle_model: string | null;
          vehicle_color: string | null;
          registration_date: string;
          expiry_date: string | null;
          status: string;
          alert_enabled: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plate_number: string;
          owner_name: string;
          owner_phone: string;
          vehicle_make?: string | null;
          vehicle_model?: string | null;
          vehicle_color?: string | null;
          registration_date: string;
          expiry_date?: string | null;
          status?: string;
          alert_enabled?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plate_number?: string;
          owner_name?: string;
          owner_phone?: string;
          vehicle_make?: string | null;
          vehicle_model?: string | null;
          vehicle_color?: string | null;
          registration_date?: string;
          expiry_date?: string | null;
          status?: string;
          alert_enabled?: boolean;
          notes?: string | null;
          updated_at?: string;
        };
      };
      cameras: {
        Row: {
          id: string;
          name: string;
          location: string;
          ip_address: string;
          port: number;
          username: string | null;
          password: string | null;
          stream_url: string;
          status: string;
          last_heartbeat: string;
          settings: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location: string;
          ip_address: string;
          port: number;
          username?: string | null;
          password?: string | null;
          stream_url: string;
          status?: string;
          last_heartbeat: string;
          settings: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string;
          ip_address?: string;
          port?: number;
          username?: string | null;
          password?: string | null;
          stream_url?: string;
          status?: string;
          last_heartbeat?: string;
          settings?: any;
          updated_at?: string;
        };
      };
    };
  };
};