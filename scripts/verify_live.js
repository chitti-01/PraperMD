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

async function runVerifyLive() {
  console.log('=== LIVE SUPABASE AUDIT ===\n');

  // PHASE 2 & 3: Database Tables & Counts
  const tables = ['colleges', 'subjects', 'exam_types', 'question_papers', 'upload_intents', 'reports'];
  for (const table of tables) {
    const { data, count, error } = await supabaseAdmin.from(table).select('*', { count: 'exact' });
    if (error) {
      console.log(`Table "${table}": ERROR (${error.message})`);
    } else {
      console.log(`Table "${table}": ${count} rows`);
      if (table === 'question_papers') {
        console.log('question_papers rows:', JSON.stringify(data, null, 2));
      }
      if (table === 'upload_intents') {
        console.log('upload_intents rows:', JSON.stringify(data, null, 2));
      }
    }
  }

  // PHASE 4: Storage Bucket check
  console.log('\n--- STORAGE BUCKET CHECK ---');
  const { data: buckets, error: bktErr } = await supabaseAdmin.storage.listBuckets();
  if (bktErr) {
    console.error('Bucket list error:', bktErr.message);
  } else {
    const qpBucket = buckets.find(b => b.name === 'question-papers');
    console.log('Bucket "question-papers":', qpBucket ? `EXISTS (public=${qpBucket.public})` : 'MISSING');
  }

  const { data: rootItems, error: listErr } = await supabaseAdmin.storage.from('question-papers').list('', { limit: 1000 });
  const storageObjects = [];
  if (listErr) {
    console.error('Storage list error:', listErr.message);
  } else {
    for (const item of rootItems || []) {
      if (!item.id) { // folder
        const { data: subFiles } = await supabaseAdmin.storage.from('question-papers').list(item.name, { limit: 1000 });
        for (const file of subFiles || []) {
          storageObjects.push({ path: `${item.name}/${file.name}`, size: file.metadata?.size || file.metadata?.contentLength || 0 });
        }
      } else {
        storageObjects.push({ path: item.name, size: item.metadata?.size || item.metadata?.contentLength || 0 });
      }
    }
  }

  console.log(`Total Storage Objects in "question-papers": ${storageObjects.length}`);
  console.log('Storage Objects:', JSON.stringify(storageObjects, null, 2));
}

runVerifyLive().catch(console.error);
