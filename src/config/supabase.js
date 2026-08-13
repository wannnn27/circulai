export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const DATA_BACKEND = process.env.EXPO_PUBLIC_DATA_BACKEND || 'supabase';

export function isSupabaseConfigured() {
  const configured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
  if (DATA_BACKEND === 'supabase' && !configured) {
    console.warn('[CIRCULAI] DATA_BACKEND=supabase tapi Supabase belum dikonfigurasi. Pastikan EXPO_PUBLIC_SUPABASE_URL dan EXPO_PUBLIC_SUPABASE_ANON_KEY ada di .env');
  }
  return configured;
}

