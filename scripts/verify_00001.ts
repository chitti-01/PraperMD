import { supabaseAdmin } from '../lib/supabase/admin';

async function verifyMigration00001() {
  console.log('===============================================================');
  console.log('PHASE 4 — VERIFY MIGRATION 00001');
  console.log('===============================================================');

  const tables = ['colleges', 'subjects', 'exam_types', 'question_papers', 'reports'];
  const results: Record<string, { exists: boolean; count?: number; sample?: any; error?: string }> = {};

  for (const table of tables) {
    const { data, count, error } = await supabaseAdmin
      .from(table)
      .select('*', { count: 'exact' });

    if (error) {
      results[table] = { exists: false, error: `${error.code}: ${error.message}` };
    } else {
      results[table] = { exists: true, count: count ?? data?.length ?? 0, sample: data?.[0] };
    }
  }

  console.log('\n1. Table Existence & Row Counts:');
  let allExist = true;
  for (const [tbl, res] of Object.entries(results)) {
    if (res.exists) {
      console.log(`  🟢 [EXISTS] Table "${tbl}": ${res.count} rows`);
    } else {
      allExist = false;
      console.log(`  🔴 [MISSING] Table "${tbl}": ${res.error}`);
    }
  }

  if (!allExist) {
    console.log('\nMigration 00001 has NOT been applied yet or failed.');
    return false;
  }

  // Check seed records
  console.log('\n2. Verifying Seed Records:');
  const collegesRes = await supabaseAdmin.from('colleges').select('id, name, code');
  console.log(`  Colleges (${collegesRes.data?.length || 0}):`, collegesRes.data);

  const examTypesRes = await supabaseAdmin.from('exam_types').select('id, name, slug');
  console.log(`  Exam Types (${examTypesRes.data?.length || 0}):`, examTypesRes.data);

  const subjectsRes = await supabaseAdmin.from('subjects').select('id, name, slug');
  console.log(`  Subjects (${subjectsRes.data?.length || 0}):`, subjectsRes.data);

  console.log('\n3. Question Papers (expected 0 rows before e2e upload):');
  const qpRes = await supabaseAdmin.from('question_papers').select('*');
  console.log(`  Question Papers Count: ${qpRes.data?.length || 0}`);

  console.log('\n4. Reports (expected 0 rows):');
  const repRes = await supabaseAdmin.from('reports').select('*');
  console.log(`  Reports Count: ${repRes.data?.length || 0}`);

  console.log('\n===============================================================');
  console.log('MIGRATION 00001 VERIFICATION COMPLETE');
  console.log('===============================================================');
  return true;
}

verifyMigration00001().catch(console.error);
