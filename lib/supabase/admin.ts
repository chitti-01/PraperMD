import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getSupabaseUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!rawUrl || rawUrl.includes('xyz-medico.supabase.co')) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Supabase Configuration Error: NEXT_PUBLIC_SUPABASE_URL is unconfigured.');
    }
    return 'https://xyz-medico.supabase.co';
  }
  return rawUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
}

function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || key === 'dummy_service_role_key') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Supabase Configuration Error: SUPABASE_SERVICE_ROLE_KEY is unconfigured.');
    }
    return 'dummy_service_role_key';
  }
  return key;
}

let instance: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const key = getServiceRoleKey();
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!instance) {
      instance = getAdminClient();
    }
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  },
});
