# Quick Start Guide

## Two Ways to Use This App

### 🌐 Option 1: Online (Recommended - No Setup Needed)

Simply visit: **https://taylor834-sketch.github.io/SFDC-Field-Extractor/**

- Works from any computer
- No server needed
- Always up to date
- Just bookmark it!

### 💻 Option 2: Run Locally on Your Computer

#### Easy Launch (Windows)

**Method 1: Desktop Shortcut**
1. Double-click `create-desktop-shortcut.vbs` (one-time setup)
2. A shortcut will appear on your desktop
3. Double-click the desktop shortcut anytime to launch the app
4. Your browser will open automatically

**Method 2: Direct Launch**
- Double-click `start.bat` in this folder
- The app will open in your browser

**To Stop the Server:**
- Close the command window (or press Ctrl+C)

## Connected App Setup

### Update Your Callback URLs

To use BOTH online and local versions, add both URLs to your Connected App:

1. Go to Salesforce Setup → App Manager
2. Find your "Field Analyzer" Connected App
3. Click the dropdown → View
4. Click "Manage Consumer Details"
5. Click "Edit Policies" or "Edit"
6. Under **Callback URL**, add BOTH:
   ```
   http://localhost:5173/SFDC-Field-Extractor/
   https://taylor834-sketch.github.io/SFDC-Field-Extractor/
   ```
   (Each on a new line)
7. Click Save

Now you can use your Client ID with both versions!

## First Time Login

1. Select your instance type (Production/Sandbox)
2. Enter your Connected App **Consumer Key** (Client ID)
3. Click "Login with Salesforce"
4. Authorize the app
5. You'll be redirected back and logged in!

## Usage

Once logged in:
1. **Select an Object** - Browse your custom Salesforce objects
2. **Analyze Fields** - Click "Analyze All Fields" to extract metadata
3. **Export Data** - Download results as CSV

## Troubleshooting

**Browser closes or doesn't open:**
- Manually open: http://localhost:5173/SFDC-Field-Extractor/

**"Server already running" error:**
- Another instance is already running
- Close all command windows and try again

**Need help?**
- Check the main README.md for detailed documentation
- Open an issue on GitHub
