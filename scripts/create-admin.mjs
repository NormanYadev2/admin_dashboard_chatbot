// Run this script to create a test admin user in your admin_credentials database
// Usage: node scripts/create-admin.js

import { getAdminCredentialsModel } from '../src/lib/db/credentials.js';

async function createTestAdmin() {
  try {
    const AdminCredentials = await getAdminCredentialsModel();
    
    // Create a test admin user
    const testAdmin = new AdminCredentials({
      username: 'admin',
      password: 'admin123', // In production, hash this password!
      tenantId: 'sas',
      databaseName: 'sas_chatbot',
      role: 'admin',
      isActive: true,
    });

    await testAdmin.save();
    console.log('✅ Test admin created successfully!');
    console.log('Username: admin1');
    console.log('Password: admin123');
    console.log('Tenant: sas');
    console.log('Database: sas_chatbot');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test admin:', error);
    process.exit(1);
  }
}

createTestAdmin();