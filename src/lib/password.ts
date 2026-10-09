import argon2 from "argon2";

/** Hash a plaintext password with argon2id. Verification is deferred to U1. */
export function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}
