import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  try {
    return createSupabaseClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE!
    )
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw error;
  }
}
