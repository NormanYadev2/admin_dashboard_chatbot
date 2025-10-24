# Admin Management System

## System Architecture

### User Types

1. **Superadmin**
   - **No tenantId** - Can access ALL tenant databases
   - **No specific database** - Dynamically accesses all available databases
   - **Access Level:** Full system access across all tenants

2. **Regular Admins**
   - **Specific tenantId** - Tied to one tenant
   - **Specific database** - Access only their tenant's database
   - **Access Level:** Limited to their tenant's data only

### Environment Configuration

```bash
# Simplified .env structure
MONGODB_BASE_URI=mongodb+srv://Norman:Norman5161@cluster0.c5rormy.mongodb.net
MONGODB_OPTIONS=?retryWrites=true&w=majority&appName=Cluster0
CREDENTIALS_DATABASE=admin_credentials

# Superadmin (no tenant restrictions)
SUPER_ADMIN_USERNAME=superadmin
SUPER_ADMIN_PASSWORD=superadmin123
```

### Current Users

#### Superadmin
- **Username:** `superadmin`
- **Password:** `superadmin123`
- **TenantId:** `undefined` (no restriction)
- **Database Access:** ALL databases (`ai_chatbot`, `sas_chatbot`, `company1_chatbot`, etc.)

#### Admin1 (AI Tenant)
- **Username:** `admin1`
- **Password:** `admin1`
- **TenantId:** `ai`
- **Database Access:** `ai_chatbot` only

### Adding New Admins

To add a new admin for a different tenant, add to `admin_credentials.credentials`:

```javascript
// Example: SAS Company Admin
{
  "name": "SAS Admin",
  "username": "sas_admin",
  "password": "secure_password",
  "role": "admin",
  "tenantId": "sas",
  "isActive": true
}
// System automatically assigns database: sas_chatbot

// Example: Enterprise Company Admin  
{
  "name": "Enterprise Admin",
  "username": "enterprise_admin", 
  "password": "secure_password",
  "role": "admin",
  "tenantId": "enterprise",
  "isActive": true
}
// System automatically assigns database: enterprise_chatbot
```

### Database Access Logic

1. **Superadmin Login:**
   ```
   → Queries ALL tenant databases
   → Aggregates data from ai_chatbot, sas_chatbot, etc.
   → Returns combined results with database labels
   ```

2. **Regular Admin Login:**
   ```
   → Connects to specific tenant database (e.g., sas_chatbot)
   → Filters data by tenantId (e.g., tenantId: "sas")
   → Returns only tenant-specific data
   ```

### Benefits

- ✅ **Clean Separation:** Superadmin vs. tenant-specific access
- ✅ **No Tenant Pollution:** Superadmin has no artificial tenant restriction
- ✅ **Scalable:** Add new tenants without environment changes
- ✅ **Secure:** Each admin only sees their tenant's data
- ✅ **Dynamic:** Database names constructed automatically from tenant IDs