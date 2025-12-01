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
    const { code, clientId, redirectUri, loginUrl } = req.body;

    console.log('OAuth callback received:', {
      hasCode: !!code,
      hasClientId: !!clientId,
      hasRedirectUri: !!redirectUri,
      hasLoginUrl: !!loginUrl
    });

    if (!code || !clientId || !redirectUri) {
      const missing = [];
      if (!code) missing.push('code');
      if (!clientId) missing.push('clientId');
      if (!redirectUri) missing.push('redirectUri');

      return res.status(400).json({
        error: 'Missing required parameters',
        missing: missing
      });
    }

    // Get client secret from environment variable
    const clientSecret = process.env.SALESFORCE_CONSUMER_SECRET;
    if (!clientSecret) {
      console.error('SALESFORCE_CONSUMER_SECRET not configured');
      return res.status(500).json({
        error: 'Server configuration error'
      });
    }

    const tokenUrl = `${loginUrl}/services/oauth2/token`;

    // Exchange authorization code for access token (Web Server Flow)
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri
    });

    console.log('Requesting token from:', tokenUrl);
    console.log('Request params:', {
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code_length: code?.length,
      has_client_secret: !!clientSecret
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    console.log('Salesforce response status:', response.status);

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
