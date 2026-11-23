import { createHash } from 'node:crypto';

// Keep login case-insensitive while storing the username exactly as entered.
export function usernameKey(handle) {
  return createHash('sha256').update(handle.trim().normalize('NFC').toLowerCase()).digest('hex');
}
