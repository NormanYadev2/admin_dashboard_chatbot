// MongoDB URI utility functions

/**
 * Get MongoDB base URI from environment with runtime check
 */
function getMongoDBBaseURI(): string {
  const baseUri = process.env.MONGODB_BASE_URI;
  if (!baseUri) {
    throw new Error("MONGODB_BASE_URI not found in .env");
  }
  return baseUri;
}

/**
 * Get MongoDB options from environment
 */
function getMongoDBOptions(): string {
  return process.env.MONGODB_OPTIONS || "";
}

/**
 * Constructs a MongoDB URI for a specific database
 * @param databaseName - The name of the database to connect to
 * @returns Complete MongoDB URI
 */
export function buildMongoURI(databaseName: string): string {
  const MONGODB_BASE_URI = getMongoDBBaseURI();
  const MONGODB_OPTIONS = getMongoDBOptions();
  return `${MONGODB_BASE_URI}/${databaseName}${MONGODB_OPTIONS}`;
}

/**
 * Constructs database name for a tenant
 * @param tenantId - The tenant ID (e.g., "ai", "sas", "vikasitha")
 * @returns Database name (e.g., "ai_chatbot", "sas_chatbot", "vikasitha_chatbot")
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