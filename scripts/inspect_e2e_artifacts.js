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

async function inspectArtifacts() {
  console.log('=== E2E ARTIFACT & STORAGE OBJECT INSPECTION ===\n');

  // 1. Question Papers rows
  const { data: papers } = await supabaseAdmin.from('question_papers').select('*').order('created_at', { ascending: true });
  console.log(`Total question_papers rows (${papers.length}):`);
  papers.forEach((p, idx) => {
    console.log(`  [${idx + 1}] ID: ${p.id} | Title: "${p.title}" | Hash: ${p.file_hash?.substring(0, 12)}... | Path: ${p.storage_path} | Created: ${p.created_at}`);
  });

  // 2. Upload Intents rows
  const { data: intents } = await supabaseAdmin.from('upload_intents').select('*').order('created_at', { ascending: true });
  console.log(`\nTotal upload_intents rows (${intents.length}):`);
  intents.forEach((i, idx) => {
    console.log(`  [${idx + 1}] ID: ${i.id} | Status: ${i.status} | Title: "${i.title}" | Hash: ${i.file_hash?.substring(0, 12)}... | Path: ${i.storage_path} | QP_ID: ${i.question_paper_id} | Created: ${i.created_at}`);
  });

  // 3. Storage Objects
  const { data: rootItems } = await supabaseAdmin.storage.from('question-papers').list('', { limit: 1000 });
  const storageObjects = [];
  for (const item of rootItems || []) {
    if (!item.id) { // folder
      const { data: subFiles } = await supabaseAdmin.storage.from('question-papers').list(item.name, { limit: 1000 });
      for (const file of subFiles || []) {
        storageObjects.push({ path: `${item.name}/${file.name}`, size: file.metadata?.size || file.metadata?.contentLength || 0, updated_at: file.updated_at });
      }
    } else {
      storageObjects.push({ path: item.name, size: item.metadata?.size || item.metadata?.contentLength || 0, updated_at: item.updated_at });
    }
  }

  console.log(`\nTotal Storage Objects (${storageObjects.length}):`);
  storageObjects.forEach((s, idx) => {
    console.log(`  [${idx + 1}] Path: ${s.path} (${s.size} bytes)`);
  });
}

inspectArtifacts().catch(console.error);
