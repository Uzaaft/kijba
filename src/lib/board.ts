import { hash, compare } from "bcrypt";
import { randomBytes, createHmac } from "crypto";

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

/**
 * Generate a collaborator access token for a board
 * Token format: boardId.timestamp.signature
 */
export function generateCollaboratorToken(boardId: string): string {
  const secret = process.env.BETTER_AUTH_SECRET || "fallback-secret";
  const timestamp = Date.now().toString();
  const data = `${boardId}.${timestamp}`;
  const signature = createHmac("sha256", secret).update(data).digest("hex");
  return `${data}.${signature}`;
}

/**
 * Verify a collaborator access token
 * Returns boardId if valid, null otherwise
 */
export function verifyCollaboratorToken(token: string): string | null {
  try {
    const secret = process.env.BETTER_AUTH_SECRET || "fallback-secret";
    const parts = token.split(".");

    if (parts.length !== 3) return null;

    const [boardId, timestamp, signature] = parts;
    const data = `${boardId}.${timestamp}`;
    const expectedSignature = createHmac("sha256", secret)
      .update(data)
      .digest("hex");

    if (signature !== expectedSignature) return null;

    // Token is valid for 24 hours
    const tokenAge = Date.now() - parseInt(timestamp);
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    if (tokenAge > TWENTY_FOUR_HOURS) return null;

    return boardId;
  } catch {
    return null;
  }
}
