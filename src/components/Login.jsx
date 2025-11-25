import { useState } from 'react';
import salesforceService from '../services/salesforceService';
import './Login.css';

function Login({ onLoginSuccess }) {
  const [loginType, setLoginType] = useState('credentials'); // 'credentials' or 'oauth'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [instanceUrl, setInstanceUrl] = useState('https://login.salesforce.com');
  const [clientId, setClientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle OAuth login
  const handleOAuthLogin = () => {
    try {
      setError('');
      // Store OAuth config in sessionStorage for callback
      sessionStorage.setItem('sf_client_id', clientId);
      sessionStorage.setItem('sf_login_url', instanceUrl);

      const redirectUri = window.location.origin + window.location.pathname;
      salesforceService.initializeOAuth(clientId, redirectUri, instanceUrl);
      const authUrl = salesforceService.getAuthorizationUrl();
      window.location.href = authUrl;
    } catch (err) {
      setError('Error initializing OAuth: ' + err.message);
    }
  };

  // Handle username/password login
  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await salesforceService.login(username, password, instanceUrl);
      onLoginSuccess();
    } catch (err) {
      setError('Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Salesforce Field Analyzer</h1>
        <p className="subtitle">Extract comprehensive field metadata and usage information</p>

        <div className="login-type-selector">
          <button
            className={`type-button ${loginType === 'credentials' ? 'active' : ''}`}
            onClick={() => setLoginType('credentials')}
          >
            Username/Password
          </button>
          <button
            className={`type-button ${loginType === 'oauth' ? 'active' : ''}`}
            onClick={() => setLoginType('oauth')}
          >
            OAuth/SSO
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loginType === 'credentials' ? (
          <form onSubmit={handleCredentialsLogin} className="login-form">
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

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="user@example.com"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password + Security Token</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="passwordSecurityToken"
                className="form-input"
                required
              />
              <small className="form-hint">
                Append your security token to your password
              </small>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <div className="oauth-form">
            <div className="form-group">
              <label htmlFor="oauthInstanceUrl">Instance Type</label>
              <select
                id="oauthInstanceUrl"
                value={instanceUrl}
                onChange={(e) => setInstanceUrl(e.target.value)}
                className="form-input"
              >
                <option value="https://login.salesforce.com">Production/Developer</option>
                <option value="https://test.salesforce.com">Sandbox</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="clientId">Connected App Client ID</label>
              <input
                id="clientId"
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Enter your Connected App Client ID"
                className="form-input"
                required
              />
              <small className="form-hint">
                You'll need to create a Connected App in Salesforce first
              </small>
            </div>

            <button
              onClick={handleOAuthLogin}
              className="login-button"
              disabled={!clientId}
            >
              Login with Salesforce
            </button>
          </div>
        )}

        <div className="login-footer">
          <p>
            Need help setting up OAuth?{' '}
            <a href="https://github.com/taylor834-sketch/SFDC-Field-Extractor#setup" target="_blank" rel="noopener noreferrer">
              View Documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
