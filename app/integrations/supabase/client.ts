import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://rfaqhkbbyvddaxyolxrx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmYXFoa2JieXZkZGF4eW9seHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwOTQyNTgsImV4cCI6MjA3ODY3MDI1OH0.A13u_utRZSifaN4-tUBXJ-C57qNMpt70BGa8YxRF3_E";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
