// AES-256-GCM encryption for BYOK API keys
// Keys are encrypted server-side (API routes / Edge Functions) and never accessible to browser JS

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

function getEncryptionKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Missing encryption key');
  // Use first 32 bytes of service role key as encryption key
  return key.substring(0, 32);
}

async function importKey(rawKey: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(rawKey.padEnd(32, '0').substring(0, 32));
  return crypto.subtle.importKey('raw', keyData, { name: ALGORITHM }, false, [
    'encrypt',
    'decrypt',
  ]);
}

export async function encryptApiKey(
  plaintext: string
): Promise<{ encrypted: string; iv: string }> {
  const key = await importKey(getEncryptionKey());
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoder = new TextEncoder();

  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(plaintext)
  );

  return {
    encrypted: Buffer.from(encrypted).toString('base64'),
    iv: Buffer.from(iv).toString('base64'),
  };
}

export async function decryptApiKey(
  encryptedBase64: string,
  ivBase64: string
): Promise<string> {
  const key = await importKey(getEncryptionKey());
  const iv = Buffer.from(ivBase64, 'base64');
  const encrypted = Buffer.from(encryptedBase64, 'base64');

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}
