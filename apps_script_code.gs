// Google Apps Script for Wedding RSVP Form
// This script receives form submissions and writes them to Google Sheets
// Will accept responses until May 31, 2027

// Configuration
const SPREADSHEET_ID = '18cF9RFS6Y1uLCwHTIkn_t-emyjLebvKiBhdSicXXbb0';
const SHEET_NAME = 'Sheet1'; // Try default sheet name
const CUTOFF_DATE = new Date('2027-05-31T23:59:59'); // May 31, 2027

function doGet(e) {
  return HtmlService.createHtmlOutput('Wedding RSVP Web App - Active until May 31, 2027');
}

function doPost(e) {
  try {
    // Check if we're past the cutoff date
    const now = new Date();
    if (now > CUTOFF_DATE) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error', 
        message: 'RSVP submission period has ended. The cutoff date was May 31, 2027.'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get the spreadsheet and sheet by index (gid=0 means first sheet)
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheets()[0]; // Get first sheet by index
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error', 
        message: 'Could not access the first sheet in the spreadsheet'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get form data
    const params = e.parameter;
    const timestamp = new Date();
    
    // Map your form fields to sheet columns
    // Based on your existing sheet structure
    const rowData = [
      timestamp, // Timestamp column
      params.name || '',
      params.email || '',
      params.phone || '',
      params.attending || '',
      params.invitation_preference || '',
      params.bringing_plus_one || '',
      params.plus_one_name || '',
      params.additional_guests || '',
      params.submitted_at || timestamp.toISOString(),
      params.source || 'wedding_website'
    ];
    
    // Add row to sheet
    sheet.appendRow(rowData);
    
    // Format the timestamp column
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    
    // Auto-resize columns for better viewing
    sheet.autoResizeColumns(1, sheet.getLastColumn());
    
    // Log the submission for debugging
    Logger.log('New RSVP submission from: ' + (params.name || 'Unknown'));
    Logger.log('Email: ' + (params.email || 'Not provided'));
    Logger.log('Attending: ' + (params.attending || 'Not specified'));
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success', 
      message: 'RSVP submitted successfully',
      timestamp: timestamp.toISOString(),
      row: lastRow
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    Logger.log('Parameters received: ' + JSON.stringify(e.parameter));
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error', 
      message: 'Failed to process RSVP: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Function to check if form is still accepting responses
function checkFormStatus() {
  const now = new Date();
  const isActive = now <= CUTOFF_DATE;
  
  return {
    active: isActive,
    cutoffDate: CUTOFF_DATE.toISOString(),
    currentDate: now.toISOString(),
    daysRemaining: Math.ceil((CUTOFF_DATE - now) / (1000 * 60 * 60 * 24))
  };
}

// Function to get current submissions count
function getSubmissionCount() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = spreadsheet.getSheets();
    const sheet = sheets.length > 0 ? sheets[0] : null; // Get first sheet
    
    if (!sheet) return { count: 0, error: 'No sheets found in spreadsheet' };
    
    const lastRow = sheet.getLastRow();
    const headerRow = 1; // Assuming headers are in row 1
    const submissionCount = Math.max(0, lastRow - headerRow);
    
    return { 
      count: submissionCount, 
      lastRow: lastRow,
      sheetName: sheet.getName() // Get actual sheet name
    };
  } catch (error) {
    return { count: 0, error: error.toString() };
  }
}

// Debug function to check sheet access
function debugSheetAccess() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('Spreadsheet ID: ' + SPREADSHEET_ID);
    Logger.log('Spreadsheet name: ' + spreadsheet.getName());
    
    const sheets = spreadsheet.getSheets();
    Logger.log('Number of sheets: ' + sheets.length);
    
    sheets.forEach((sheet, index) => {
      Logger.log('Sheet ' + index + ': ' + sheet.getName() + ' (gid: ' + sheet.getSheetId() + ')');
    });
    
    if (sheets.length > 0) {
      const firstSheet = sheets[0];
      Logger.log('First sheet name: ' + firstSheet.getName());
      Logger.log('First sheet ID: ' + firstSheet.getSheetId());
      Logger.log('First sheet last row: ' + firstSheet.getLastRow());
      Logger.log('First sheet last column: ' + firstSheet.getLastColumn());
    }
    
    return { success: true, sheetCount: sheets.length };
  } catch (error) {
    Logger.log('Debug error: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

// Test function to verify the script works
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
    submitted_at: new Date().toISOString(),
    source: 'test'
  };
  
  const mockEvent = { parameter: testData };
  const result = doPost(mockEvent);
  
  Logger.log('Test submission result: ' + result.getContent());
  return result;
}

// Function to set up the sheet if needed
function setupSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      
      // Set up headers based on your form structure
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
        'Submitted At',
        'Source'
      ];
      
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.autoResizeColumns(1, headers.length);
      
      Logger.log('Sheet "' + SHEET_NAME + '" created with headers');
    } else {
      Logger.log('Sheet "' + SHEET_NAME + '" already exists');
    }
    
    return sheet;
  } catch (error) {
    Logger.log('Error setting up sheet: ' + error.toString());
    return null;
  }
}

// Function to get recent submissions (for monitoring)
function getRecentSubmissions(limit = 10) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = spreadsheet.getSheets();
    const sheet = sheets.length > 0 ? sheets[0] : null; // Get first sheet
    
    if (!sheet) return { submissions: [], error: 'No sheets found in spreadsheet' };
    
    const lastRow = sheet.getLastRow();
    const headerRow = 1;
    const startRow = Math.max(headerRow + 1, lastRow - limit + 1);
    
    if (startRow > lastRow) {
      return { submissions: [], count: 0 };
    }
    
    const range = sheet.getRange(startRow, 1, lastRow - startRow + 1, sheet.getLastColumn());
    const values = range.getValues();
    
    const submissions = values.map(row => ({
      timestamp: row[0] ? row[0].toString() : '',
      name: row[1] || '',
      email: row[2] || '',
      attending: row[4] || '',
      submitted_at: row[9] || ''
    }));
    
    return { 
      submissions: submissions.reverse(), // Most recent first
      count: submissions.length 
    };
  } catch (error) {
    return { submissions: [], error: error.toString() };
  }
}

// Add this to your script properties to track settings
function initializeScript() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('CUTOFF_DATE', CUTOFF_DATE.toISOString());
  scriptProperties.setProperty('SPREADSHEET_ID', SPREADSHEET_ID);
  scriptProperties.setProperty('SHEET_NAME', SHEET_NAME);
  scriptProperties.setProperty('INITIALIZED', new Date().toISOString());
  
  Logger.log('Script properties initialized');
}
