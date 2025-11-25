import { useState, useEffect } from 'react';
import salesforceService from '../services/salesforceService';
import './ObjectSelector.css';

function ObjectSelector({ onObjectSelected }) {
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedObject, setSelectedObject] = useState(null);

  useEffect(() => {
    loadObjects();
  }, []);

  const loadObjects = async () => {
    setLoading(true);
    setError('');

    try {
      const customObjects = await salesforceService.getCustomObjects();
      setObjects(customObjects);
    } catch (err) {
      setError('Failed to load objects: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleObjectSelect = (object) => {
    setSelectedObject(object);
    onObjectSelected(object);
  };

  const filteredObjects = objects.filter(obj =>
    obj.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obj.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="object-selector-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading objects from your Salesforce org...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="object-selector-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadObjects} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="object-selector-container">
      <div className="object-selector-header">
        <h2>Select an Object</h2>
        <p>Choose a Salesforce object to analyze its custom fields</p>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search objects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <span className="search-count">
          {filteredObjects.length} object{filteredObjects.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="objects-grid">
        {filteredObjects.map(obj => (
          <div
            key={obj.name}
            className={`object-card ${selectedObject?.name === obj.name ? 'selected' : ''}`}
            onClick={() => handleObjectSelect(obj)}
          >
            <div className="object-icon">
              {obj.label.charAt(0).toUpperCase()}
            </div>
            <div className="object-info">
              <h3>{obj.label}</h3>
              <p className="object-api-name">{obj.name}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredObjects.length === 0 && (
        <div className="no-results">
          <p>No objects found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}

export default ObjectSelector;
