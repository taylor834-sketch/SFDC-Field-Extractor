import { useState, useEffect } from 'react';
import errorLogger from '../services/errorLogger';
import './ErrorLog.css';

function ErrorLog({ onClose }) {
  const [errors, setErrors] = useState([]);
  const [filter, setFilter] = useState('all'); // all, errors, info
  const [expandedError, setExpandedError] = useState(null);

  useEffect(() => {
    // Load initial errors
    setErrors(errorLogger.getErrors());

    // Subscribe to error updates
    const unsubscribe = errorLogger.subscribe((updatedErrors) => {
      setErrors(updatedErrors);
    });

    return () => unsubscribe();
  }, []);

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all error logs?')) {
      errorLogger.clearErrors();
    }
  };

  const handleExport = () => {
    const dataStr = errorLogger.exportErrors();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `error-log-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleExpanded = (errorId) => {
    setExpandedError(expandedError === errorId ? null : errorId);
  };

  const filteredErrors = errors.filter(error => {
    if (filter === 'all') return true;
    if (filter === 'errors') return !error.level || error.level === 'error';
    if (filter === 'info') return error.level === 'info';
    return true;
  });

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="error-log-container">
      <div className="error-log-header">
        <div className="error-log-title-section">
          <h2>Error Log</h2>
          <span className="error-count">{errors.length} entries</span>
        </div>
        <button onClick={onClose} className="error-log-close-button">
          Close
        </button>
      </div>

      <div className="error-log-controls">
        <div className="error-log-filters">
          <button
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({errors.length})
          </button>
          <button
            className={`filter-button ${filter === 'errors' ? 'active' : ''}`}
            onClick={() => setFilter('errors')}
          >
            Errors ({errors.filter(e => !e.level || e.level === 'error').length})
          </button>
          <button
            className={`filter-button ${filter === 'info' ? 'active' : ''}`}
            onClick={() => setFilter('info')}
          >
            Info ({errors.filter(e => e.level === 'info').length})
          </button>
        </div>

        <div className="error-log-actions">
          <button onClick={handleExport} className="action-button">
            Export
          </button>
          <button onClick={handleClearAll} className="action-button danger">
            Clear All
          </button>
        </div>
      </div>

      <div className="error-log-list">
        {filteredErrors.length === 0 ? (
          <div className="no-errors">
            <p>No error logs found</p>
          </div>
        ) : (
          filteredErrors.map((error) => (
            <div
              key={error.id}
              className={`error-entry ${error.level || 'error'} ${expandedError === error.id ? 'expanded' : ''}`}
              onClick={() => toggleExpanded(error.id)}
            >
              <div className="error-entry-header">
                <div className="error-entry-main">
                  <span className={`error-level-badge ${error.level || 'error'}`}>
                    {error.level === 'info' ? 'INFO' : 'ERROR'}
                  </span>
                  <span className="error-message">{error.message}</span>
                </div>
                <span className="error-timestamp">{formatTimestamp(error.timestamp)}</span>
              </div>

              {expandedError === error.id && (
                <div className="error-entry-details">
                  {error.stack && (
                    <div className="error-detail-section">
                      <h4>Stack Trace:</h4>
                      <pre className="error-stack">{error.stack}</pre>
                    </div>
                  )}

                  {error.context && Object.keys(error.context).length > 0 && (
                    <div className="error-detail-section">
                      <h4>Context:</h4>
                      <pre className="error-context">
                        {JSON.stringify(error.context, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ErrorLog;
