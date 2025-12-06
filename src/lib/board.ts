import { hash, compare } from "bcrypt";
import { randomBytes } from "crypto";

const SHARE_CODE_LENGTH = 8;
const BCRYPT_ROUNDS = 10;

/**
 * Generate a unique share code for a board
 */
export function generateShareCode(): string {
  return randomBytes(SHARE_CODE_LENGTH / 2)
    .toString("hex")
    .slice(0, SHARE_CODE_LENGTH)
    .toUpperCase();
}

/**
 * Hash a board password
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify a board password against its hash
 */
export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return compare(password, passwordHash);
}

/**
 * Generate a default board password if none provided
 */
export function generateDefaultPassword(): string {
  return randomBytes(6).toString("hex");
}
