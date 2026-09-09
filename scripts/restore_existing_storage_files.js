const fs = require('fs');
const { createClient } = require('e:/medico/node_modules/@supabase/supabase-js');

// Parse .env.local
const envFile = fs.readFileSync('e:/medico/.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach((line) => {
  const parts = line.split('=');
  if (parts.length >= 2 && !line.startsWith('#')) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function auditOrphanedStorageFiles() {
  console.log('========================================================');
  console.log('PaperMD Storage Audit & Unlinked File Inventory Tool');
  console.log('========================================================\n');
  console.log('NOTE: This tool NEVER invents fake metadata, hashes, or subjects.');
  console.log('It strictly audits binary files in Supabase Storage against PostgreSQL.\n');

  // Check database table presence first
  const { data: existingPapers, error: checkErr } = await supabaseAdmin.from('question_papers').select('id, storage_path, file_name, file_hash');
  if (checkErr) {
    console.error('DATABASE ERROR: Table "question_papers" not found (PGRST205).');
    console.error('Please run supabase/migrations/00001_initial_schema.sql and 00002_upload_intents.sql in Supabase SQL Editor first!');
    process.exit(1);
  }

  const dbPathSet = new Set((existingPapers || []).map((p) => p.storage_path));

  // Fetch all objects in bucket
  const { data: buckets, error: bktErr } = await supabaseAdmin.storage.listBuckets();
  if (bktErr || !buckets) {
    console.error('Failed to list storage buckets:', bktErr);
    process.exit(1);
  }

  const qpBucket = buckets.find((b) => b.name === 'question-papers');
  if (!qpBucket) {
    console.error('Bucket "question-papers" not found in Supabase Storage.');
    process.exit(1);
  }

  console.log('Scanning bucket "question-papers"...');
  const { data: rootItems, error: listErr } = await supabaseAdmin.storage
    .from('question-papers')
    .list('', { limit: 100 });

  if (listErr || !rootItems) {
    console.error('Failed to list files in bucket:', listErr);
    process.exit(1);
  }

  let matchedCount = 0;
  let unlinkedCount = 0;

  for (const item of rootItems) {
    if (!item.id) {
      // Item is a folder (e.g. col-gmc-01 or a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11)
      const folderName = item.name;
      const { data: subFiles } = await supabaseAdmin.storage
        .from('question-papers')
        .list(folderName, { limit: 100 });

      if (subFiles) {
        for (const file of subFiles) {
          const storagePath = `${folderName}/${file.name}`;
          const size = file.metadata?.size || file.metadata?.contentLength || 0;

          if (dbPathSet.has(storagePath)) {
            console.log(`[VERIFIED MATCH] ${storagePath} -> Linked to PostgreSQL row`);
            matchedCount++;
          } else {
            console.log(`[UNLINKED FILE] ${storagePath} (${(size / 1024).toFixed(1)} KB) -> Storage object has no DB row`);
            unlinkedCount++;
          }
        }
      }
    }
  }

  console.log('\n========================================================');
  console.log(`STORAGE AUDIT SUMMARY: ${matchedCount} verified linked files, ${unlinkedCount} unlinked storage files.`);
  console.log('========================================================');
}

auditOrphanedStorageFiles().catch(console.error);
