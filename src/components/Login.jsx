import { useState, useEffect } from 'react';
import salesforceService from '../services/salesforceService';
import './Login.css';

// Hardcoded Client ID for OAuth
const CLIENT_ID = '3MVG9dAEux2v1sLve6wdY22rLOsRdgF1W2jOgv53YJPFF19sULOhGzfa811jiDkGmkuoKPJiuFxjppiiTbPNo';

// LocalStorage keys
const STORAGE_KEY_INSTANCE_URL = 'sf_instance_url_saved';
const STORAGE_KEY_USERNAME = 'sf_username_saved';
const STORAGE_KEY_AUTH_TYPE = 'sf_auth_type';

function Login({ onLoginSuccess }) {
  const [authType, setAuthType] = useState('oauth'); // 'oauth' or 'password'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [instanceUrl, setInstanceUrl] = useState('https://login.salesforce.com');
  const [useCustomDomain, setUseCustomDomain] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load saved values from localStorage
  useEffect(() => {
    const savedInstanceUrl = localStorage.getItem(STORAGE_KEY_INSTANCE_URL);
    const savedUsername = localStorage.getItem(STORAGE_KEY_USERNAME);
    const savedAuthType = localStorage.getItem(STORAGE_KEY_AUTH_TYPE);

    if (savedAuthType) {
      setAuthType(savedAuthType);
    }

    if (savedInstanceUrl) {
      setInstanceUrl(savedInstanceUrl);
      // Check if it's a custom domain
      if (!savedInstanceUrl.includes('login.salesforce.com') && !savedInstanceUrl.includes('test.salesforce.com')) {
        setUseCustomDomain(true);
        setCustomDomain(savedInstanceUrl);
      }
    }

    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  // Handle username/password login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Determine the login URL to use
      let loginUrl = instanceUrl;
      if (useCustomDomain) {
        if (!customDomain) {
          setError('Please enter your My Domain URL');
          setIsLoading(false);
          return;
        }
        // Ensure it starts with https://
        loginUrl = customDomain.startsWith('https://') ? customDomain : `https://${customDomain}`;
        // Remove trailing slash if present
        loginUrl = loginUrl.replace(/\/$/, '');
      }

      console.log('Logging in to:', loginUrl);

      // Login with username and password
      await salesforceService.login(username, password, loginUrl);

      // Save preferences to localStorage
      localStorage.setItem(STORAGE_KEY_INSTANCE_URL, loginUrl);
      localStorage.setItem(STORAGE_KEY_USERNAME, username);
      localStorage.setItem(STORAGE_KEY_AUTH_TYPE, 'password');

      // Call success callback
      onLoginSuccess();
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

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

      // Save preferences to localStorage
      localStorage.setItem(STORAGE_KEY_INSTANCE_URL, loginUrl);
      localStorage.setItem(STORAGE_KEY_AUTH_TYPE, 'oauth');

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
          <span className="login-version">v2.1.0</span>
        </div>
        <p className="subtitle">Extract comprehensive field metadata and usage information</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="login-type-selector">
          <button
            type="button"
            className={`type-button ${authType === 'oauth' ? 'active' : ''}`}
            onClick={() => setAuthType('oauth')}
          >
            OAuth 2.0
          </button>
          <button
            type="button"
            className={`type-button ${authType === 'password' ? 'active' : ''}`}
            onClick={() => setAuthType('password')}
          >
            Username/Password
          </button>
        </div>

        {authType === 'password' ? (
          <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="user@example.com"
              className="form-input"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password + Security Token"
              className="form-input"
              disabled={isLoading}
            />
            <small className="form-hint">
              For API access, append your security token to your password
            </small>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={useCustomDomain}
                onChange={(e) => setUseCustomDomain(e.target.checked)}
                style={{ marginRight: '8px' }}
                disabled={isLoading}
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
                disabled={isLoading}
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
                placeholder="https://yourcompany.my.salesforce.com"
                className="form-input"
                disabled={isLoading}
              />
              <small className="form-hint">
                Enter your full My Domain URL (e.g., https://acme.my.salesforce.com)
              </small>
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login to Salesforce'}
          </button>

          <div className="login-info">
            <p>
              <strong>No setup required!</strong> Just enter your Salesforce credentials and start analyzing fields.
            </p>
          </div>
        </form>
        ) : (
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
                  placeholder="https://yourcompany.my.salesforce.com"
                  className="form-input"
                />
                <small className="form-hint">
                  Enter your full My Domain URL (e.g., https://acme.my.salesforce.com)
                </small>
              </div>
            )}

            <button
              onClick={handleOAuthLogin}
              className="login-button"
            >
              Login with Salesforce OAuth
            </button>

            <div className="login-info">
              <p>
                <strong>Note:</strong> OAuth requires a Connected App in your Salesforce org.
                <a href="https://github.com/taylor834-sketch/SFDC-Field-Extractor#setup" target="_blank" rel="noopener noreferrer" style={{ marginLeft: '5px' }}>
                  Setup Instructions
                </a>
              </p>
            </div>
          </div>
        )}

        <div className="login-footer">
          <p>
            {authType === 'password' ? (
              <a href="https://help.salesforce.com/s/articleView?id=000385436&type=1" target="_blank" rel="noopener noreferrer">
                How to get your Security Token
              </a>
            ) : (
              <a href="https://github.com/taylor834-sketch/SFDC-Field-Extractor#setup" target="_blank" rel="noopener noreferrer">
                View OAuth Setup Instructions
              </a>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
