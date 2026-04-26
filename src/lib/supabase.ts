import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://hdwkvggthfusemrcckdw.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhkd2t2Z2d0aGZ1c2VtcmNja2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjM0MTcsImV4cCI6MjA5Mjc5OTQxN30.KgY3gCeE4DqiGoudQX7ngkyNkj_YjjJAoK6cBFujFEM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
