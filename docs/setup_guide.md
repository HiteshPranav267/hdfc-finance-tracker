# Setup Guide — HDFC Finance Tracker

This guide walks you through installing the automation:

---

## 1. Create the Sheets

### Transactions
Create columns exactly:
Timestamp | Type | Amount | From/To | Date | Reference | Running Balance | MonthNum

### Balance
Timestamp | EmailBalance

### Settings
LastKnownBalance | 0

### Debug
Timestamp | Body
---

## 2. Add the Helper Column (MonthNum)

In Transactions → H2:
=ARRAYFORMULA(IF(E2:E="","", MID(E2:E,4,2)))

This extracts month number (e.g., `11`) from dates like `30-11-25`.

---

## 3. Gmail Filter

Search Gmail:
from:(alerts@hdfcbank.net) OR subject:(❗ You have done a UPI txn. Check details!) OR subject:(View: Account update for your HDFC Bank A/c)
Create filter → Apply label → **HDFC-Auto**

---

## 4. Add Google Apps Script

Open Google Sheets → Extensions → Apps Script  
Paste code from `src/automation.gs`.

Run once manually to allow permissions.

---

## 5. Add Trigger

Triggers → Add Trigger:

- Function: `parseHDFCEmails`
- Event: Time-driven
- Every 1 minute

---

## 6. Test

Make any UPI transaction → Wait 1 minute → Check Transactions sheet.

