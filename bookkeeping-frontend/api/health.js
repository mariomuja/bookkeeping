// Health check endpoint for Vercel Serverless
module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Bookkeeping Backend API - Vercel Serverless',
    version: '2.0',
    timestamp: new Date().toISOString(),
    dataStatus: {
      journalEntries: 0,
      accounts: 0
    }
  });
};


