import argon2 from "argon2";

/** Hash a plaintext password with argon2id. */
export function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

/** Verify a plaintext password against an argon2 hash. Returns false on a malformed hash rather than throwing. */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}
