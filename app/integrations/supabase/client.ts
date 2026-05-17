import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://cyktcpdmlsfjyrnutmln.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5a3RjcGRtbHNmanlybnV0bWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NzY4NTksImV4cCI6MjA5NDU1Mjg1OX0.iHgBFydklpqRZxRBy0yHlnw3CVTlh9Npaua1bzqQV-s";

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
