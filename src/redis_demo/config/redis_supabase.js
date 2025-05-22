import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv';

dotenv.config();

const redis_supabaseUrl = process.env.VITE_SUPABASE_URL
const redis_supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
export const redis_supabase = createClient(redis_supabaseUrl, redis_supabaseAnonKey)
