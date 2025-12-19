import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fbpmdmmmastkznaggevx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicG1kbW1tYXN0a3puYWdnZXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjQ4OTgsImV4cCI6MjA2OTk0MDg5OH0.7TzMP0A5O1ws4VKQL_XN6Y5MwMLb5GqQ2unXNpaSUaA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
