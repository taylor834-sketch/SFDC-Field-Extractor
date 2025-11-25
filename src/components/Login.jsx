import { useState, useEffect } from 'react';
import salesforceService from '../services/salesforceService';
import './Login.css';

// LocalStorage keys
const STORAGE_KEY_CLIENT_ID = 'sf_client_id_saved';
const STORAGE_KEY_INSTANCE_URL = 'sf_instance_url_saved';

function Login({ onLoginSuccess }) {
  const [instanceUrl, setInstanceUrl] = useState('https://login.salesforce.com');
  const [clientId, setClientId] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [error, setError] = useState('');

  // Load saved Client ID and instance URL from localStorage
  useEffect(() => {
    const savedClientId = localStorage.getItem(STORAGE_KEY_CLIENT_ID);
    const savedInstanceUrl = localStorage.getItem(STORAGE_KEY_INSTANCE_URL);

    if (savedClientId) {
      setClientId(savedClientId);
      console.log('Loaded saved Client ID from localStorage');
    } else {
      setShowSetup(true);
    }

    if (savedInstanceUrl) {
      setInstanceUrl(savedInstanceUrl);
    }
  }, []);

  // Handle OAuth login
  const handleOAuthLogin = async () => {
    if (!clientId) {
      setError('Please enter your Connected App Client ID');
      setShowSetup(true);
      return;
    }

    try {
      setError('');
      console.log('Initiating OAuth flow...');

      // Save Client ID and instance URL to localStorage for future use
      localStorage.setItem(STORAGE_KEY_CLIENT_ID, clientId);
      localStorage.setItem(STORAGE_KEY_INSTANCE_URL, instanceUrl);
      console.log('Saved Client ID to localStorage');

      // Store OAuth config in sessionStorage for callback
      sessionStorage.setItem('sf_client_id', clientId);
      sessionStorage.setItem('sf_login_url', instanceUrl);

      const redirectUri = window.location.origin + window.location.pathname;
      console.log('Redirect URI:', redirectUri);

      salesforceService.initializeOAuth(clientId, redirectUri, instanceUrl);
      const authUrl = await salesforceService.getAuthorizationUrl();
      console.log('Redirecting to:', authUrl);

      // Redirect to Salesforce login page
      window.location.href = authUrl;
    } catch (err) {
      console.error('OAuth initialization error:', err);
      setError('Error initializing OAuth: ' + err.message);
    }
  };

  // Clear saved credentials
  const handleClearCredentials = () => {
    localStorage.removeItem(STORAGE_KEY_CLIENT_ID);
    localStorage.removeItem(STORAGE_KEY_INSTANCE_URL);
    setClientId('');
    setInstanceUrl('https://login.salesforce.com');
    setShowSetup(true);
    setError('');
    console.log('Cleared saved credentials');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Salesforce Field Analyzer</h1>
        <p className="subtitle">Extract comprehensive field metadata and usage information</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="oauth-form">
          <div className="form-group">
            <label htmlFor="instanceUrl">Instance Type</label>
            <select
              id="instanceUrl"
              value={instanceUrl}
              onChange={(e) => setInstanceUrl(e.target.value)}
              className="form-input"
            >
              <option value="https://login.salesforce.com">Production/Developer</option>
              <option value="https://test.salesforce.com">Sandbox</option>
            </select>
          </div>

          {showSetup ? (
            <div className="form-group">
              <label htmlFor="clientId">Connected App Client ID</label>
              <input
                id="clientId"
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Enter your Connected App Client ID"
                className="form-input"
              />
              <small className="form-hint">
                Don't have a Client ID?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); setShowSetup(false); }}>
                  See setup instructions below
                </a>
              </small>
            </div>
          ) : (
            clientId && (
              <div className="saved-credentials">
                <div className="saved-info">
                  <span className="saved-label">✓ Client ID Saved</span>
                  <button onClick={() => setShowSetup(true)} className="change-button">
                    Change
                  </button>
                </div>
                <small className="form-hint">
                  Using saved credentials •{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); handleClearCredentials(); }}>
                    Clear saved data
                  </a>
                </small>
              </div>
            )
          )}

          <button
            onClick={handleOAuthLogin}
            className="login-button"
            disabled={!clientId}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
              <path d="M12.015 2C6.502 2 2 6.502 2 12.015c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.137 20.193 22 16.44 22 12.015 22 6.502 17.498 2 12.015 2z"/>
            </svg>
            Login with Salesforce
          </button>
        </div>

        {!showSetup && (
          <div className="setup-instructions">
            <h3>First Time Setup</h3>
            <p>To use this app, you need to create a Salesforce Connected App:</p>
            <ol>
              <li>Log in to your Salesforce org</li>
              <li>Go to <strong>Setup → App Manager → New Connected App</strong></li>
              <li>Fill in:
                <ul>
                  <li><strong>Connected App Name:</strong> Field Analyzer</li>
                  <li><strong>API Name:</strong> Field_Analyzer</li>
                  <li><strong>Contact Email:</strong> Your email</li>
                </ul>
              </li>
              <li>Check <strong>Enable OAuth Settings</strong></li>
              <li>Set <strong>Callback URL:</strong> <code>{window.location.origin + window.location.pathname}</code></li>
              <li>Select OAuth Scopes:
                <ul>
                  <li>Access and manage your data (api)</li>
                  <li>Perform requests at any time (refresh_token, offline_access)</li>
                </ul>
              </li>
              <li>Click <strong>Save</strong> and <strong>Continue</strong></li>
              <li>Copy the <strong>Consumer Key</strong> (Client ID)</li>
              <li>
                <button onClick={() => setShowSetup(true)} className="setup-button">
                  I have my Client ID
                </button>
              </li>
            </ol>
          </div>
        )}

        <div className="login-footer">
          <p>
            <a href="https://github.com/taylor834-sketch/SFDC-Field-Extractor#setup" target="_blank" rel="noopener noreferrer">
              View Full Documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
