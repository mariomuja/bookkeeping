const db = require('../_db');

module.exports = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-session-id'];
    
    if (!token) {
      return res.status(401).json({ valid: false, message: 'No token provided' });
    }

    // For demo user (token starts with 'demo_')
    if (token.startsWith('demo_')) {
      // Check if session exists in database
      try {
        const result = await db.query(
          'SELECT session_id, expires_at FROM demo_sessions WHERE session_id = $1',
          [token]
        );

        if (result.rows.length === 0) {
          return res.status(401).json({ valid: false, message: 'Session not found' });
        }

        const session = result.rows[0];
        const now = new Date();
        const expiresAt = new Date(session.expires_at);

        if (expiresAt < now) {
          // Clean up expired session
          await db.query('DELETE FROM demo_sessions WHERE session_id = $1', [token]);
          return res.status(401).json({ valid: false, message: 'Session expired' });
        }

        return res.status(200).json({ 
          valid: true, 
          sessionId: token,
          expiresAt: expiresAt.toISOString()
        });
      } catch (dbError) {
        console.error('[Validate] Database error:', dbError);
        // Fallback: if DB is unavailable, consider token valid for now
        return res.status(200).json({ valid: true, sessionId: token });
      }
    }

    // For regular users (would need JWT validation here)
    return res.status(200).json({ valid: true });
  } catch (error) {
    console.error('[Validate] Error:', error);
    res.status(500).json({ valid: false, error: error.message });
  }
};




