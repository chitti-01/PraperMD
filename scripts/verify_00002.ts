import { supabaseAdmin } from '../lib/supabase/admin';

async function verifyMigration00002() {
  console.log('===============================================================');
  console.log('PHASE 6 & 7 — VERIFY MIGRATION 00002 & RPC PRIVILEGES');
  console.log('===============================================================');

  // 1. Verify upload_intents table exists
  const { data, count, error } = await supabaseAdmin
    .from('upload_intents')
    .select('*', { count: 'exact' });

  if (error) {
    console.log(`🔴 [MISSING] Table "upload_intents": ${error.code}: ${error.message}`);
    return false;
  } else {
    console.log(`🟢 [EXISTS] Table "upload_intents": ${count ?? 0} rows`);
  }

  // 2. Verify RPC finalize_paper_transaction exists and executes properly for dummy UUID
  const dummyUuid = '00000000-0000-0000-0000-000000000000';
  const { data: rpcRes, error: rpcErr } = await supabaseAdmin.rpc('finalize_paper_transaction', {
    p_intent_id: dummyUuid,
  });

  if (rpcErr) {
    if (rpcErr.code === 'PGRST202' || rpcErr.message.includes('Could not find the function')) {
      console.log('🔴 [MISSING] RPC "finalize_paper_transaction" does not exist.');
      return false;
    } else {
      console.log('🟡 RPC Execution Result (Service Role):', rpcErr.code, rpcErr.message);
    }
  } else {
    console.log('🟢 [EXISTS] RPC "finalize_paper_transaction" (Service Role call success):', JSON.stringify(rpcRes));
  }

  // 3. Test RPC Privilege Enforcement (Call with Anon key if available or test security)
  // anon client check:
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (anonKey) {
    const { createClient } = await import('@supabase/supabase-js');
    const anonClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, anonKey);
    const { data: anonRpcData, error: anonRpcErr } = await anonClient.rpc('finalize_paper_transaction', {
      p_intent_id: dummyUuid,
    });

    if (anonRpcErr) {
      console.log('🟢 [VERIFIED] Anon RPC Execution correctly DENIED:', anonRpcErr.code, anonRpcErr.message);
    } else {
      console.log('🔴 [SECURITY VIOLATION] Anon RPC Execution was ALLOWED:', anonRpcData);
    }
  }

  console.log('===============================================================');
  console.log('MIGRATION 00002 VERIFICATION COMPLETE');
  console.log('===============================================================');
  return true;
}

verifyMigration00002().catch(console.error);
