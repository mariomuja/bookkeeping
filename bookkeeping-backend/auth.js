// Authentication Module
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// Secret key for JWT (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

// In-memory user storage (in production, use database)
const users = [];

// Initialize demo user
const initializeDemoUser = () => {
  const demoUser = {
    id: uuidv4(),
    username: 'demo',
    email: 'demo@bookkeeper.com',
    passwordHash: bcrypt.hashSync('DemoUser2025!Secure', 10),
    twoFactorSecret: null,
    twoFactorEnabled: false,
    organizationId: '550e8400-e29b-41d4-a716-446655440000',
    role: 'admin',
    createdAt: new Date(),
    lastLogin: null
  };
  
  users.push(demoUser);
  console.log('✓ Demo user created: username="demo", password="DemoUser2025!Secure"');
};

// Register new user
const registerUser = async (username, email, password) => {
  // Check if user already exists
  if (users.find(u => u.username === username || u.email === email)) {
    throw new Error('User already exists');
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Create user
  const user = {
    id: uuidv4(),
    username,
    email,
    passwordHash,
    twoFactorSecret: null,
    twoFactorEnabled: false,
    organizationId: '550e8400-e29b-41d4-a716-446655440000',
    role: 'user',
    createdAt: new Date(),
    lastLogin: null
  };
  
  users.push(user);
  
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    organizationId: user.organizationId,
    role: user.role
  };
};

// Login user (step 1: verify username and password)
const loginUser = async (username, password) => {
  const user = users.find(u => u.username === username);
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash);
  
  if (!isValid) {
    throw new Error('Invalid credentials');
  }
  
  // If 2FA is enabled, return temporary token
  if (user.twoFactorEnabled) {
    const tempToken = jwt.sign(
      { userId: user.id, temp: true },
      JWT_SECRET,
      { expiresIn: '5m' }
    );
    
    return {
      requiresTwoFactor: true,
      tempToken,
      username: user.username
    };
  }
  
  // No 2FA, return full token
  user.lastLogin = new Date();
  
  const token = jwt.sign(
    { userId: user.id, username: user.username, organizationId: user.organizationId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  
  return {
    requiresTwoFactor: false,
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role
    }
  };
};

// Verify 2FA token (step 2: verify TOTP code)
const verify2FA = async (tempToken, totpCode) => {
  try {
    // Verify temp token
    const decoded = jwt.verify(tempToken, JWT_SECRET);
    
    if (!decoded.temp) {
      throw new Error('Invalid token');
    }
    
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user || !user.twoFactorEnabled) {
      throw new Error('2FA not enabled');
    }
    
    // Verify TOTP code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: totpCode,
      window: 2
    });
    
    if (!verified) {
      throw new Error('Invalid 2FA code');
    }
    
    // Update last login
    user.lastLogin = new Date();
    
    // Generate full access token
    const token = jwt.sign(
      { userId: user.id, username: user.username, organizationId: user.organizationId },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        organizationId: user.organizationId,
        role: user.role
      }
    };
  } catch (error) {
    throw new Error('2FA verification failed');
  }
};

// Setup 2FA for user
const setup2FA = async (userId) => {
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `International Bookkeeping (${user.username})`,
    issuer: 'International Bookkeeping'
  });
  
  // Store secret (temporarily, until confirmed)
  user.twoFactorTempSecret = secret.base32;
  
  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
  
  return {
    secret: secret.base32,
    qrCode: qrCodeUrl
  };
};

// Enable 2FA after verification
const enable2FA = async (userId, totpCode) => {
  const user = users.find(u => u.id === userId);
  
  if (!user || !user.twoFactorTempSecret) {
    throw new Error('2FA setup not initialized');
  }
  
  // Verify the code
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorTempSecret,
    encoding: 'base32',
    token: totpCode,
    window: 2
  });
  
  if (!verified) {
    throw new Error('Invalid 2FA code');
  }
  
  // Move temp secret to permanent and enable 2FA
  user.twoFactorSecret = user.twoFactorTempSecret;
  user.twoFactorEnabled = true;
  delete user.twoFactorTempSecret;
  
  return { success: true };
};

// Disable 2FA
const disable2FA = async (userId, totpCode) => {
  const user = users.find(u => u.id === userId);
  
  if (!user || !user.twoFactorEnabled) {
    throw new Error('2FA not enabled');
  }
  
  // Verify the code before disabling
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: totpCode,
    window: 2
  });
  
  if (!verified) {
    throw new Error('Invalid 2FA code');
  }
  
  user.twoFactorSecret = null;
  user.twoFactorEnabled = false;
  
  return { success: true };
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.temp) {
      return res.status(401).json({ error: 'Temporary token cannot be used for API access' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Get user by ID
const getUserById = (userId) => {
  const user = users.find(u => u.id === userId);
  if (!user) return null;
  
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    organizationId: user.organizationId,
    role: user.role,
    twoFactorEnabled: user.twoFactorEnabled,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt
  };
};

module.exports = {
  initializeDemoUser,
  registerUser,
  loginUser,
  verify2FA,
  setup2FA,
  enable2FA,
  disable2FA,
  authenticateToken,
  getUserById,
  users
};

