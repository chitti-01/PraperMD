const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('e:/medico/.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach((line) => {
  const parts = line.split('=');
  if (parts.length >= 2 && !line.startsWith('#')) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TARGET_PAPER_ID = 'f50dc75e-8c01-444f-b5d0-3cb51b2d15b6';
const TARGET_INTENT_ID = 'c33c93c0-f302-46cf-b61a-8a773a3b2876';
const TARGET_STORAGE_PATH = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/c33c93c0-f302-46cf-b61a-8a773a3b2876_e2e_test_paper_1790871642034.pdf';

async function cleanupE2EArtifact() {
  console.log('=== TARGETED E2E TEST ARTIFACT CLEANUP ===\n');

  // Safety check 1: Verify target paper exists and title contains E2E Production Test Paper
  const { data: paper } = await supabaseAdmin.from('question_papers').select('*').eq('id', TARGET_PAPER_ID).single();
  if (!paper || !paper.title.includes('E2E Production Test Paper')) {
    console.error('SAFETY ERROR: Target paper is not an E2E test paper. ABORTING.');
    process.exit(1);
  }

  console.log('Confirmed E2E Test Paper:', paper.id, paper.title);

  // 1. Delete from question_papers
  const { error: paperDelErr } = await supabaseAdmin.from('question_papers').delete().eq('id', TARGET_PAPER_ID);
  if (paperDelErr) {
    console.error('Error deleting question_papers row:', paperDelErr.message);
  } else {
    console.log('🟢 Deleted E2E test row from question_papers table.');
  }

  // 2. Delete from upload_intents
  const { error: intentDelErr } = await supabaseAdmin.from('upload_intents').delete().eq('id', TARGET_INTENT_ID);
  if (intentDelErr) {
    console.error('Error deleting upload_intents row:', intentDelErr.message);
  } else {
    console.log('🟢 Deleted E2E test row from upload_intents table.');
  }

  // 3. Remove binary object from storage
  const { error: stgDelErr } = await supabaseAdmin.storage.from('question-papers').remove([TARGET_STORAGE_PATH]);
  if (stgDelErr) {
    console.error('Error removing storage file:', stgDelErr.message);
  } else {
    console.log('🟢 Deleted E2E test file from Supabase Storage.');
  }

  console.log('\n=== CLEANUP COMPLETE ===');
}

cleanupE2EArtifact().catch(console.error);
