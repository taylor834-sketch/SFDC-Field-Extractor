import { useState, useEffect } from 'react';
import salesforceService from '../services/salesforceService';
import './Login.css';

// Hardcoded Client ID for the Connected App
const CLIENT_ID = '3MVG9dAEux2v1sLve6wdY22rLOsRdgF1W2jOgv53YJPFF19sULOhGzfa811jiDkGmkuoKPJiuFxjppiiTbPNo';

// LocalStorage key for instance URL
const STORAGE_KEY_INSTANCE_URL = 'sf_instance_url_saved';

function Login({ onLoginSuccess }) {
  const [instanceUrl, setInstanceUrl] = useState('https://login.salesforce.com');
  const [useCustomDomain, setUseCustomDomain] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  const [error, setError] = useState('');

  // Load saved instance URL from localStorage
  useEffect(() => {
    const savedInstanceUrl = localStorage.getItem(STORAGE_KEY_INSTANCE_URL);
    if (savedInstanceUrl) {
      setInstanceUrl(savedInstanceUrl);
      // Check if it's a custom domain
      if (!savedInstanceUrl.includes('login.salesforce.com') && !savedInstanceUrl.includes('test.salesforce.com')) {
        setUseCustomDomain(true);
        setCustomDomain(savedInstanceUrl);
      }
    }
  }, []);

  // Handle OAuth login
  const handleOAuthLogin = async () => {
    try {
      setError('');

      // Determine the login URL to use
      let loginUrl = instanceUrl;
      if (useCustomDomain) {
        if (!customDomain) {
          setError('Please enter your My Domain URL');
          return;
        }
        // Ensure it starts with https://
        loginUrl = customDomain.startsWith('https://') ? customDomain : `https://${customDomain}`;
        // Remove trailing slash if present
        loginUrl = loginUrl.replace(/\/$/, '');
      }

      console.log('Initiating OAuth flow...');
      console.log('Login URL:', loginUrl);

      // Save instance URL to localStorage for future use
      localStorage.setItem(STORAGE_KEY_INSTANCE_URL, loginUrl);

      // Store OAuth config in sessionStorage for callback
      sessionStorage.setItem('sf_client_id', CLIENT_ID);
      sessionStorage.setItem('sf_login_url', loginUrl);

      const redirectUri = window.location.origin + window.location.pathname;
      console.log('Redirect URI:', redirectUri);

      salesforceService.initializeOAuth(CLIENT_ID, redirectUri, loginUrl);
      const authUrl = await salesforceService.getAuthorizationUrl();
      console.log('Redirecting to:', authUrl);

      // Redirect to Salesforce login page
      window.location.href = authUrl;
    } catch (err) {
      console.error('OAuth initialization error:', err);
      setError('Error initializing OAuth: ' + err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-title-section">
          <h1>Salesforce Field Analyzer</h1>
          <span className="login-version">v1.0.0</span>
        </div>
        <p className="subtitle">Extract comprehensive field metadata and usage information</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="oauth-form">
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={useCustomDomain}
                onChange={(e) => setUseCustomDomain(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              I use My Domain (custom domain)
            </label>
          </div>

          {!useCustomDomain ? (
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
          ) : (
            <div className="form-group">
              <label htmlFor="customDomain">My Domain URL</label>
              <input
                id="customDomain"
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="https://fexa.my.salesforce.com"
                className="form-input"
              />
              <small className="form-hint">
                Enter your full My Domain URL (e.g., https://yourcompany.my.salesforce.com)
              </small>
            </div>
          )}

          <button
            onClick={handleOAuthLogin}
            className="login-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
              <path d="M12.015 2C6.502 2 2 6.502 2 12.015c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.137 20.193 22 16.44 22 12.015 22 6.502 17.498 2 12.015 2z"/>
            </svg>
            Login with Salesforce
          </button>

          <div className="login-info">
            <p>
              <strong>No setup required!</strong> Just select your instance type and login with your Salesforce credentials.
            </p>
          </div>
        </div>

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
