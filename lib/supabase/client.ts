import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente Supabase para uso em Client Components (browser).
 * Use para Realtime, Storage ou chamadas que rodam no cliente.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase: faltam NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) no .env'
    );
  }

  return createBrowserClient(url, key);
}
