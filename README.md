# HDFC Finance Tracker  
Automated Gmail → Google Sheets financial tracker for HDFC Bank email alerts

HDFC Finance Tracker is an open-source automation system that reads HDFC Bank transaction emails from Gmail and logs all debits, credits, and balance updates into a Google Sheets ledger. It maintains a running balance, detects mismatches, and includes clean monthly analytics with a radial (donut) spend chart — all without manual work.

This solution runs fully in Google Apps Script + Gmail filters and requires **no backend, no servers, and no SMS access**.

---

## Features

### Automatic Parsing
The script extracts:
- Debit (money sent)
- Credit (money received)
- Balance emails

It captures:
- Amount  
- Transaction type  
- Date  
- UPI ID (From/To)  
- Reference number  
- Updated running balance  

### Real-time Google Sheet Updates
All transactions append instantly to:
Timestamp | Type | Amount | From/To | Date | Reference | Running Balance | MonthNum


### Balance Verification
If a balance email value doesn’t match the calculated running balance:
- A **mismatch alert email** is sent to the user.

### Debug Logging
Unrecognized email formats are logged to a `Debug` sheet for manual review.

### Fully Automated
Runs every minute using time-based triggers on Google Apps Script.

---

## 📂 Repository Structure
src/automation.gs # Main Google Apps Script code

docs/setup_guide.md # Step-by-step installation guide

docs/analytics.md # Monthly analytics + donut chart instructions

docs/email_formats.md # Regex patterns + supported email types

examples/*.txt # Sample HDFC transaction emails

LICENSE # MIT License

README.md # Main documentation


---

## Requirements

- Gmail account with HDFC transaction alerts enabled  
- Google Sheets  
- Google Apps Script  
- HDFC transaction emails regularly arriving to Gmail  

---

## Documentation

### Setup Guide  
→ See `docs/setup_guide.md`  
Includes:
- Sheet setup  
- Gmail filtering  
- Script installation  
- Trigger configuration  
- Testing  

### Analytics Guide  
→ See `docs/analytics.md`  
Shows:
- Monthly spend totals  
- Monthly received totals  
- Net change  
- Previous month comparison  
- Donut chart setup  

---

## Supported Email Formats
Documented in `docs/email_formats.md`.

Includes:
- Debit ("Rs. ___ has been debited…")
- Credit ("Rs. ___ credited to your account…")
- Balance update ("The available balance is Rs…")

---

## License

This project is licensed under the **MIT License** — free to use, modify, and distribute.

If you find this useful, ⭐ star the repo on GitHub!

