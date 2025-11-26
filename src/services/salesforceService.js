import jsforce from 'jsforce';

class SalesforceService {
  constructor() {
    this.conn = null;
    this.oauth2 = null;
  }

  // Generate a random string for PKCE code verifier
  generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }

  // Base64 URL encode
  base64URLEncode(buffer) {
    const base64 = btoa(String.fromCharCode(...buffer));
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // Generate code challenge from verifier
  async generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return this.base64URLEncode(new Uint8Array(hash));
  }

  // Initialize OAuth2 connection
  initializeOAuth(clientId, redirectUri, loginUrl = 'https://login.salesforce.com') {
    this.oauth2 = new jsforce.OAuth2({
      clientId: clientId,
      redirectUri: redirectUri,
      loginUrl: loginUrl
    });
  }

  // Get authorization URL with PKCE
  async getAuthorizationUrl() {
    if (!this.oauth2) {
      throw new Error('OAuth2 not initialized');
    }

    // Generate PKCE code verifier and challenge
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);

    // Store code verifier for later use during token exchange
    sessionStorage.setItem('sf_code_verifier', codeVerifier);

    // Build authorization URL with PKCE parameters
    const authUrl = this.oauth2.getAuthorizationUrl({
      scope: 'api refresh_token offline_access',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    return authUrl;
  }

  // Authorize with OAuth code
  async authorizeWithCode(code) {
    if (!this.oauth2) {
      throw new Error('OAuth2 not initialized');
    }

    // Retrieve the code verifier from session storage
    const codeVerifier = sessionStorage.getItem('sf_code_verifier');
    if (!codeVerifier) {
      throw new Error('Code verifier not found. Please try logging in again.');
    }

    this.conn = new jsforce.Connection({ oauth2: this.oauth2 });

    // Authorize with the code and code verifier
    await this.conn.authorize(code, { code_verifier: codeVerifier });

    // Clean up the code verifier from session storage
    sessionStorage.removeItem('sf_code_verifier');

    return this.conn;
  }

  // Login with username and password
  async login(username, password, instanceUrl = 'https://login.salesforce.com') {
    console.log('[SalesforceService] Creating connection with loginUrl:', instanceUrl);
    this.conn = new jsforce.Connection({ loginUrl: instanceUrl });

    console.log('[SalesforceService] Attempting login...');
    try {
      const userInfo = await this.conn.login(username, password);
      console.log('[SalesforceService] Login successful, userInfo:', userInfo);
      return userInfo;
    } catch (error) {
      console.error('[SalesforceService] Login failed:', error);
      throw error;
    }
  }

  // Get all custom objects
  async getCustomObjects() {
    if (!this.conn) throw new Error('Not connected to Salesforce');

    const result = await this.conn.describeGlobal();
    return result.sobjects
      .filter(obj => obj.custom || obj.name.endsWith('__c'))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  // Get all fields for an object
  async getFieldsForObject(objectName) {
    if (!this.conn) throw new Error('Not connected to Salesforce');

    const describe = await this.conn.describe(objectName);
    return describe.fields.filter(field => field.custom || field.name.endsWith('__c'));
  }

  // Get field metadata including creation info
  async getFieldMetadata(objectName, fieldName) {
    if (!this.conn) throw new Error('Not connected to Salesforce');

    try {
      const query = `SELECT Id, DeveloperName, MasterLabel, DataType, CreatedDate, CreatedBy.Name,
                     LastModifiedDate, LastModifiedBy.Name
                     FROM CustomField
                     WHERE EntityDefinition.QualifiedApiName = '${objectName}'
                     AND QualifiedApiName = '${fieldName}'`;

      const result = await this.conn.tooling.query(query);
      return result.records[0];
    } catch (error) {
      console.error('Error fetching field metadata:', error);
      return null;
    }
  }

  // Get flows that use the field
  async getFlowsUsingField(objectName, fieldName) {
    if (!this.conn) throw new Error('Not connected to Salesforce');

    try {
      // Query for Flow Definitions that reference the field
      const query = `SELECT Id, ActiveVersion.MasterLabel, ActiveVersion.ApiName,
                     ActiveVersion.Description, ActiveVersion.VersionNumber
                     FROM FlowDefinition
                     WHERE ActiveVersion.ProcessType = 'Flow'
                     AND ActiveVersion.Status = 'Active'`;

      const result = await this.conn.tooling.query(query);

      // Filter flows that actually use the field (this requires parsing flow metadata)
      // For now, return all active flows - we'll enhance this later
      return result.records || [];
    } catch (error) {
      console.error('Error fetching flows:', error);
      return [];
    }
  }

  // Get reports that use the field
  async getReportsUsingField(objectName, fieldName) {
    if (!this.conn) throw new Error('Not connected to Salesforce');

    try {
      // Query reports that include this object
      const query = `SELECT Id, Name, DeveloperName, CreatedDate, LastModifiedDate
                     FROM Report
                     WHERE Format != 'Tabular'`;

      const result = await this.conn.query(query);

      // Filter reports that use the specific field
      // This is a simplified version - full implementation would parse report metadata
      return result.records || [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  }

  // Get page layouts that include the field
  async getPageLayoutsUsingField(objectName, fieldName) {
    if (!this.conn) throw new Error('Not connected to Salesforce');

    try {
      const query = `SELECT Id, Name, TableEnumOrId
                     FROM Layout
                     WHERE TableEnumOrId = '${objectName}'`;

      const result = await this.conn.tooling.query(query);

      // To check if field is on layout, we need to get layout metadata
      const layoutsWithField = [];
      for (const layout of result.records || []) {
        try {
          const layoutMetadata = await this.conn.metadata.read('Layout', `${objectName}-${layout.Name}`);
          // Check if field exists in layout (simplified check)
          if (layoutMetadata && layoutMetadata.layoutSections) {
            const hasField = JSON.stringify(layoutMetadata).includes(fieldName);
            if (hasField) {
              layoutsWithField.push(layout);
            }
          }
        } catch (err) {
          // Skip layouts we can't read
          console.warn(`Could not read layout ${layout.Name}:`, err.message);
        }
      }

      return layoutsWithField;
    } catch (error) {
      console.error('Error fetching page layouts:', error);
      return [];
    }
  }

  // Calculate field population percentage
  async getFieldPopulation(objectName, fieldName) {
    if (!this.conn) throw new Error('Not connected to Salesforce');

    try {
      // Get total records
      const totalQuery = `SELECT COUNT() FROM ${objectName}`;
      const totalResult = await this.conn.query(totalQuery);
      const totalRecords = totalResult.totalSize;

      if (totalRecords === 0) return 0;

      // Get populated records
      const populatedQuery = `SELECT COUNT() FROM ${objectName} WHERE ${fieldName} != null`;
      const populatedResult = await this.conn.query(populatedQuery);
      const populatedRecords = populatedResult.totalSize;

      return ((populatedRecords / totalRecords) * 100).toFixed(2);
    } catch (error) {
      console.error('Error calculating field population:', error);
      return 'N/A';
    }
  }

  // Get comprehensive field usage data
  async getFieldUsageData(objectName, fieldName) {
    if (!this.conn) throw new Error('Not connected to Salesforce');

    try {
      const [metadata, flows, reports, layouts, population] = await Promise.all([
        this.getFieldMetadata(objectName, fieldName),
        this.getFlowsUsingField(objectName, fieldName),
        this.getReportsUsingField(objectName, fieldName),
        this.getPageLayoutsUsingField(objectName, fieldName),
        this.getFieldPopulation(objectName, fieldName)
      ]);

      return {
        fieldName,
        objectName,
        metadata,
        flows: flows || [],
        flowCount: flows?.length || 0,
        reports: reports || [],
        reportCount: reports?.length || 0,
        layouts: layouts || [],
        layoutCount: layouts?.length || 0,
        populationPercentage: population
      };
    } catch (error) {
      console.error('Error getting field usage data:', error);
      throw error;
    }
  }

  // Get usage data for all custom fields on an object
  async getAllFieldsUsageData(objectName) {
    if (!this.conn) throw new Error('Not connected to Salesforce');

    const fields = await this.getFieldsForObject(objectName);
    const usageDataPromises = fields.map(field =>
      this.getFieldUsageData(objectName, field.name)
        .catch(error => {
          console.error(`Error getting usage for ${field.name}:`, error);
          return {
            fieldName: field.name,
            error: error.message
          };
        })
    );

    return await Promise.all(usageDataPromises);
  }

  // Check if connected
  isConnected() {
    return this.conn !== null;
  }

  // Get current user info
  getUserInfo() {
    return this.conn?.userInfo || null;
  }

  // Logout
  logout() {
    this.conn = null;
    this.oauth2 = null;
  }
}

export default new SalesforceService();
