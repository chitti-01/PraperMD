import { supabaseAdmin } from '../lib/supabase/admin';

async function runPhase1Inspection() {
  console.log('===============================================================');
  console.log('PHASE 1 — PRE-MIGRATION READ-ONLY INSPECTION');
  console.log('===============================================================');
  console.log('Target Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

  const tables = ['colleges', 'subjects', 'exam_types', 'question_papers', 'reports', 'upload_intents'];
  const tableStatus: Record<string, { exists: boolean; rowCount?: number; error?: string }> = {};

  for (const table of tables) {
    const { data, count, error } = await supabaseAdmin
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('does not exist')) {
        tableStatus[table] = { exists: false, error: `PGRST205: Relation "public.${table}" does not exist` };
      } else {
        tableStatus[table] = { exists: false, error: `Error ${error.code}: ${error.message}` };
      }
    } else {
      tableStatus[table] = { exists: true, rowCount: count ?? 0 };
    }
  }

  console.log('\n--- 1 & 2. Public Tables Status & Row Counts ---');
  for (const [tbl, status] of Object.entries(tableStatus)) {
    if (status.exists) {
      console.log(`  [EXISTS] Table "${tbl}": ${status.rowCount} rows`);
    } else {
      console.log(`  [MISSING] Table "${tbl}": ${status.error}`);
    }
  }

  // 3. Hash duplicates if question_papers exists
  if (tableStatus['question_papers']?.exists) {
    const { data: qpData } = await supabaseAdmin
      .from('question_papers')
      .select('id, file_hash, title, status');
    console.log(`\n--- 4. Active Question Papers Content (${qpData?.length || 0} rows) ---`);
    console.log(qpData);
  } else {
    console.log('\n--- 4. Active Question Papers: N/A (Table does not exist) ---');
  }

  // 5 & 6. Storage Bucket & Objects Inspection
  console.log('\n--- 5 & 6. Storage Bucket "question-papers" & Objects ---');
  const { data: bucketList, error: bucketErr } = await supabaseAdmin.storage.listBuckets();
  if (bucketErr) {
    console.error('  Error listing storage buckets:', bucketErr.message);
  } else {
    const qpBucket = bucketList?.find(b => b.name === 'question-papers');
    if (qpBucket) {
      console.log('  [EXISTS] Bucket "question-papers":', JSON.stringify(qpBucket));
      // List objects in root folders
      const { data: rootFiles } = await supabaseAdmin.storage.from('question-papers').list();
      console.log('  Root Objects/Folders:', rootFiles?.map(f => f.name));

      for (const item of rootFiles || []) {
        if (!item.id) { // folder
          const { data: subFiles } = await supabaseAdmin.storage.from('question-papers').list(item.name);
          console.log(`    Folder "${item.name}":`, subFiles?.map(f => `${f.name} (${f.metadata?.size || 'unknown'} bytes)`));
        }
      }
    } else {
      console.log('  [MISSING] Bucket "question-papers" not found in bucket list.');
    }
  }

  // 7. RPC Function Check
  console.log('\n--- 7. RPC Function "finalize_paper_transaction" Check ---');
  const { data: rpcRes, error: rpcErr } = await supabaseAdmin.rpc('finalize_paper_transaction', { p_intent_id: '00000000-0000-0000-0000-000000000000' });
  if (rpcErr) {
    if (rpcErr.code === 'PGRST202' || rpcErr.message.includes('Could not find the function')) {
      console.log('  [MISSING] RPC Function "finalize_paper_transaction" does not exist (PGRST202).');
    } else {
      console.log('  [EXISTS/ERROR] RPC Function returned:', rpcErr.code, rpcErr.message);
    }
  } else {
    console.log('  [EXISTS] RPC Function returned:', rpcRes);
  }

  console.log('\n===============================================================');
  console.log('PRE-MIGRATION INSPECTION COMPLETE');
  console.log('===============================================================');
}

runPhase1Inspection().catch(console.error);
