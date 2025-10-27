import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SALT_ROUNDS = 12;

/**
 * Get AUTH_KEY from environment variables with runtime check
 */
function getAuthKey(): string {
  const authKey = process.env.AUTH_KEY;
  if (!authKey) {
    throw new Error('AUTH_KEY is not configured in environment variables');
  }
  return authKey;
}

/**
 * Combines password with AUTH_KEY and hashes using bcrypt
 * @param plainPassword - The plain text password
 * @returns Promise<string> - The hashed password
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const AUTH_KEY = getAuthKey();
  
  // Combine password with AUTH_KEY for additional security
  const combinedPassword = plainPassword + AUTH_KEY;
  
  // Hash using bcrypt
  const hashedPassword = await bcrypt.hash(combinedPassword, SALT_ROUNDS);
  
  return hashedPassword;
}

/**
 * Verifies a plain password against a hashed password
 * @param plainPassword - The plain text password to verify
 * @param hashedPassword - The hashed password from database
 * @returns Promise<boolean> - True if passwords match
 */
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  const AUTH_KEY = getAuthKey();
  
  try {
    // Combine password with AUTH_KEY (same as during hashing)
    const combinedPassword = plainPassword + AUTH_KEY;
    
    // Verify using bcrypt
    const isMatch = await bcrypt.compare(combinedPassword, hashedPassword);
    
    return isMatch;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Utility function to check if a password is already hashed
 * @param password - The password string to check
 * @returns boolean - True if password appears to be hashed
 */
export function isPasswordHashed(password: string): boolean {
  // bcrypt hashes start with $2a$, $2b$, or $2y$ and are 60 characters long
  return /^\$2[aby]\$\d{2}\$.{53}$/.test(password);
}

/**
 * Migration utility: Hash existing plain text passwords
 * @param plainPassword - Plain text password from database
 * @returns Promise<string> - Hashed password
 */
export async function migratePassword(plainPassword: string): Promise<string> {
  // If already hashed, return as is
  if (isPasswordHashed(plainPassword)) {
    return plainPassword;
  }
  
  // Hash the plain password
  return await hashPassword(plainPassword);
}