import { createHash } from 'crypto';

/**
 * Calculates SHA-256 checksum hash of a Buffer or Uint8Array.
 */
export function calculateBufferHash(buffer: Buffer | Uint8Array): string {
  const hash = createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}
