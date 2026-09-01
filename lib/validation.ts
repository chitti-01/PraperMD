import { z } from 'zod';

export const UploadPaperSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title is too long'),
  subject_id: z.string().min(1, 'Please select a subject'),
  exam_type_id: z.string().min(1, 'Please select an exam type'),
  mbbs_year: z.enum(['1st MBBS', '2nd MBBS', '3rd MBBS', 'Final MBBS'], {
    message: 'Please select an MBBS year',
  }),
  semester: z.string().optional(),
  exam_year: z.coerce.number().min(2000, 'Invalid year').max(2030, 'Invalid year'),
  academic_year: z.string().optional(),
  description: z.string().max(1000, 'Description is too long').optional(),
});

export const ReportSchema = z.object({
  paper_id: z.string().min(1, 'Paper ID is required'),
  reason: z.enum([
    'wrong_subject',
    'wrong_year',
    'duplicate',
    'unreadable',
    'incomplete',
    'not_a_question_paper',
    'other',
  ]),
  description: z.string().max(500, 'Report description too long').optional(),
});

export const AdminAuthSchema = z.object({
  passkey: z.string().min(1, 'Admin passkey is required'),
});

export const UpdatePaperSchema = UploadPaperSchema.partial().extend({
  status: z.enum(['active', 'removed']).optional(),
});
