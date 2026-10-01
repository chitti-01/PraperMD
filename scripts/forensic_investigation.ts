import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read .env.local manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach((line) => {
  const parts = line.split('=');
  if (parts.length >= 2 && !line.startsWith('#')) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !serviceKey) {
  console.error('Missing Supabase configuration in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const supabaseAnon = createClient(url, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function runForensics() {
  console.log('=== STARTING FORENSIC INVESTIGATION ===\n');

  // PHASE 1: Table list & Row Counts
  const tables = ['colleges', 'subjects', 'exam_types', 'question_papers', 'upload_intents', 'reports'];
  const tableCounts: Record<string, number | string> = {};

  for (const table of tables) {
    const { count, error } = await supabaseAdmin
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      tableCounts[table] = `ERROR: ${error.message} (${error.code})`;
    } else {
      tableCounts[table] = count ?? 0;
    }
  }

  console.log('--- PHASE 1: ROW COUNTS ---');
  console.log(JSON.stringify(tableCounts, null, 2));

  // Seed / Reference Tables
  const { data: colleges } = await supabaseAdmin.from('colleges').select('*');
  const { data: subjects } = await supabaseAdmin.from('subjects').select('*');
  const { data: examTypes } = await supabaseAdmin.from('exam_types').select('*');

  console.log(`\nColleges (${colleges?.length || 0}):`);
  console.log(JSON.stringify(colleges, null, 2));

  console.log(`\nExam Types (${examTypes?.length || 0}):`);
  console.log(JSON.stringify(examTypes, null, 2));

  console.log(`\nSubjects (${subjects?.length || 0}):`);
  console.log(JSON.stringify(subjects?.map(s => ({ id: s.id, college_id: s.college_id, name: s.name, slug: s.slug })), null, 2));

  // PHASE 2: QUESTION_PAPERS Forensic Inventory (ALL ROWS, NO FILTERING)
  const { data: allPapers, error: paperErr } = await supabaseAdmin
    .from('question_papers')
    .select('*');

  console.log('\n--- PHASE 2: QUESTION PAPERS ALL ROWS ---');
  if (paperErr) {
    console.error('Error fetching question_papers:', paperErr);
  } else {
    console.log(`Total question_papers rows fetched: ${allPapers?.length}`);
    console.log(JSON.stringify(allPapers, null, 2));
  }

  // PHASE 3: Storage Forensics
  console.log('\n--- PHASE 3: STORAGE FORENSICS ---');
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  console.log('Buckets:', JSON.stringify(buckets?.map(b => ({ name: b.name, id: b.id, public: b.public })), null, 2));

  const storageObjects: Array<{
    bucket: string;
    path: string;
    name: string;
    size: number;
    contentType?: string;
    created_at?: string;
    updated_at?: string;
    metadata?: any;
  }> = [];

  const { data: rootItems, error: listErr } = await supabaseAdmin.storage
    .from('question-papers')
    .list('', { limit: 1000 });

  if (listErr) {
    console.error('Storage list error:', listErr);
  } else {
    for (const item of rootItems || []) {
      if (!item.id) {
        // Folder
        const folderName = item.name;
        const { data: subFiles } = await supabaseAdmin.storage
          .from('question-papers')
          .list(folderName, { limit: 1000 });

        for (const file of subFiles || []) {
          storageObjects.push({
            bucket: 'question-papers',
            path: `${folderName}/${file.name}`,
            name: file.name,
            size: file.metadata?.size || file.metadata?.contentLength || 0,
            contentType: file.metadata?.mimetype,
            created_at: file.created_at || undefined,
            updated_at: file.updated_at || undefined,
            metadata: file.metadata,
          });
        }
      } else {
        storageObjects.push({
          bucket: 'question-papers',
          path: item.name,
          name: item.name,
          size: item.metadata?.size || item.metadata?.contentLength || 0,
          contentType: item.metadata?.mimetype,
          created_at: item.created_at || undefined,
          updated_at: item.updated_at || undefined,
          metadata: item.metadata,
        });
      }
    }
  }

  console.log(`Total Storage Objects Found: ${storageObjects.length}`);
  console.log(JSON.stringify(storageObjects, null, 2));

  // PHASE 6: Upload Intents
  console.log('\n--- PHASE 6: UPLOAD INTENTS ---');
  const { data: allIntents, error: intentErr } = await supabaseAdmin
    .from('upload_intents')
    .select('*');

  if (intentErr) {
    console.error('Error fetching upload_intents:', intentErr);
  } else {
    console.log(`Total upload_intents fetched: ${allIntents?.length}`);
    console.log(JSON.stringify(allIntents, null, 2));
  }

  // PHASE 4 & 11: Test getQuestionPapers() via lib/db logic & raw Supabase
  console.log('\n--- PHASE 4: JOIN & FILTER RETRIEVAL TEST ---');
  const { data: joinedPapers, error: joinErr } = await supabaseAdmin
    .from('question_papers')
    .select(`
      *,
      colleges(name),
      subjects(name),
      exam_types(name)
    `)
    .eq('status', 'active');

  console.log('Joined active question papers count:', joinedPapers?.length, 'Error:', joinErr);
  console.log(JSON.stringify(joinedPapers, null, 2));

  const { data: anonJoinedPapers, error: anonJoinErr } = await supabaseAnon
    .from('question_papers')
    .select(`
      *,
      colleges(name),
      subjects(name),
      exam_types(name)
    `)
    .eq('status', 'active');

  console.log('Anon Joined active question papers count:', anonJoinedPapers?.length, 'Error:', anonJoinErr);

  console.log('\n=== FORENSIC INSPECTION COMPLETE ===');
}

runForensics().catch(console.error);
