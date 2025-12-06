import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xkvtlawqpqmsuuvusswb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrdnRsYXdxcHFtc3V1dnVzc3diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMTg4OTgsImV4cCI6MjA4MDU5NDg5OH0.0nhU9wJg_7QKWSQCk2KcUhSrI8Z7JcsFrtGqwcO_0Yg'

export const supabase = createClient(supabaseUrl, supabaseKey)