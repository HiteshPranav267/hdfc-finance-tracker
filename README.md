# 🏦 Automated Banking Expense Tracker

> Automated HDFC Bank transaction tracking using Gmail + Google Apps Script + Google Sheets

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?logo=google&logoColor=white)](https://script.google.com)
[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/YOUR_USERNAME/banking-expense-tracker)

## 📋 Overview

A fully automated system that tracks HDFC Bank transactions by parsing email alerts and logging them into Google Sheets with real-time balance verification.

### ✨ Features

- 🔄 **Automatic Email Processing** - Parses debit, credit, and balance update emails
- 💰 **Real-time Balance Tracking** - Maintains running balance after each transaction
- 🚨 **Balance Verification** - Alerts on mismatches between bank and calculated balance
- 📊 **Structured Logging** - Clean, organized transaction history in Google Sheets
- ⭐ **Duplicate Prevention** - Smart UPI reference checking
- 📱 **Device Independent** - Works on any device with internet
- 🕐 **Historical Import** - Import all past transactions chronologically

## 🎯 Supported Email Types

1. **Debit Transactions** (Money Sent)
2. **Credit Transactions** (Money Received)
3. **Account Balance Updates**

## 🚀 Quick Start

### Prerequisites

- Google Account
- HDFC Bank account with email alerts enabled
- Gmail address receiving HDFC transaction emails

### Installation

1. **Create Google Sheet**
Go to: https://sheets.google.com
Create new sheet → Copy Sheet ID from URL

2. **Set up Gmail Filter**
   - Gmail → Settings → Filters and Blocked Addresses
   - Create filter: `from:alerts@hdfcbank.net`
   - Apply label: `BankAlerts`

3. **Deploy Apps Script**
   - Open your Google Sheet
   - Extensions → Apps Script
   - Copy code from `Code.gs`
   - Update `CONFIG` section with your details
   - Run `setupSheets()` function
   - Run `processAllHistoricalEmails()` for first-time import

4. **Set up Automation**
   - Apps Script → Triggers → Add Trigger
   - Function: `processNewBankEmails`
   - Time-driven → Minutes timer → Every 1 minute

## 📖 Documentation

- [Detailed Setup Guide](docs/SETUP.md)
- [Changelog](docs/CHANGELOG.md)
- [Sample Email Formats](examples/sample-emails.txt)

## 🛠️ Configuration

Edit the `CONFIG` object in `Code.gs`:
```javascript
const CONFIG = {
  SHEET_ID: 'your-sheet-id',
  GMAIL_LABEL: 'BankAlerts',
  ALERT_EMAIL: 'your-email@gmail.com',
  BALANCE_MISMATCH_THRESHOLD: 1.0
};
```

## 📊 Google Sheet Structure

### Transactions Sheet
| Date | Type | Amount | Party Name | Party VPA | Account | UPI Ref | Balance | Email Date |

### Balance Sheet
| Date | Reported Balance | Calculated Balance | Difference | Status |

### Settings Sheet
| Last Balance | Last Updated |

## 🔧 Available Functions

| Function | Purpose | When to Use |
|----------|---------|-------------|
| `setupSheets()` | Initialize sheet structure | First time setup |
| `processNewBankEmails()` | Process new emails | Automated (via trigger) |
| `processAllHistoricalEmails()` | Import all old emails | One-time historical import |
| `resetEmailStars()` | Unstar all emails | Before reprocessing |
| `testScript()` | Test with one email | Testing/debugging |

## 🚨 Alerts

You'll receive email alerts for:
- ⚠️ Balance mismatches (calculated vs reported)
- ❌ Script execution errors
- ✅ Historical import completion

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This project is for personal financial tracking only. Always verify transactions with your official bank statements. The author is not responsible for any financial discrepancies.

## 🙏 Acknowledgments

- Built with Google Apps Script
- Inspired by the need for automated personal finance tracking
- Thanks to the open-source community

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/YOUR_USERNAME/banking-expense-tracker](https://github.com/YOUR_USERNAME/banking-expense-tracker)

## ⭐ Star History

If this project helped you, please consider giving it a star!

---
