# Google Sheets Integration Setup Guide

## Issue Fixed
Your Google Sheets wasn't updating because:
1. The Google Apps Script URL was corrupted/truncated
2. Using outdated JSONP method instead of modern fetch API
3. No proper error handling

## Setup Instructions

### Step 1: Create Google Apps Script

1. Go to [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Replace the default code with the script below
4. Save the project (Ctrl+S)

### Step 2: Apps Script Code

```javascript
// Google Apps Script for Wedding RSVP Form
// This script receives form submissions and writes them to Google Sheets

// Configuration
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Replace with your Google Sheet ID
const SHEET_NAME = 'RSVP_Responses'; // Name of the sheet tab

function doGet(e) {
  return HtmlService.createHtmlOutput('Wedding RSVP Web App');
}

function doPost(e) {
  try {
    // Get the spreadsheet and sheet
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      // Create sheet if it doesn't exist
      const newSheet = spreadsheet.insertSheet(SHEET_NAME);
      setupSheet(newSheet);
      return ContentService.createTextOutput(JSON.stringify({status: 'success', message: 'Sheet created and data added'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get form data
    const params = e.parameter;
    const timestamp = new Date();
    
    // Prepare row data
    const rowData = [
      timestamp,
      params.name || '',
      params.email || '',
      params.phone || '',
      params.attending || '',
      params.invitation_preference || '',
      params.bringing_plus_one || '',
      params.plus_one_name || '',
      params.additional_guests || '',
      params.timestamp || timestamp.toISOString(),
      params.source || 'wedding_website'
    ];
    
    // Add row to sheet
    sheet.appendRow(rowData);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success', 
      message: 'RSVP submitted successfully',
      row: rowData.length
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error', 
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function setupSheet(sheet) {
  // Set up headers if sheet is new
  const headers = [
    'Timestamp',
    'Name',
    'Email',
    'Phone',
    'Attending',
    'Invitation Preference',
    'Bringing Plus One',
    'Plus One Name',
    'Additional Guests',
    'Submission Timestamp',
    'Source'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.autoResizeColumns();
}

// Test function
function testSubmission() {
  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '1234567890',
    attending: 'yes',
    invitation_preference: 'email',
    bringing_plus_one: 'no',
    plus_one_name: '',
    additional_guests: 'no',
    timestamp: new Date().toISOString(),
    source: 'test'
  };
  
  const mockEvent = { parameter: testData };
  return doPost(mockEvent);
}
```

### Step 3: Deploy as Web App

1. In Google Apps Script, click "Deploy" → "New deployment"
2. Click the gear icon ⚙️ next to "Select type" and choose "Web app"
3. Configure:
   - **Description**: Wedding RSVP Form
   - **Execute as**: Me (your Google account)
   - **Who has access**: Anyone (required for public website)
4. Click "Deploy"
5. **Copy the Web app URL** - this is what you need!

### Step 4: Update Your Website

1. Open your `script.js` file
2. Find line 518: `const GOOGLE_APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec';`
3. Replace `YOUR_SCRIPT_ID_HERE` with your actual Web app URL from Step 3

Example:
```javascript
const GOOGLE_APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby1234567890abcdef/exec';
```

### Step 5: Create Google Sheet

1. Create a new Google Sheet
2. Copy the spreadsheet ID from the URL (between `/d/` and `/edit`)
3. Update `SPREADSHEET_ID` in the Apps Script code
4. The script will automatically create the "RSVP_Responses" sheet with headers

### Step 6: Test

1. Open your website
2. Fill out the RSVP form
3. Check the browser console for success/error messages
4. Check your Google Sheet for new entries

## Troubleshooting

### Common Issues:

1. **"not_configured" error**: Web app URL not updated in script.js
2. **CORS errors**: Web app not deployed with "Anyone" access
3. **Permission errors**: Spreadsheet ID incorrect or not shared
4. **No data appearing**: Check browser console and Apps Script logs

### Debug Steps:

1. Open browser DevTools (F12)
2. Check Console tab for submission logs
3. In Google Apps Script, go to "Executions" to see error logs
4. Test the Apps Script directly using the "testSubmission" function

## Security Notes

- The Web app URL should be kept private
- Consider adding a simple API key for extra security
- Regularly check your Google Sheet for duplicate entries
- Monitor the Apps Script execution logs

## Alternative: Google Form Method

If Apps Script doesn't work, you can use Google Forms:

1. Create a Google Form with matching fields
2. Get the form's "formResponse" URL
3. Update the submission code to use the Form URL instead

Example Form URL structure:
```
https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse
```

Would you like me to help you set up the Google Form method as a backup?
