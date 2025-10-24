// MongoDB URI utility functions
const MONGODB_BASE_URI = process.env.MONGODB_BASE_URI!;
const MONGODB_OPTIONS = process.env.MONGODB_OPTIONS || "";

if (!MONGODB_BASE_URI) {
  throw new Error("MONGODB_BASE_URI not found in .env");
}

/**
 * Constructs a MongoDB URI for a specific database
 * @param databaseName - The name of the database to connect to
 * @returns Complete MongoDB URI
 */
export function buildMongoURI(databaseName: string): string {
  return `${MONGODB_BASE_URI}/${databaseName}${MONGODB_OPTIONS}`;
}

/**
 * Constructs database name for a tenant
 * @param tenantId - The tenant ID (e.g., "ai", "sas", "company1")
 * @returns Database name (e.g., "ai_chatbot", "sas_chatbot", "company1_chatbot")
 */
export function buildTenantDatabaseName(tenantId: string): string {
  return `${tenantId}_chatbot`;
}

/**
 * Gets the credentials database name
 */
export function getCredentialsDatabase(): string {
  return process.env.CREDENTIALS_DATABASE || "admin_credentials";
}

/**
 * Gets all available tenant databases for superadmin access
 * This would typically query the credentials database to find all tenants
 */
export function getAllTenantDatabases(): string[] {
  // This will be populated dynamically by querying admin credentials
  // For now, return known databases
  return ["ai_chatbot", "sas_chatbot"]; // This should be dynamic in real implementation
}