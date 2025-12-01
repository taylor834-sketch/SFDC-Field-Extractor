import { useState, useEffect } from 'react';
import Login from './components/Login';
import ObjectSelector from './components/ObjectSelector';
import FieldAnalyzer from './components/FieldAnalyzer';
import ErrorLog from './components/ErrorLog';
import salesforceService from './services/salesforceService';
import errorLogger from './services/errorLogger';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showErrorLog, setShowErrorLog] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    // Check if already authenticated
    if (salesforceService.isConnected()) {
      setIsAuthenticated(true);
      setUserInfo(salesforceService.getUserInfo());
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Subscribe to error count updates
    const unsubscribe = errorLogger.subscribe((errors) => {
      setErrorCount(errors.length);
    });

    // Set initial error count
    setErrorCount(errorLogger.getErrorCount());

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setUserInfo(salesforceService.getUserInfo());
  };

  const handleLogout = () => {
    salesforceService.logout();
    setIsAuthenticated(false);
    setSelectedObject(null);
    setUserInfo(null);
  };

  const handleObjectSelected = (object) => {
    setSelectedObject(object);
  };

  const handleBackToObjects = () => {
    setSelectedObject(null);
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="app-title-section">
            <h1>Salesforce Field Analyzer</h1>
            <span className="app-version">v2.0.0</span>
          </div>
          {userInfo && (
            <div className="user-info">
              <span className="user-name">{userInfo.display_name || userInfo.username}</span>
              <button
                onClick={() => setShowErrorLog(true)}
                className="error-log-button"
                title="View Error Log"
              >
                Error Log {errorCount > 0 && <span className="error-badge">{errorCount}</span>}
              </button>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        {showErrorLog ? (
          <ErrorLog onClose={() => setShowErrorLog(false)} />
        ) : !selectedObject ? (
          <ObjectSelector onObjectSelected={handleObjectSelected} />
        ) : (
          <FieldAnalyzer
            selectedObject={selectedObject}
            onBack={handleBackToObjects}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Built with React and JSForce |{' '}
          <a
            href="https://github.com/taylor834-sketch/SFDC-Field-Extractor"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
