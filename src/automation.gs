/**
 * AUTOMATED BANKING EXPENSE TRACKER
 * Google Apps Script for Gmail + Google Sheets Integration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet with 3 tabs: "Transactions", "Balance", "Settings"
 * 2. In Transactions sheet, add headers (Row 1):
 *    Date | Type | Amount | Party Name | Party VPA | Account | UPI Ref | Balance | Email Date
 * 3. In Balance sheet, add headers (Row 1):
 *    Date | Reported Balance | Calculated Balance | Difference | Status
 * 4. In Settings sheet, add:
 *    A1: "Last Balance"  B1: 0
 *    A2: "Last Updated"  B2: (leave empty)
 * 5. In Gmail, create filter: from:(alerts@hdfcbank.net) -> Apply label "BankAlerts"
 * 6. Replace SHEET_ID and ALERT_EMAIL below
 * 7. Go to Extensions > Apps Script > paste this code
 * 8. Set trigger: processNewBankEmails() every 1 minute
 */

// ============ CONFIGURATION ============
const CONFIG = {
  SHEET_ID: '1z7ccwqcm8KGcMdKvGfU61gUHkebPddM_OOcOMyKO0so', // Replace with your Google Sheet ID from URL
  GMAIL_LABEL: 'BankAlerts', // Gmail label for bank emails
  ALERT_EMAIL: 'hiteshpranavreddy.d@gmail.com', // Your email for mismatch alerts
  BALANCE_MISMATCH_THRESHOLD: 1.0, // Alert if difference > ₹1
  BANK_NAME: 'HDFC Bank'
};

// ============ MAIN FUNCTION ============
function processNewBankEmails() {
  try {
    const label = GmailApp.getUserLabelByName(CONFIG.GMAIL_LABEL);
    if (!label) {
      Logger.log('⚠️ Label not found. Create Gmail label: ' + CONFIG.GMAIL_LABEL);
      return;
    }
    
    // Get all threads with this label
    const threads = label.getThreads();
    let processedCount = 0;
    
    threads.forEach(thread => {
      const messages = thread.getMessages();
      messages.forEach(message => {
        // Process only unstarred (unprocessed) messages
        if (!message.isStarred()) {
          const success = processEmail(message);
          if (success) {
            message.star(); // Mark as processed
            processedCount++;
          }
        }
      });
    });
    
    Logger.log(`✅ Processed ${processedCount} new emails`);
    
  } catch (error) {
    Logger.log('❌ Error in processNewBankEmails: ' + error.toString());
    sendAlertEmail('Script Error', error.toString());
  }
}

// ============ EMAIL PROCESSING ============
function processEmail(message) {
  try {
    const subject = message.getSubject();
    const body = message.getPlainBody();
    const emailDate = message.getDate();
    
    Logger.log('Processing email: ' + subject);
    
    // Determine email type and parse accordingly
    if (body.includes('debited from account') || subject.includes('UPI txn')) {
      return parseDebitEmail(body, emailDate);
    } else if (body.includes('credited to your account')) {
      return parseCreditEmail(body, emailDate);
    } else if (body.includes('available balance in your account')) {
      return parseBalanceEmail(body, emailDate);
    } else {
      Logger.log('⚠️ Unknown email type');
      return false;
    }
    
  } catch (error) {
    Logger.log('❌ Error processing email: ' + error.toString());
    return false;
  }
}

// ============ DEBIT EMAIL PARSER ============
function parseDebitEmail(body, emailDate) {
  try {
    // Extract amount: Rs.1.00 has been debited
    const amountMatch = body.match(/Rs\.?([\d,]+\.?\d*)\s+has been debited/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
    
    // Extract account: from account 0682
    const accountMatch = body.match(/from account\s+(\w+)/i);
    const account = accountMatch ? accountMatch[1] : '';
    
    // Extract VPA: to VPA 901919083222@ibl
    const vpaMatch = body.match(/to VPA\s+([\w@.-]+)/i);
    const vpa = vpaMatch ? vpaMatch[1] : '';
    
    // Extract party name: MUNAGALA VENKATA RAMANAMMA
    const partyMatch = body.match(/to VPA\s+[\w@.-]+\s+(.+?)\s+on\s+\d/i);
    const partyName = partyMatch ? partyMatch[1].trim() : '';
    
    // Extract date: on 30-11-25
    const dateMatch = body.match(/on\s+([\d-]+)/);
    const txnDate = dateMatch ? formatDate(dateMatch[1]) : '';
    
    // Extract UPI reference: 114889065960
    const refMatch = body.match(/reference number is\s+(\d+)/i);
    const upiRef = refMatch ? refMatch[1] : '';
    
    // Log to sheet
    logTransaction({
      date: txnDate,
      type: 'DEBIT',
      amount: -amount, // Negative for debit
      partyName: partyName,
      partyVPA: vpa,
      account: account,
      upiRef: upiRef,
      emailDate: emailDate
    });
    
    Logger.log('✅ Debit transaction logged: ₹' + amount);
    return true;
    
  } catch (error) {
    Logger.log('❌ Error parsing debit email: ' + error.toString());
    return false;
  }
}

// ============ CREDIT EMAIL PARSER ============
function parseCreditEmail(body, emailDate) {
  try {
    // Extract amount: Rs. 1.00 is successfully credited
    const amountMatch = body.match(/Rs\.?\s*([\d,]+\.?\d*)\s+is successfully credited/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
    
    // Extract account: to your account **0682
    const accountMatch = body.match(/account\s+\*{0,2}(\w+)/i);
    const account = accountMatch ? accountMatch[1] : '';
    
    // Extract VPA: by VPA manivardhanreddy2-1@oksbi
    const vpaMatch = body.match(/by VPA\s+([\w@.-]+)/i);
    const vpa = vpaMatch ? vpaMatch[1] : '';
    
    // Extract party name: Mr Varikuti Manivardhan Reddy
    const partyMatch = body.match(/by VPA\s+[\w@.-]+\s+(.+?)\s+on\s+\d/i);
    const partyName = partyMatch ? partyMatch[1].trim() : '';
    
    // Extract date: on 30-11-25
    const dateMatch = body.match(/on\s+([\d-]+)/);
    const txnDate = dateMatch ? formatDate(dateMatch[1]) : '';
    
    // Extract UPI reference: 533473850929
    const refMatch = body.match(/reference number is\s+(\d+)/i);
    const upiRef = refMatch ? refMatch[1] : '';
    
    // Log to sheet
    logTransaction({
      date: txnDate,
      type: 'CREDIT',
      amount: amount, // Positive for credit
      partyName: partyName,
      partyVPA: vpa,
      account: account,
      upiRef: upiRef,
      emailDate: emailDate
    });
    
    Logger.log('✅ Credit transaction logged: ₹' + amount);
    return true;
    
  } catch (error) {
    Logger.log('❌ Error parsing credit email: ' + error.toString());
    return false;
  }
}

// ============ BALANCE EMAIL PARSER ============
function parseBalanceEmail(body, emailDate) {
  try {
    // Extract balance: Rs. INR 9,569.45
    const balanceMatch = body.match(/Rs\.?\s*INR\s*([\d,]+\.?\d*)/i);
    const reportedBalance = balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : 0;
    
    // Extract account: account ending XX0682
    const accountMatch = body.match(/account ending\s+\w+(\d{4})/i);
    const account = accountMatch ? accountMatch[1] : '';
    
    // Extract date: as of 29-NOV-25
    const dateMatch = body.match(/as of\s+([\d-A-Z]+)/i);
    const balanceDate = dateMatch ? formatDate(dateMatch[1]) : '';
    
    // Get calculated balance from sheet
    const calculatedBalance = getLastBalance();
    const difference = Math.abs(reportedBalance - calculatedBalance);
    const status = difference <= CONFIG.BALANCE_MISMATCH_THRESHOLD ? 'OK' : 'MISMATCH';
    
    // Log balance check
    logBalanceCheck({
      date: balanceDate,
      reportedBalance: reportedBalance,
      calculatedBalance: calculatedBalance,
      difference: difference,
      status: status
    });
    
    // Send alert if mismatch
    if (status === 'MISMATCH') {
      sendBalanceMismatchAlert(reportedBalance, calculatedBalance, difference, balanceDate);
    }
    
    Logger.log(`✅ Balance check: Reported=₹${reportedBalance} Calculated=₹${calculatedBalance} Status=${status}`);
    return true;
    
  } catch (error) {
    Logger.log('❌ Error parsing balance email: ' + error.toString());
    return false;
  }
}

// ============ SHEET OPERATIONS ============
function logTransaction(data) {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName('Transactions');
  
  // Calculate new balance
  const lastBalance = getLastBalance();
  const newBalance = lastBalance + data.amount;
  
  // Append row
  sheet.appendRow([
    data.date,
    data.type,
    data.amount,
    data.partyName,
    data.partyVPA,
    data.account,
    data.upiRef,
    newBalance,
    data.emailDate
  ]);
  
  // Update last balance in Settings
  updateLastBalance(newBalance);
}

function logBalanceCheck(data) {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName('Balance');
  
  sheet.appendRow([
    data.date,
    data.reportedBalance,
    data.calculatedBalance,
    data.difference,
    data.status
  ]);
}

function getLastBalance() {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName('Settings');
  const balance = sheet.getRange('B1').getValue();
  return parseFloat(balance) || 0;
}

function updateLastBalance(newBalance) {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName('Settings');
  sheet.getRange('B1').setValue(newBalance);
  sheet.getRange('B2').setValue(new Date());
}

// ============ UTILITY FUNCTIONS ============
function formatDate(dateStr) {
  // Convert formats like "30-11-25" or "29-NOV-25" to "30-Nov-2025"
  try {
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        // Handle numeric format: 30-11-25
        if (!isNaN(parts[1])) {
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          const year = '20' + parts[2];
          return `${day}-${month}-${year}`;
        }
        // Handle text format: 29-NOV-25
        else {
          const day = parts[0].padStart(2, '0');
          const month = parts[1].toUpperCase();
          const year = '20' + parts[2];
          return `${day}-${month}-${year}`;
        }
      }
    }
    return dateStr;
  } catch (error) {
    return dateStr;
  }
}

function sendBalanceMismatchAlert(reported, calculated, diff, date) {
  const subject = `⚠️ Balance Mismatch Alert - ${CONFIG.BANK_NAME}`;
  const body = `
Balance Mismatch Detected!

Date: ${date}
Reported Balance: ₹${reported.toFixed(2)}
Calculated Balance: ₹${calculated.toFixed(2)}
Difference: ₹${diff.toFixed(2)}

This may indicate:
- Missing transaction emails
- Duplicate processing
- Manual transactions (ATM, cheque, etc.)
- Bank charges or fees

Please review your Google Sheet and bank statement.

View Sheet: https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}
  `;
  
  MailApp.sendEmail(CONFIG.ALERT_EMAIL, subject, body);
  Logger.log('📧 Balance mismatch alert sent');
}

function sendAlertEmail(subject, message) {
  try {
    MailApp.sendEmail(
      CONFIG.ALERT_EMAIL,
      `${CONFIG.BANK_NAME} Tracker: ${subject}`,
      message
    );
  } catch (error) {
    Logger.log('❌ Failed to send alert email: ' + error.toString());
  }
}

// ============ MANUAL FUNCTIONS ============

/**
 * Run this once to set up the sheet structure
 */
function setupSheets() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  
  // Setup Transactions sheet
  let sheet = ss.getSheetByName('Transactions');
  if (!sheet) sheet = ss.insertSheet('Transactions');
  sheet.clear();
  sheet.appendRow(['Date', 'Type', 'Amount', 'Party Name', 'Party VPA', 'Account', 'UPI Ref', 'Balance', 'Email Date']);
  sheet.getRange('A1:I1').setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
  
  // Setup Balance sheet
  sheet = ss.getSheetByName('Balance');
  if (!sheet) sheet = ss.insertSheet('Balance');
  sheet.clear();
  sheet.appendRow(['Date', 'Reported Balance', 'Calculated Balance', 'Difference', 'Status']);
  sheet.getRange('A1:E1').setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
  
  // Setup Settings sheet
  sheet = ss.getSheetByName('Settings');
  if (!sheet) sheet = ss.insertSheet('Settings');
  sheet.clear();
  sheet.appendRow(['Last Balance', 0]);
  sheet.appendRow(['Last Updated', '']);
  sheet.getRange('A1:A2').setFontWeight('bold');
  
  Logger.log('✅ Sheets setup complete!');
}

/**
 * Run this to reset all starred flags (reprocess all emails)
 */
function resetEmailStars() {
  const label = GmailApp.getUserLabelByName(CONFIG.GMAIL_LABEL);
  if (!label) {
    Logger.log('Label not found');
    return;
  }
  
  const threads = label.getThreads();
  threads.forEach(thread => {
    const messages = thread.getMessages();
    messages.forEach(message => {
      if (message.isStarred()) {
        message.unstar();
      }
    });
  });
  
  Logger.log('✅ All email stars reset');
}

/**
 * Test the script with one email
 */
function testScript() {
  const label = GmailApp.getUserLabelByName(CONFIG.GMAIL_LABEL);
  if (!label) {
    Logger.log('Label not found');
    return;
  }
  
  const threads = label.getThreads(0, 1); // Get first thread
  if (threads.length > 0) {
    const message = threads[0].getMessages()[0];
    Logger.log('Testing with email: ' + message.getSubject());
    processEmail(message);
  }
}

// ============ HISTORICAL DATA IMPORT ============

/**
 * Process ALL historical emails in chronological order
 * Checks for duplicates using UPI Reference ID
 * Only adds transactions that don't exist
 * Run this ONCE to import all old transactions
 */
function processAllHistoricalEmails() {
  try {
    const label = GmailApp.getUserLabelByName(CONFIG.GMAIL_LABEL);
    if (!label) {
      Logger.log('⚠️ Label not found: ' + CONFIG.GMAIL_LABEL);
      return;
    }
    
    Logger.log('🔍 Fetching all emails with label: ' + CONFIG.GMAIL_LABEL);
    
    // Get ALL threads (no limit)
    const threads = label.getThreads();
    Logger.log(`📧 Found ${threads.length} email threads`);
    
    // Collect all messages with timestamps
    let allMessages = [];
    threads.forEach(thread => {
      const messages = thread.getMessages();
      messages.forEach(message => {
        allMessages.push({
          message: message,
          date: message.getDate()
        });
      });
    });
    
    // Sort by date (oldest first) for chronological processing
    allMessages.sort((a, b) => a.date - b.date);
    Logger.log(`📊 Total messages to process: ${allMessages.length}`);
    
    // Get existing UPI references to check for duplicates
    const existingRefs = getExistingUpiRefs();
    Logger.log(`📋 Found ${existingRefs.size} existing transactions in sheet`);
    
    let addedCount = 0;
    let skippedCount = 0;
    let balanceCount = 0;
    let errorCount = 0;
    
    // Process each message
    allMessages.forEach((item, index) => {
      try {
        const message = item.message;
        const subject = message.getSubject();
        const body = message.getPlainBody();
        const emailDate = message.getDate();
        
        // Check if it's a transaction email (has UPI reference)
        const isDebit = body.includes('debited from account');
        const isCredit = body.includes('credited to your account');
        const isBalance = body.includes('available balance in your account');
        
        if (isDebit || isCredit) {
          // Extract UPI reference
          const refMatch = body.match(/reference number is\s+(\d+)/i);
          const upiRef = refMatch ? refMatch[1] : null;
          
          if (upiRef && existingRefs.has(upiRef)) {
            // Duplicate found - skip
            skippedCount++;
            if (index % 50 === 0) {
              Logger.log(`⏭️ Progress: ${index + 1}/${allMessages.length} | Skipped duplicate: ${upiRef}`);
            }
          } else {
            // New transaction - add it
            const success = processHistoricalEmail(message, emailDate, existingRefs);
            if (success) {
              addedCount++;
              if (addedCount % 10 === 0) {
                Logger.log(`✅ Progress: ${index + 1}/${allMessages.length} | Added: ${addedCount} transactions`);
              }
            } else {
              errorCount++;
            }
          }
        } else if (isBalance) {
          // Process balance check (doesn't need duplicate check)
          parseBalanceEmail(body, emailDate);
          balanceCount++;
        }
        
        // Add small delay every 100 emails to avoid rate limits
        if (index % 100 === 0 && index > 0) {
          Utilities.sleep(1000); // 1 second pause
        }
        
      } catch (error) {
        errorCount++;
        Logger.log(`❌ Error processing message ${index + 1}: ${error.toString()}`);
      }
    });
    
    // Final summary
    Logger.log('\n' + '='.repeat(50));
    Logger.log('📊 HISTORICAL IMPORT COMPLETE');
    Logger.log('='.repeat(50));
    Logger.log(`✅ Transactions Added: ${addedCount}`);
    Logger.log(`⏭️ Duplicates Skipped: ${skippedCount}`);
    Logger.log(`💰 Balance Checks: ${balanceCount}`);
    Logger.log(`❌ Errors: ${errorCount}`);
    Logger.log(`📧 Total Processed: ${allMessages.length}`);
    Logger.log('='.repeat(50));
    
    // Send completion email
    sendImportCompletionEmail(addedCount, skippedCount, balanceCount, errorCount, allMessages.length);
    
  } catch (error) {
    Logger.log('❌ Critical error in processAllHistoricalEmails: ' + error.toString());
    sendAlertEmail('Historical Import Failed', error.toString());
  }
}

/**
 * Process a single historical email (without starring it)
 */
function processHistoricalEmail(message, emailDate, existingRefs) {
  try {
    const subject = message.getSubject();
    const body = message.getPlainBody();
    
    // Determine email type and parse
    if (body.includes('debited from account')) {
      return parseDebitEmailHistorical(body, emailDate, existingRefs);
    } else if (body.includes('credited to your account')) {
      return parseCreditEmailHistorical(body, emailDate, existingRefs);
    }
    
    return false;
    
  } catch (error) {
    Logger.log('❌ Error processing historical email: ' + error.toString());
    return false;
  }
}

/**
 * Parse debit email for historical import
 */
function parseDebitEmailHistorical(body, emailDate, existingRefs) {
  try {
    const amountMatch = body.match(/Rs\.?([\d,]+\.?\d*)\s+has been debited/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
    
    const accountMatch = body.match(/from account\s+(\w+)/i);
    const account = accountMatch ? accountMatch[1] : '';
    
    const vpaMatch = body.match(/to VPA\s+([\w@.-]+)/i);
    const vpa = vpaMatch ? vpaMatch[1] : '';
    
    const partyMatch = body.match(/to VPA\s+[\w@.-]+\s+(.+?)\s+on\s+\d/i);
    const partyName = partyMatch ? partyMatch[1].trim() : '';
    
    const dateMatch = body.match(/on\s+([\d-]+)/);
    const txnDate = dateMatch ? formatDate(dateMatch[1]) : '';
    
    const refMatch = body.match(/reference number is\s+(\d+)/i);
    const upiRef = refMatch ? refMatch[1] : '';
    
    // Add to existing refs set
    if (upiRef) {
      existingRefs.add(upiRef);
    }
    
    // Log transaction
    logTransactionHistorical({
      date: txnDate,
      type: 'DEBIT',
      amount: -amount,
      partyName: partyName,
      partyVPA: vpa,
      account: account,
      upiRef: upiRef,
      emailDate: emailDate
    });
    
    return true;
    
  } catch (error) {
    Logger.log('❌ Error parsing historical debit: ' + error.toString());
    return false;
  }
}

/**
 * Parse credit email for historical import
 */
function parseCreditEmailHistorical(body, emailDate, existingRefs) {
  try {
    const amountMatch = body.match(/Rs\.?\s*([\d,]+\.?\d*)\s+is successfully credited/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
    
    const accountMatch = body.match(/account\s+\*{0,2}(\w+)/i);
    const account = accountMatch ? accountMatch[1] : '';
    
    const vpaMatch = body.match(/by VPA\s+([\w@.-]+)/i);
    const vpa = vpaMatch ? vpaMatch[1] : '';
    
    const partyMatch = body.match(/by VPA\s+[\w@.-]+\s+(.+?)\s+on\s+\d/i);
    const partyName = partyMatch ? partyMatch[1].trim() : '';
    
    const dateMatch = body.match(/on\s+([\d-]+)/);
    const txnDate = dateMatch ? formatDate(dateMatch[1]) : '';
    
    const refMatch = body.match(/reference number is\s+(\d+)/i);
    const upiRef = refMatch ? refMatch[1] : '';
    
    // Add to existing refs set
    if (upiRef) {
      existingRefs.add(upiRef);
    }
    
    // Log transaction
    logTransactionHistorical({
      date: txnDate,
      type: 'CREDIT',
      amount: amount,
      partyName: partyName,
      partyVPA: vpa,
      account: account,
      upiRef: upiRef,
      emailDate: emailDate
    });
    
    return true;
    
  } catch (error) {
    Logger.log('❌ Error parsing historical credit: ' + error.toString());
    return false;
  }
}

/**
 * Log transaction for historical import (inserts in chronological order)
 */
function logTransactionHistorical(data) {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName('Transactions');
  
  // Get all existing data
  const lastRow = sheet.getLastRow();
  const dataRange = sheet.getRange(2, 1, Math.max(1, lastRow - 1), 9);
  const existingData = lastRow > 1 ? dataRange.getValues() : [];
  
  // Calculate balance based on existing transactions
  let balance = 0;
  for (let row of existingData) {
    if (row[2]) { // Amount column
      balance += parseFloat(row[2]) || 0;
    }
  }
  balance += data.amount;
  
  // Create new row
  const newRow = [
    data.date,
    data.type,
    data.amount,
    data.partyName,
    data.partyVPA,
    data.account,
    data.upiRef,
    balance,
    data.emailDate
  ];
  
  // Find correct position to insert (sorted by transaction date)
  let insertPosition = lastRow + 1; // Default: append at end
  
  for (let i = 0; i < existingData.length; i++) {
    const existingDate = existingData[i][0]; // Date column
    if (existingDate && data.date < existingDate) {
      insertPosition = i + 2; // +2 because row 1 is header, arrays are 0-indexed
      break;
    }
  }
  
  // Insert row at correct position
  if (insertPosition <= lastRow) {
    sheet.insertRowBefore(insertPosition);
  }
  sheet.getRange(insertPosition, 1, 1, 9).setValues([newRow]);
  
  // Update last balance in Settings
  updateLastBalance(balance);
}

/**
 * Get all existing UPI reference numbers from sheet
 */
function getExistingUpiRefs() {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName('Transactions');
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
    return new Set(); // Empty sheet
  }
  
  // Get UPI Ref column (column 7)
  const refs = sheet.getRange(2, 7, lastRow - 1, 1).getValues();
  const refSet = new Set();
  
  refs.forEach(row => {
    if (row[0]) {
      refSet.add(row[0].toString());
    }
  });
  
  return refSet;
}

/**
 * Send email notification when import completes
 */
function sendImportCompletionEmail(added, skipped, balance, errors, total) {
  const subject = `✅ Historical Data Import Complete - ${CONFIG.BANK_NAME}`;
  const body = `
Historical Email Import Summary
================================

✅ Transactions Added: ${added}
⏭️ Duplicates Skipped: ${skipped}
💰 Balance Checks: ${balance}
❌ Errors: ${errors}
📧 Total Emails Processed: ${total}

Your transaction history has been imported in chronological order.
All duplicate transactions were automatically skipped.

View your updated sheet:
https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}

Note: The running balance has been recalculated for all transactions.
  `;
  
  MailApp.sendEmail(CONFIG.ALERT_EMAIL, subject, body);
  Logger.log('📧 Import completion email sent');
}
