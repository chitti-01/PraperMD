import { supabaseAdmin } from '../lib/supabase/admin';

async function deepSchemaVerification() {
  console.log('===============================================================');
  console.log('DEEP SCHEMA & DATA VERIFICATION');
  console.log('===============================================================');

  const tables = ['colleges', 'subjects', 'exam_types', 'question_papers', 'reports', 'upload_intents'];

  for (const table of tables) {
    const { data, error, count } = await supabaseAdmin.from(table).select('*');
    if (error) {
      console.log(`Table "${table}": ERROR (${error.code}: ${error.message})`);
    } else {
      console.log(`Table "${table}": EXISTS (${data.length} rows)`);
      if (data.length > 0) {
        console.log(`  Sample row from "${table}":`, data[0]);
      }
    }
  }

  // Check if RPC finalize_paper_transaction exists
  const { data: rpcRes, error: rpcErr } = await supabaseAdmin.rpc('finalize_paper_transaction', {
    p_intent_id: '00000000-0000-0000-0000-000000000000'
  });

  if (rpcErr) {
    console.log('\nRPC "finalize_paper_transaction": MISSING / ERROR:', rpcErr.code, rpcErr.message);
  } else {
    console.log('\nRPC "finalize_paper_transaction": EXISTS (Returned:', rpcRes, ')');
  }
}

deepSchemaVerification().catch(console.error);
