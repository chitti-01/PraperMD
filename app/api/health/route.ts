import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const timestamp = new Date().toISOString();
  const checks: Record<string, 'ok' | 'missing' | 'error'> = {};

  try {
    // Check core database tables
    const tables = ['colleges', 'subjects', 'exam_types', 'question_papers', 'reports', 'upload_intents'];

    for (const tbl of tables) {
      const { error } = await supabaseAdmin.from(tbl).select('id').limit(1);
      if (error) {
        checks[tbl] = error.code === 'PGRST205' || error.code === '42P01' ? 'missing' : 'error';
      } else {
        checks[tbl] = 'ok';
      }
    }

    // Check storage bucket
    const { data: buckets, error: bucketErr } = await supabaseAdmin.storage.listBuckets();
    const storageStatus = !bucketErr && buckets?.some((b) => b.name === 'question-papers') ? 'ok' : 'missing';
    checks['storage_bucket'] = storageStatus;

    const allOk = Object.values(checks).every((v) => v === 'ok');
    const hasMissingTables = Object.values(checks).some((v) => v === 'missing');

    const status = allOk ? 'HEALTHY' : hasMissingTables ? 'UNHEALTHY_SCHEMA_MISSING' : 'DEGRADED';

    return NextResponse.json(
      {
        status,
        timestamp,
        checks,
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'unconfigured',
        environment: process.env.NODE_ENV || 'development',
      },
      { status: allOk ? 200 : 503 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Health check failed';
    return NextResponse.json(
      {
        status: 'UNHEALTHY',
        error: msg,
        timestamp,
      },
      { status: 500 }
    );
  }
}
