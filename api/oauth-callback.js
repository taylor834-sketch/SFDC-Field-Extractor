export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, clientId, redirectUri, loginUrl, codeVerifier } = req.body;

    if (!code || !clientId || !redirectUri || !codeVerifier) {
      return res.status(400).json({
        error: 'Missing required parameters'
      });
    }

    const tokenUrl = `${loginUrl}/services/oauth2/token`;

    // Exchange authorization code for access token
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: clientId,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OAuth token exchange failed:', data);
      return res.status(response.status).json({
        error: data.error_description || data.error || 'Token exchange failed'
      });
    }

    // Return the token data to the client
    return res.status(200).json(data);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
