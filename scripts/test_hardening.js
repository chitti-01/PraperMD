import { calculateBufferHash } from '../lib/hash.js';
import { UploadPaperSchema } from '../lib/validation.js';

console.log('=== PAPERMD OFFLINE DEEP AUDIT & TEST SUITE ===');

// Test 1: SHA-256 Buffer Hash Determinism
const buffer1 = Buffer.from('Medical Question Paper Test Content 2026');
const buffer2 = Buffer.from('Medical Question Paper Test Content 2026');
const hash1 = calculateBufferHash(buffer1);
const hash2 = calculateBufferHash(buffer2);

console.log('1. SHA-256 Hash Determinism Check:');
console.log('   Hash 1:', hash1);
console.log('   Hash 2:', hash2);
if (hash1 === hash2 && hash1.length === 64) {
  console.log('   [PASS] SHA-256 hash is deterministic and valid hex length.');
} else {
  console.error('   [FAIL] Hash calculation failed integrity check.');
  process.exit(1);
}

// Test 2: Validation Schema Rules
console.log('\n2. Validation Schema Invariant Check:');
try {
  UploadPaperSchema.parse({
    title: 'Anatomy Paper I 2025',
    subject_id: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    exam_type_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    mbbs_year: '1st MBBS',
    exam_attempt: 'Main Examination',
    exam_year: 2025,
    academic_year: '2024-2025',
    description: 'Valid paper metadata',
  });
  console.log('   [PASS] Valid upload metadata parsed successfully.');
} catch (err) {
  console.error('   [FAIL] Valid metadata failed Zod validation:', err);
  process.exit(1);
}

try {
  UploadPaperSchema.parse({
    title: '',
    subject_id: 'invalid-uuid',
    exam_type_id: 'invalid-uuid',
    mbbs_year: '5th MBBS', // Invalid
    exam_year: 1800, // Invalid year
  });
  console.error('   [FAIL] Invalid metadata bypassed Zod validation!');
  process.exit(1);
} catch (err) {
  console.log('   [PASS] Invalid metadata correctly rejected by Zod schema.');
}

console.log('\n=== ALL OFFLINE INTEGRITY CHECKS PASSED ===');
