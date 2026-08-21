import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js';

import {
  SUPABASE_URL,
  SUPABASE_KEY,
  TEST_SUPABASE_URL,
  TEST_SUPABASE_KEY,
  IS_TEST_MODE
} from '../../config';

// Choose the correct environment
const url = IS_TEST_MODE ? TEST_SUPABASE_URL : SUPABASE_URL;
const key = IS_TEST_MODE ? TEST_SUPABASE_KEY : SUPABASE_KEY;

export const supabase = createClient<Database>(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
