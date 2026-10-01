import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read .env.local
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

if (!url || !serviceKey) {
  console.error('Missing Supabase configuration in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function runDataIntegrityCheck() {
  console.log('===============================================================');
  console.log('PAPERMD — READ-ONLY DATA INTEGRITY & STORAGE AUDIT');
  console.log('===============================================================');

  // 1. Query PostgreSQL question_papers
  const { data: dbPapers, error: dbErr } = await supabaseAdmin
    .from('question_papers')
    .select('id, title, storage_path, status, file_hash, created_at');

  if (dbErr) {
    console.error('🔴 Database error fetching question_papers:', dbErr.message);
    throw dbErr;
  }

  const paperMapByPath = new Map<string, any>();
  const paperMapById = new Map<string, any>();
  for (const paper of dbPapers || []) {
    paperMapByPath.set(paper.storage_path, paper);
    paperMapById.set(paper.id, paper);
  }

  // 2. Query Supabase Storage objects in bucket 'question-papers'
  const { data: rootItems, error: listErr } = await supabaseAdmin.storage
    .from('question-papers')
    .list('', { limit: 1000 });

  if (listErr) {
    console.error('🔴 Storage list error:', listErr.message);
    throw listErr;
  }

  const storageObjects: Array<{ path: string; size: number }> = [];
  for (const item of rootItems || []) {
    if (!item.id) { // folder
      const { data: subFiles } = await supabaseAdmin.storage
        .from('question-papers')
        .list(item.name, { limit: 1000 });
      for (const file of subFiles || []) {
        storageObjects.push({
          path: `${item.name}/${file.name}`,
          size: file.metadata?.size || file.metadata?.contentLength || 0,
        });
      }
    } else {
      storageObjects.push({
        path: item.name,
        size: item.metadata?.size || item.metadata?.contentLength || 0,
      });
    }
  }

  const storagePathSet = new Set(storageObjects.map((s) => s.path));

  // Classification Categories
  const categoryA: Array<{ path: string; paperId: string; title: string }> = []; // Storage + DB row
  const categoryB_HistoricalOrphans: Array<{ path: string; size: number }> = []; // Storage + No DB row (Historical Test Orphans)
  const categoryC_MissingStorage: Array<{ paperId: string; path: string; title: string }> = []; // DB row + Missing Storage
  const categoryD_InvalidPath: Array<{ paperId: string; path: string }> = []; // DB row + invalid storage_path

  for (const stgObj of storageObjects) {
    if (paperMapByPath.has(stgObj.path)) {
      const p = paperMapByPath.get(stgObj.path);
      categoryA.push({ path: stgObj.path, paperId: p.id, title: p.title });
    } else {
      categoryB_HistoricalOrphans.push(stgObj);
    }
  }

  for (const paper of dbPapers || []) {
    if (!paper.storage_path || paper.storage_path.startsWith('mock/')) {
      categoryD_InvalidPath.push({ paperId: paper.id, path: paper.storage_path });
    } else if (!storagePathSet.has(paper.storage_path)) {
      categoryC_MissingStorage.push({ paperId: paper.id, path: paper.storage_path, title: paper.title });
    }
  }

  console.log('\n--- DATA INTEGRITY CLASSIFICATION ---');
  console.log(`🟢 Category A (Verified Active Production Papers): ${categoryA.length} files matched`);
  categoryA.forEach((item) => console.log(`   - [MATCHED] ID: ${item.paperId} | Title: "${item.title}" -> Path: ${item.path}`));

  console.log(`\n🟡 Category B (Historical Test Storage Orphans): ${categoryB_HistoricalOrphans.length} objects`);
  categoryB_HistoricalOrphans.forEach((item) => console.log(`   - [HISTORICAL ORPHAN TEST FILE] Path: ${item.path} (${(item.size / 1024).toFixed(1)} KB)`));

  console.log(`\n🔴 Category C (Database Rows Missing Storage File): ${categoryC_MissingStorage.length} rows`);
  categoryC_MissingStorage.forEach((item) => console.log(`   - [CRITICAL ERROR] Paper ID ${item.paperId} missing storage file at "${item.path}"`));

  console.log(`\n🔴 Category D (Database Rows with Invalid Storage Path): ${categoryD_InvalidPath.length} rows`);

  console.log('\n--- RECONCILIATION SUMMARY ---');
  console.log(`Total PostgreSQL question_papers rows: ${dbPapers?.length || 0}`);
  console.log(`Total Supabase Storage objects: ${storageObjects.length}`);
  console.log(`Verified Production Linked Papers: ${categoryA.length}`);
  console.log(`Historical Test Objects (Preserved Untouched): ${categoryB_HistoricalOrphans.length}`);

  const isHealthy = categoryC_MissingStorage.length === 0 && categoryD_InvalidPath.length === 0;
  console.log(`\nProduction Data Health Status: ${isHealthy ? '🟢 HEALTHY (Zero missing files)' : '🔴 UNHEALTHY'}`);
  console.log('===============================================================');

  return { categoryA, categoryB_HistoricalOrphans, categoryC_MissingStorage, categoryD_InvalidPath, isHealthy };
}

if (require.main === module) {
  runDataIntegrityCheck().catch(console.error);
}
