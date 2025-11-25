# Salesforce Field Analyzer

A powerful web application to extract and analyze comprehensive metadata and usage information for custom fields in Salesforce. Identify field dependencies, track usage across flows, reports, and page layouts, and make informed decisions about field cleanup and optimization.

## Features

- **Dual Authentication**: Login with username/password or OAuth/SSO
- **Object Selection**: Browse and select any custom object in your org
- **Comprehensive Field Analysis**: Extract detailed metadata for all custom fields including:
  - Field name, label, and type
  - Creation date and created by
  - Field population percentage
  - Number of page layouts using the field
  - Number and list of flows using the field
  - Number and list of reports using the field
- **Sorting & Filtering**: Sort by any column and search for specific fields
- **CSV Export**: Export all analysis data to CSV for further processing
- **Modern UI**: Clean, responsive interface built with React

## Demo

[View Live Demo](https://taylor834-sketch.github.io/SFDC-Field-Extractor)

## Setup Instructions

### 1. Create a Salesforce Connected App

To use OAuth authentication (recommended), you need to create a Connected App in Salesforce:

1. Log in to your Salesforce org
2. Go to **Setup** → **App Manager**
3. Click **New Connected App**
4. Fill in the required fields:
   - **Connected App Name**: Salesforce Field Analyzer
   - **API Name**: Salesforce_Field_Analyzer
   - **Contact Email**: your-email@example.com
5. Under **API (Enable OAuth Settings)**:
   - Check **Enable OAuth Settings**
   - **Callback URL**: `https://taylor834-sketch.github.io/SFDC-Field-Extractor/`
     - Add additional callback URLs if testing locally: `http://localhost:5173/`
   - **Selected OAuth Scopes**:
     - Full access (full)
     - Perform requests at any time (refresh_token, offline_access)
     - Access and manage your data (api)
6. Click **Save**
7. Click **Continue**
8. Copy the **Consumer Key** (Client ID) - you'll need this to log in

### 2. Configure API Access

Make sure your Salesforce user has the necessary permissions:
- Read access to custom objects and fields
- Read access to Flows, Reports, and Page Layouts
- Access to Tooling API

### 3. Deploy to GitHub Pages

1. Fork or clone this repository
2. Update the `base` path in `vite.config.js` if needed
3. Update the repository name in `package.json` if you renamed it
4. Run the deployment command:
   ```bash
   npm run deploy
   ```
5. Enable GitHub Pages in your repository settings:
   - Go to **Settings** → **Pages**
   - Set **Source** to `gh-pages` branch
   - Your app will be available at `https://taylor834-sketch.github.io/SFDC-Field-Extractor`

### 4. Update OAuth Callback URL

After deploying, make sure your Connected App callback URL matches your GitHub Pages URL.

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/taylor834-sketch/SFDC-Field-Extractor.git
   cd SFDC-Field-Extractor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## Usage Guide

### Login

**Option 1: Username/Password**
1. Select instance type (Production/Sandbox)
2. Enter your username
3. Enter your password followed by your security token
4. Click **Login**

**Option 2: OAuth/SSO**
1. Select instance type (Production/Sandbox)
2. Enter your Connected App Client ID
3. Click **Login with Salesforce**
4. Authorize the app in the Salesforce login window

### Analyze Fields

1. After login, you'll see a list of all custom objects in your org
2. Click on an object to view its custom fields
3. Click **Analyze All Fields** to extract usage data
   - This may take a few minutes depending on the number of fields
4. View the results in the table:
   - Sort by clicking column headers
   - Search for specific fields using the search box
   - Expand flow/report counts to see detailed lists
5. Click **Export to CSV** to download the analysis

## Technical Stack

- **React** - UI framework
- **JSForce** - Salesforce API client
- **Vite** - Build tool
- **GitHub Pages** - Hosting

## API Usage & Limitations

This app uses the following Salesforce APIs:
- **REST API** - For object and field metadata
- **Tooling API** - For detailed field information
- **Metadata API** - For page layout analysis

Be aware of Salesforce API limits:
- API calls are made on-demand when analyzing fields
- Large orgs with many fields may hit API limits
- Consider analyzing objects in batches if needed

## Security & Privacy

- All authentication happens directly with Salesforce
- No data is stored on external servers
- OAuth tokens are stored only in your browser session
- The app runs entirely client-side (no backend)

## Troubleshooting

### "OAuth2 not initialized" Error
- Make sure you've entered a valid Connected App Client ID
- Verify the callback URL in your Connected App matches your app URL

### "Invalid grant" Error
- Check that your callback URL is correctly configured
- Try logging out and logging in again
- Verify you're using the correct instance type (Production vs Sandbox)

### "Insufficient Privileges" Error
- Ensure your user has API access enabled
- Verify you have read permissions for the objects and fields
- Check that Tooling API access is enabled for your profile

### Fields Analysis Taking Too Long
- This is normal for objects with many fields
- The app queries flows, reports, and layouts for each field
- Consider analyzing a smaller subset of fields

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues, questions, or suggestions, please [open an issue](https://github.com/taylor834-sketch/SFDC-Field-Extractor/issues) on GitHub.

## Acknowledgments

Built with:
- [React](https://react.dev/)
- [JSForce](https://jsforce.github.io/)
- [Vite](https://vitejs.dev/)

---

**Note**: This is a community tool and is not affiliated with or supported by Salesforce.
