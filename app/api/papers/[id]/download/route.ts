import { NextRequest, NextResponse } from 'next/server';
import { getQuestionPaperById, incrementDownloadCount } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase/admin';

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes('xyz-medico.supabase.co'));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const paper = await getQuestionPaperById(id);

    if (!paper || paper.status !== 'active') {
      return NextResponse.json({ error: 'Question paper not found or unavailable' }, { status: 404 });
    }

    // Increment metrics
    await incrementDownloadCount(id);

    // If Supabase Storage is configured and paper is stored in Supabase, generate signed URL
    if (isSupabaseConfigured() && paper.storage_path && !paper.storage_path.startsWith('mock/')) {
      const { data, error } = await supabaseAdmin.storage
        .from('question-papers')
        .createSignedUrl(paper.storage_path, 3600, {
          download: paper.original_file_name || `${paper.title}.pdf`,
        });

      if (!error && data?.signedUrl) {
        return NextResponse.redirect(data.signedUrl);
      }
    }

    // Fallback response for mock development mode
    const pdfHeader = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 120 >>\nstream\nBT\n/F1 18 Tf\n50 700 Td\n(PaperMD QUESTION PAPER: ${paper.title}) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000212 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n382\n%%EOF`;

    return new NextResponse(Buffer.from(pdfHeader), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(
          paper.original_file_name || `${paper.title}.pdf`
        )}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('API /papers/[id]/download error:', error);
    return NextResponse.json({ error: 'Failed to process download' }, { status: 500 });
  }
}
