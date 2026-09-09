import { supabaseAdmin } from '../lib/supabase/admin';

async function testApiEndpoints() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const endpoints = [
    '/rest/v1/rpc/exec_sql',
    '/pg_meta/default/query',
    '/pg/query',
    '/sql',
    '/rest/v1/'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${url}${ep}`, {
        method: ep.includes('rpc') || ep.includes('query') || ep.includes('sql') ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        },
        body: ep.includes('rpc') || ep.includes('query') || ep.includes('sql') ? JSON.stringify({ query: 'SELECT 1;' }) : undefined
      });
      console.log(`Endpoint ${ep} status:`, res.status);
    } catch (err: any) {
      console.log(`Endpoint ${ep} error:`, err.message);
    }
  }
}

testApiEndpoints().catch(console.error);
