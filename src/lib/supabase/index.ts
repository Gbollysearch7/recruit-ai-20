// Re-export client-side code for convenience
// Server-side code should be imported directly from '@/lib/supabase/server'
// Middleware code should be imported directly from '@/lib/supabase/middleware'
export { createClient, getSupabase, isSupabaseConfigured } from './client';
export type * from './types';
