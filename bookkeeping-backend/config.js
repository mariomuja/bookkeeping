// Configuration for BookKeeper Pro Backend

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'bookkeeping',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  
  // Use mock data if database is not available
  useMockData: process.env.USE_MOCK_DATA !== 'false',
  
  // Demo Organization ID
  demoOrgId: '550e8400-e29b-41d4-a716-446655440000',
};

