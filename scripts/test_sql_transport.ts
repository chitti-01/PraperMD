import { supabaseAdmin } from '../lib/supabase/admin';

async function testSqlExecution() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Testing SQL Execution Endpoint capabilities for:', url);

  // Method A: Test via pg-meta endpoint
  try {
    const res = await fetch(`${url}/pg_meta/default/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey!,
        'Authorization': `Bearer ${serviceKey}`
      },
      body: JSON.stringify({ query: 'SELECT 1 as result;' })
    });
    console.log('Method A (/pg_meta/default/query) status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('Method A result:', data);
      return 'pg_meta';
    }
  } catch (err: any) {
    console.log('Method A failed:', err.message);
  }

  // Method B: Test via /pg/query endpoint
  try {
    const res = await fetch(`${url}/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey!,
        'Authorization': `Bearer ${serviceKey}`
      },
      body: JSON.stringify({ query: 'SELECT 1 as result;' })
    });
    console.log('Method B (/pg/query) status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('Method B result:', data);
      return 'pg_query';
    }
  } catch (err: any) {
    console.log('Method B failed:', err.message);
  }

  // Method C: Check if direct PostgreSQL connection URL is available in env
  if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
    console.log('Method C: DATABASE_URL is available in environment.');
    return 'postgres_url';
  }

  console.log('No direct HTTP SQL query endpoint enabled by default on this Supabase project.');
}

testSqlExecution().catch(console.error);
