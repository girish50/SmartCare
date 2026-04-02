import { createClient } from '@supabase/supabase-js'

// Hardcoding the keys directly to completely bypass any Vite .env loading issues
const supabaseUrl = 'https://lnuyimzbxeafwvtraaog.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxudXlpbXpieGVhZnd2dHJhYW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODEzNDUsImV4cCI6MjA4ODU1NzM0NX0.4ixSXEbPsoHgpLpeTRnKGTfedVLLC9dDuES6Smzzl_g'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
