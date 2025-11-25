import { useState, useEffect } from 'react';
import salesforceService from '../services/salesforceService';
import './FieldAnalyzer.css';

function FieldAnalyzer({ selectedObject, onBack }) {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyzingFields, setAnalyzingFields] = useState(false);
  const [fieldUsageData, setFieldUsageData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('fieldName');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    loadFields();
  }, [selectedObject]);

  const loadFields = async () => {
    setLoading(true);
    setError('');

    try {
      const customFields = await salesforceService.getFieldsForObject(selectedObject.name);
      setFields(customFields);
    } catch (err) {
      setError('Failed to load fields: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeAllFields = async () => {
    setAnalyzingFields(true);
    setError('');

    try {
      const usageData = await salesforceService.getAllFieldsUsageData(selectedObject.name);
      setFieldUsageData(usageData);
    } catch (err) {
      setError('Failed to analyze fields: ' + err.message);
    } finally {
      setAnalyzingFields(false);
    }
  };

  const exportToCSV = () => {
    if (fieldUsageData.length === 0) {
      alert('Please analyze fields first before exporting');
      return;
    }

    const headers = [
      'Field Name',
      'Field Label',
      'Type',
      'Created Date',
      'Created By',
      'Population %',
      'Page Layouts',
      '# Flows',
      'Flow Names',
      '# Reports',
      'Report Names'
    ];

    const rows = fieldUsageData.map(field => {
      const fieldInfo = fields.find(f => f.name === field.fieldName);
      return [
        field.fieldName,
        fieldInfo?.label || '',
        fieldInfo?.type || '',
        field.metadata?.CreatedDate ? new Date(field.metadata.CreatedDate).toLocaleDateString() : '',
        field.metadata?.CreatedBy?.Name || '',
        field.populationPercentage + '%',
        field.layoutCount,
        field.flowCount,
        field.flows?.map(f => f.ActiveVersion?.MasterLabel).filter(Boolean).join('; ') || '',
        field.reportCount,
        field.reports?.map(r => r.Name).filter(Boolean).join('; ') || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedObject.name}_field_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedAndFilteredData = () => {
    let data = fieldUsageData.filter(field => {
      const fieldInfo = fields.find(f => f.name === field.fieldName);
      return (
        field.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fieldInfo?.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    data.sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case 'fieldName':
          aVal = a.fieldName;
          bVal = b.fieldName;
          break;
        case 'population':
          aVal = parseFloat(a.populationPercentage) || 0;
          bVal = parseFloat(b.populationPercentage) || 0;
          break;
        case 'flows':
          aVal = a.flowCount;
          bVal = b.flowCount;
          break;
        case 'reports':
          aVal = a.reportCount;
          bVal = b.reportCount;
          break;
        case 'layouts':
          aVal = a.layoutCount;
          bVal = b.layoutCount;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
    });

    return data;
  };

  if (loading) {
    return (
      <div className="field-analyzer-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading fields for {selectedObject.label}...</p>
        </div>
      </div>
    );
  }

  if (error && fields.length === 0) {
    return (
      <div className="field-analyzer-container">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadFields} className="retry-button">
            Retry
          </button>
          <button onClick={onBack} className="back-button">
            Back to Objects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="field-analyzer-container">
      <div className="analyzer-header">
        <button onClick={onBack} className="back-button">
          ← Back to Objects
        </button>
        <div className="header-info">
          <h2>{selectedObject.label} Fields</h2>
          <p>{fields.length} custom field{fields.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="header-actions">
          <button
            onClick={analyzeAllFields}
            className="analyze-button"
            disabled={analyzingFields || fields.length === 0}
          >
            {analyzingFields ? 'Analyzing...' : 'Analyze All Fields'}
          </button>
          {fieldUsageData.length > 0 && (
            <button onClick={exportToCSV} className="export-button">
              Export to CSV
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {analyzingFields && (
        <div className="progress-banner">
          <div className="spinner-small"></div>
          Analyzing field usage across flows, reports, and page layouts...
        </div>
      )}

      {fieldUsageData.length > 0 ? (
        <>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search fields..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="table-container">
            <table className="fields-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('fieldName')} className="sortable">
                    Field Name {sortField === 'fieldName' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Label</th>
                  <th>Type</th>
                  <th>Created Date</th>
                  <th>Created By</th>
                  <th onClick={() => handleSort('population')} className="sortable">
                    Population % {sortField === 'population' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('layouts')} className="sortable">
                    Layouts {sortField === 'layouts' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('flows')} className="sortable">
                    Flows {sortField === 'flows' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('reports')} className="sortable">
                    Reports {sortField === 'reports' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {getSortedAndFilteredData().map(field => {
                  const fieldInfo = fields.find(f => f.name === field.fieldName);
                  return (
                    <tr key={field.fieldName}>
                      <td className="field-name">{field.fieldName}</td>
                      <td>{fieldInfo?.label || '-'}</td>
                      <td>{fieldInfo?.type || '-'}</td>
                      <td>
                        {field.metadata?.CreatedDate
                          ? new Date(field.metadata.CreatedDate).toLocaleDateString()
                          : '-'}
                      </td>
                      <td>{field.metadata?.CreatedBy?.Name || '-'}</td>
                      <td>
                        <div className="population-cell">
                          <div className="population-bar">
                            <div
                              className="population-fill"
                              style={{ width: `${field.populationPercentage}%` }}
                            ></div>
                          </div>
                          <span>{field.populationPercentage}%</span>
                        </div>
                      </td>
                      <td className="count-cell">{field.layoutCount}</td>
                      <td className="count-cell">
                        {field.flowCount > 0 ? (
                          <details className="usage-details">
                            <summary>{field.flowCount}</summary>
                            <ul>
                              {field.flows?.map((flow, idx) => (
                                <li key={idx}>{flow.ActiveVersion?.MasterLabel || flow.Id}</li>
                              ))}
                            </ul>
                          </details>
                        ) : (
                          0
                        )}
                      </td>
                      <td className="count-cell">
                        {field.reportCount > 0 ? (
                          <details className="usage-details">
                            <summary>{field.reportCount}</summary>
                            <ul>
                              {field.reports?.map((report, idx) => (
                                <li key={idx}>{report.Name || report.DeveloperName}</li>
                              ))}
                            </ul>
                          </details>
                        ) : (
                          0
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="no-analysis">
          <p>Click "Analyze All Fields" to extract usage data</p>
        </div>
      )}
    </div>
  );
}

export default FieldAnalyzer;
