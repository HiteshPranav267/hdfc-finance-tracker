# 📚 Detailed Setup Guide

Complete step-by-step instructions for setting up the Banking Expense Tracker.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Gmail Configuration](#gmail-configuration)
3. [Google Sheets Setup](#google-sheets-setup)
4. [Apps Script Deployment](#apps-script-deployment)
5. [First-Time Data Import](#first-time-data-import)
6. [Automation Setup](#automation-setup)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- ✅ Google Account (Gmail)
- ✅ HDFC Bank account
- ✅ Email alerts enabled in HDFC Bank
- ✅ Basic understanding of Google Sheets
- ✅ 10 minutes of setup time

---

## Gmail Configuration

### Step 1: Create Gmail Label

1. Open Gmail
2. Click **Settings** ⚙️ → **See all settings**
3. Go to **Labels** tab
4. Scroll to **Labels** section
5. Click **Create new label**
6. Name it: `BankAlerts`
7. Click **Create**

### Step 2: Create Email Filter

1. In Gmail Settings, go to **Filters and Blocked Addresses**
2. Click **Create a new filter**
3. Fill in:
   - **From**: `alerts@hdfcbank.net`
4. Click **Create filter**
5. Check these options:
   - ✅ Apply the label: `BankAlerts`
   - ✅ Also apply filter to matching conversations
6. Click **Create filter**

### Step 3: Verify Filter

- Send yourself a test transaction (₹1 UPI payment)
- Check if email appears in Gmail with `BankAlerts` label

---

## Google Sheets Setup

### Step 1: Create New Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **Blank** to create new sheet
3. Rename it: `HDFC Bank Tracker`

### Step 2: Get Sheet ID

1. Look at the URL:
https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
2. Copy the `SHEET_ID` part (between `/d/` and `/edit`)
3. Save it - you'll need this later

---

## Apps Script Deployment

### Step 1: Open Apps Script Editor

1. In your Google Sheet, go to **Extensions** → **Apps Script**
2. Delete any default code
3. Copy entire code from `Code.gs` file in this repository
4. Paste it into the editor

### Step 2: Configure Settings

Find the `CONFIG` section and update:
```javascript
const CONFIG = {
  SHEET_ID: 'paste-your-sheet-id-here',
  GMAIL_LABEL: 'BankAlerts',
  ALERT_EMAIL: 'your-email@gmail.com',
  BALANCE_MISMATCH_THRESHOLD: 1.0,
  BANK_NAME: 'HDFC Bank'
};
```

### Step 3: Save and Authorize

1. Click **Save** 💾 (or Ctrl+S)
2. Name the project: `Banking Tracker`
3. Click **Run** → Select `setupSheets`
4. Click **Review permissions**
5. Choose your Google account
6. Click **Advanced** → **Go to Banking Tracker (unsafe)**
7. Click **Allow**

### Step 4: Run Initial Setup

1. Select function: `setupSheets`
2. Click **Run** ▶️
3. Check Execution log - should see: `✅ Sheets setup complete!`
4. Go back to your Google Sheet
5. Verify 3 tabs created: `Transactions`, `Balance`, `Settings`

---

## First-Time Data Import

### Import Historical Transactions

1. In Apps Script editor
2. Select function: `processAllHistoricalEmails`
3. Click **Run** ▶️
4. Wait for completion (may take 2-10 minutes depending on email count)
5. Check **Execution log** for progress
6. You'll receive email when done

### Expected Output
📧 Found 500 email threads
📊 Total messages to process: 500
✅ Progress: 100/500 | Added: 50 transactions
⏭️ Progress: 200/500 | Skipped duplicate: 114889065960
...
✅ Transactions Added: 247
⏭️ Duplicates Skipped: 253

---

## Automation Setup

### Create Time-Driven Trigger

1. In Apps Script, click **Triggers** ⏰ (left sidebar, clock icon)
2. Click **+ Add Trigger** (bottom right)
3. Configure:
   - **Choose function**: `processNewBankEmails`
   - **Deployment**: Head
   - **Event source**: Time-driven
   - **Type of time based trigger**: Minutes timer
   - **Select minute interval**: Every minute
4. Click **Save**

### Verify Automation

1. Send yourself a test transaction (₹1 UPI)
2. Wait 1-2 minutes
3. Check Google Sheet - transaction should appear
4. Email should be starred in Gmail

---

## Troubleshooting

### Issue: "Label not found"

**Solution:** Create Gmail label exactly as `BankAlerts` (case-sensitive)

### Issue: No transactions appearing

**Solution:**
1. Check Gmail filter is working
2. Verify emails have `BankAlerts` label
3. Run `testScript()` function to test one email
4. Check Execution log for errors

### Issue: Duplicate transactions

**Solution:**
1. Run `resetEmailStars()` to unstar all emails
2. Clear Transactions sheet (keep headers)
3. Clear Settings sheet values (keep labels)
4. Run `processAllHistoricalEmails()` again

### Issue: Balance mismatch alerts

**Causes:**
- Manual ATM withdrawals
- Bank charges/fees
- Cheque transactions
- Transactions before tracker started

**Solution:**
1. Check your bank statement
2. Manually adjust `Last Balance` in Settings sheet
3. Add manual entry in Transactions sheet if needed

### Issue: Script timeout

**Solution:**
- Google Apps Script has 6-minute execution limit
- For large mailboxes, the script auto-pauses every 100 emails
- If timeout occurs, run `processAllHistoricalEmails()` again
- Already-processed emails will be skipped automatically

---

## Advanced Configuration

### Change Check Frequency

Edit trigger:
- Every 1 minute (recommended, real-time)
- Every 5 minutes (battery-friendly)
- Every 10 minutes (minimal)

### Adjust Alert Threshold

In `CONFIG`:
```javascript
BALANCE_MISMATCH_THRESHOLD: 1.0 // Alert if difference > ₹1
```

Change to:
- `0.01` - Alert on any mismatch
- `10.0` - Alert only if difference > ₹10

### Multiple Bank Support

Duplicate the setup:
1. Create separate sheet
2. Create separate Gmail label
3. Deploy separate Apps Script
4. Use different `GMAIL_LABEL` in CONFIG

---

## Next Steps

- ✅ Set up automation
- ✅ Import historical data
- ✅ Test with small transaction
- ✅ Monitor for 1 week
- ✅ Review balance checks
- ✅ Customize as needed

---
