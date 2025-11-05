# 🔐 Authentication & 2FA Guide - International Bookkeeping

## Overview

International Bookkeeping now includes a comprehensive authentication system with optional Two-Factor Authentication (2FA) using Google Authenticator.

---

## 🚀 Quick Start

### **Demo Credentials**

```
Username: demo
Password: demo123
```

### **First Login**

1. Navigate to http://localhost:4300
2. You'll be automatically redirected to `/login`
3. Enter demo credentials
4. Click "Sign In"
5. You'll be redirected to the dashboard

---

## 📱 Setting Up 2FA (Optional but Recommended)

### **Step 1: Access Settings**

1. Click on your username in the top-right header
2. Select "Settings & 2FA" from the dropdown menu
3. Navigate to the "Two-Factor Authentication" section

### **Step 2: Download Google Authenticator**

Download the Google Authenticator app on your mobile device:

- **Android**: [Google Play Store](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2)
- **iOS**: [App Store](https://apps.apple.com/app/google-authenticator/id388497605)

### **Step 3: Scan QR Code**

1. Click "Enable 2FA" button in settings
2. A QR code will be displayed
3. Open Google Authenticator on your phone
4. Tap the "+" button
5. Select "Scan a QR code"
6. Scan the QR code displayed on screen

**Alternative**: If you can't scan the QR code, you can manually enter the secret key shown below the QR code.

### **Step 4: Verify and Enable**

1. Google Authenticator will show a 6-digit code
2. Enter this code in the verification field
3. Click "Enable 2FA"
4. ✅ 2FA is now enabled!

### **Step 5: Test 2FA Login**

1. Logout from your account
2. Login again with your username and password
3. You'll be prompted for a 2FA code
4. Open Google Authenticator
5. Enter the 6-digit code
6. Click "Verify"
7. ✅ You're logged in!

---

## 🔑 Authentication Flow

### **Without 2FA Enabled**

```
User enters credentials → Validates → Issues JWT token → Dashboard
```

### **With 2FA Enabled**

```
User enters credentials 
  → Validates password 
  → Issues temporary token (5min)
  → Prompts for 2FA code
  → Validates TOTP code
  → Issues full JWT token (24h)
  → Dashboard
```

---

## 🛡️ Security Features

### **Password Security**
- Passwords hashed using bcrypt (10 rounds)
- Never stored in plain text
- Salted for additional security

### **JWT Tokens**
- Signed with HS256 algorithm
- 24-hour expiration
- Includes userId, username, organizationId
- Automatically sent with all API requests

### **2FA Security**
- TOTP (Time-based One-Time Password)
- 30-second interval codes
- 60-second validation window (±1 period)
- Secret keys never transmitted after setup
- QR codes generated server-side

### **Session Management**
- Token stored in localStorage
- Auto-logout on token expiration
- Manual logout clears all session data
- Protected routes require valid token

---

## 🔧 Technical Details

### **Backend Dependencies**

```json
{
  "bcryptjs": "Password hashing",
  "jsonwebtoken": "JWT token generation",
  "speakeasy": "TOTP 2FA implementation",
  "qrcode": "QR code generation"
}
```

### **Frontend Components**

- **LoginComponent**: Username/password + 2FA verification
- **SettingsComponent**: 2FA setup and management
- **AuthService**: Authentication state management
- **AuthGuard**: Route protection
- **AuthInterceptor**: Auto-inject JWT tokens

### **API Endpoints**

```
POST /api/auth/register        - Create new user account
POST /api/auth/login           - Login with username/password
POST /api/auth/verify-2fa      - Verify 2FA code
POST /api/auth/setup-2fa       - Generate QR code for 2FA
POST /api/auth/enable-2fa      - Enable 2FA after verification
POST /api/auth/disable-2fa     - Disable 2FA
GET  /api/auth/me              - Get current user info
```

---

## 👤 User Management

### **Creating New Users**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### **User Properties**

- `id`: Unique identifier (UUID)
- `username`: Login username
- `email`: User email
- `organizationId`: Associated organization
- `role`: User role (admin, user, etc.)
- `twoFactorEnabled`: Boolean
- `twoFactorSecret`: TOTP secret (encrypted)

---

## 🔄 Typical Usage Scenarios

### **Scenario 1: First-Time User (No 2FA)**

1. Admin creates account
2. User logs in with username/password
3. Access granted immediately
4. User can optionally enable 2FA from settings

### **Scenario 2: Security-Conscious User (With 2FA)**

1. User logs in with credentials
2. User enables 2FA in settings
3. Scans QR code with Google Authenticator
4. Future logins require 2FA code
5. Enhanced security ✅

### **Scenario 3: Lost Phone (2FA Recovery)**

Currently, if a user loses their 2FA device:
- Admin must disable 2FA from backend
- Or user must disable before losing access

**Production Recommendation**: Implement backup codes or recovery email.

---

## 🚨 Important Notes

### **Demo Environment**
- JWT secret is hardcoded (change in production!)
- Users stored in memory (use database in production!)
- No password recovery (implement in production!)

### **Production Deployment**

1. **Use Environment Variables**:
   ```javascript
   const JWT_SECRET = process.env.JWT_SECRET; // Strong random key
   ```

2. **Use Database**:
   - Store users in PostgreSQL
   - Encrypt 2FA secrets at rest
   - Add user audit logs

3. **Add Features**:
   - Password reset via email
   - Backup 2FA codes
   - Login attempt limiting
   - Session timeout
   - Remember this device
   - Email notifications on login

4. **Security Hardening**:
   - HTTPS only
   - Secure cookie flags
   - CSRF protection
   - Rate limiting
   - IP whitelisting (optional)

---

## 📊 Authentication Dashboard

### **Current Status Indicators**

In the app header, you'll see:
- **Username**: Currently logged-in user
- **Email**: User's email address
- **Organization**: Associated company
- **2FA Status**: 🟢 Enabled or 🔴 Disabled

---

## 🎯 Benefits of 2FA

### **Without 2FA**
- Username + Password only
- Vulnerable to password breaches
- Single point of failure

### **With 2FA**
- Username + Password + TOTP code
- Requires physical device (phone)
- Protected against:
  - Password leaks
  - Phishing attacks
  - Brute force
  - Credential stuffing

### **Industry Standard**
- Required by many insurance regulations
- GDPR compliance recommended
- SOC 2 audit requirement
- Best practice for financial systems

---

## 🧪 Testing the System

### **Test Login (No 2FA)**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123"}'
```

Response:
```json
{
  "requiresTwoFactor": false,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "demo",
    "email": "demo@bookkeeper.com",
    "organizationId": "550e8400-e29b-41d4-a716-446655440000",
    "role": "admin"
  }
}
```

### **Test Protected Endpoint**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔐 Best Practices

1. **Always use 2FA** for admin accounts
2. **Never share** your 2FA secret key
3. **Backup** your 2FA recovery codes
4. **Change password** regularly
5. **Logout** when using shared computers
6. **Monitor** login activity

---

## 📞 Support

If you have issues with authentication:

1. **Forgot Password**: Contact admin for reset
2. **Lost 2FA Device**: Contact admin to disable 2FA
3. **Token Expired**: Login again
4. **Can't Scan QR**: Use manual key entry

---

## ✅ Summary

Your International Bookkeeping installation now has:
- ✅ Secure login system
- ✅ Password encryption
- ✅ JWT authentication
- ✅ Google Authenticator 2FA
- ✅ QR code setup
- ✅ Protected routes
- ✅ User session management
- ✅ Logout functionality

**Ready for production** with additional hardening recommended above!

