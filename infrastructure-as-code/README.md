# Infrastructure as Code

**Live Demo**: [https://international-bookkeeping.vercel.app](https://international-bookkeeping.vercel.app)

This directory contains infrastructure-as-code definitions for the International Bookkeeping application.

## Architecture Overview

The application uses a multi-platform infrastructure:

- **Frontend**: Deployed on Vercel (Angular application with serverless functions)
- **Backend**: Can be deployed on Azure App Service or Vercel serverless functions
- **Database**: PostgreSQL (Neon PostgreSQL or Azure PostgreSQL Flexible Server)

## Directory Structure

```
infrastructure-as-code/
├── terraform/          # Azure infrastructure definitions
│   ├── main.tf         # Main Terraform configuration
│   ├── variables.tf    # Variable definitions
│   ├── outputs.tf      # Output values
│   └── terraform.tfvars.example  # Example variable values
├── vercel/             # Vercel deployment configuration
│   └── vercel.json     # Vercel configuration
└── README.md           # This file
```

## Terraform (Azure Infrastructure)

### Prerequisites

1. **Terraform** >= 1.0 installed
2. **Azure Subscription** with appropriate permissions
3. **Service Principal** with Contributor role on the subscription

### Service Principal Setup

Create a Service Principal in Azure for Terraform authentication:

**Option 1: Using Azure Portal**
1. Go to Azure Portal → Azure Active Directory → App registrations
2. Click "New registration"
3. Name it (e.g., "terraform-bookkeeping")
4. Click "Register"
5. Note the **Application (client) ID** and **Directory (tenant) ID**
6. Go to "Certificates & secrets" → "New client secret"
7. Create a secret and note the **Value** (this is your client_secret)
8. Go to "API permissions" → "Add a permission" → "Microsoft Graph" → "Application permissions"
9. Add "Directory.Read.All" and grant admin consent
10. Go to Subscriptions → Your subscription → Access control (IAM)
11. Click "Add" → "Add role assignment"
12. Select "Contributor" role and assign to your Service Principal

**Option 2: Using Azure PowerShell**
```powershell
# Login to Azure
Connect-AzAccount

# Get subscription ID
$subscriptionId = (Get-AzSubscription).Id

# Create Service Principal
$sp = New-AzADServicePrincipal -DisplayName "terraform-bookkeeping" -Role "Contributor" -Scope "/subscriptions/$subscriptionId"

# Output credentials (save these securely!)
Write-Host "Subscription ID: $subscriptionId"
Write-Host "Client ID (Application ID): $($sp.AppId)"
Write-Host "Client Secret: $($sp.PasswordCredentials.SecretText)"
Write-Host "Tenant ID: $((Get-AzContext).Tenant.Id)"
```

### Setup

1. **Create terraform.tfvars file**:
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your Service Principal credentials
   ```

   **Alternative: Use Environment Variables** (recommended for CI/CD):
   ```bash
   # Windows PowerShell
   $env:ARM_SUBSCRIPTION_ID="your-subscription-id"
   $env:ARM_CLIENT_ID="your-client-id"
   $env:ARM_CLIENT_SECRET="your-client-secret"
   $env:ARM_TENANT_ID="your-tenant-id"
   
   # Linux/Mac
   export ARM_SUBSCRIPTION_ID="your-subscription-id"
   export ARM_CLIENT_ID="your-client-id"
   export ARM_CLIENT_SECRET="your-client-secret"
   export ARM_TENANT_ID="your-tenant-id"
   ```
   
   If using environment variables, set the authentication variables to `null` in `terraform.tfvars`:
   ```hcl
   subscription_id = null
   client_id       = null
   client_secret   = null
   tenant_id       = null
   ```

2. **Initialize Terraform**:
   ```bash
   cd terraform
   terraform init
   ```

3. **Review the plan**:
   ```bash
   terraform plan
   ```

4. **Apply the configuration**:
   ```bash
   terraform apply
   ```

   **Optional: Use deployment scripts** (helpers with validation):
   
   **Windows PowerShell:**
   ```powershell
   cd terraform
   .\deploy.ps1 -Action plan    # Review changes
   .\deploy.ps1 -Action apply   # Deploy infrastructure
   ```
   
   **Linux/Mac:**
   ```bash
   cd terraform
   chmod +x deploy.sh
   ./deploy.sh plan    # Review changes
   ./deploy.sh apply   # Deploy infrastructure
   ```

### Variables

Key variables to configure in `terraform.tfvars`:

- `subscription_id`: Azure subscription ID
- `client_id`: Service Principal Client ID
- `client_secret`: Service Principal Client Secret
- `tenant_id`: Azure Tenant ID
- `sql_admin_login`: PostgreSQL administrator username
- `sql_admin_password`: PostgreSQL administrator password
- `jwt_secret`: JWT secret for authentication
- `environment`: Environment name (dev, staging, prod)
- `location`: Azure region (default: West Europe)

### Resources Created

- **Resource Group**: Container for all resources
- **PostgreSQL Flexible Server**: Managed PostgreSQL database
- **PostgreSQL Database**: Application database
- **Storage Account**: General purpose storage
- **App Service Plan**: Hosting plan for backend API
- **Linux Web App**: Backend API application
- **Function App** (optional): Serverless functions

### Outputs

After applying, Terraform outputs:
- PostgreSQL connection details
- Backend API URL
- Storage account information
- Resource group name

## Vercel Configuration

The frontend is deployed to Vercel. Configuration is in `vercel/vercel.json`.

### Deployment

Vercel deployments are automatically triggered on git push to the main branch.

### Manual Deployment

```bash
cd bookkeeping-frontend
npm run build -- --configuration=production
vercel deploy --prebuilt --prod
```

## Environment Variables

### Frontend (Vercel)

Set in Vercel dashboard or via CLI:

- `DATABASE_URL`: PostgreSQL connection string (Neon or Azure)
- `JWT_SECRET`: JWT secret for authentication
- `NODE_ENV`: Environment (production)

### Backend (Azure App Service)

Configured via Terraform in App Service settings:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT secret
- `NODE_ENV`: Environment
- `CORS_ORIGIN`: Allowed CORS origins
- `SESSION_EXPIRY_HOURS`: Session expiration time

## Database Setup

### Initial Schema

After creating the PostgreSQL database, run the schema initialization:

```bash
# Using psql
psql $DATABASE_URL < database/bookkeeping-schema.sql

# Or using Node.js script
cd bookkeeping-frontend
node database/init.js
```

### Database Options

1. **Neon PostgreSQL** (Current): Serverless PostgreSQL
   - Connection string format: `postgresql://user:password@host/db?sslmode=require`

2. **Azure PostgreSQL Flexible Server** (Terraform):
   - Managed PostgreSQL with flexible configuration
   - Supports private endpoints and VNet integration

## Security Considerations

- **Secrets**: Never commit `terraform.tfvars` with real values
- **Firewall Rules**: Configure PostgreSQL firewall to allow only necessary IPs
- **SSL/TLS**: All connections use SSL/TLS encryption
- **CORS**: Configure CORS origins appropriately
- **JWT Secrets**: Use strong, randomly generated secrets

## Cost Optimization

- Use appropriate SKU sizes for your workload
- Consider using Azure PostgreSQL Basic tier for development
- Enable auto-shutdown for non-production environments
- Use consumption plan for Function Apps when possible

## Troubleshooting

### Terraform Issues

- **Authentication**: Verify Service Principal credentials are correct
- **Permissions**: Ensure Service Principal has Contributor role on subscription
- **Resource Names**: Some names must be globally unique
- **Subscription**: Verify subscription_id matches your Azure subscription

### Database Connection Issues

- **Firewall**: Check PostgreSQL firewall rules
- **SSL**: Ensure SSL mode is set correctly
- **Credentials**: Verify username and password

### Deployment Issues

- **Build Errors**: Check Node.js version compatibility
- **Environment Variables**: Verify all required variables are set
- **CORS**: Check CORS configuration matches frontend URL

## Maintenance

### Updates

1. Modify Terraform files as needed
2. Run `terraform plan` to review changes
3. Apply with `terraform apply`
4. Update documentation

### Backups

- PostgreSQL backups are configured automatically (7-day retention)
- Consider additional backup strategies for production

## Support

For issues or questions:
- Check Terraform documentation: https://registry.terraform.io/providers/hashicorp/azurerm
- Azure documentation: https://docs.microsoft.com/azure
- Vercel documentation: https://vercel.com/docs

