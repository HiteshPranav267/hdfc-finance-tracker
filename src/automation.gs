/**
 * HDFC Finance Tracker
 * ---------------------
 * Reads HDFC transaction emails from Gmail, extracts debit/credit/balance data,
 * updates Google Sheets, maintains running balance, and logs unknown formats.
 *
 * Sheet Requirements:
 *   Transactions: Timestamp | Type | Amount | From/To | Date | Reference | Running Balance | MonthNum
 *   Balance:      Timestamp | Email Balance
 *   Settings:     LastKnownBalance
 *   Debug:        Timestamp | Raw Email Body
 *
 * Gmail Requirements:
 *   Label name: HDFC-Auto
 *
 * Trigger:
 *   Time-driven: parseHDFCEmails() every 1 minute
 */

function parseHDFCEmails() {
  const label = GmailApp.getUserLabelByName("HDFC-Auto");
  const threads = label.getThreads(0, 20);

  const ss = SpreadsheetApp.getActive();
  const tx = ss.getSheetByName("Transactions");
  const bal = ss.getSheetByName("Balance");
  const settings = ss.getSheetByName("Settings");
  const debug = ss.getSheetByName("Debug");

  let lastKnown = parseFloat(settings.getRange("B1").getValue()) || 0;

  threads.forEach(thread => {
    thread.getMessages().forEach(msg => {
      if (msg.isStarred()) return;

      const body = msg.getPlainBody().replace(/\s+/g, " ").trim();
      let matched = false;

      // CREDIT
      if (body.includes("credited to your account")) {
        const amt = extractAmount(body);
        const sender = extractText(body, /by VPA (.*?) on/i);
        const date = extractText(body, /on (\d{2}-\d{2}-\d{2})/i);
        const ref = extractText(body, /reference number is (\d+)/i);

        if (amt !== null) {
          lastKnown += amt;
          tx.appendRow([new Date(), "CREDIT", amt, sender, date, ref, lastKnown]);
          matched = true;
        }
      }

      // DEBIT
      else if (body.includes("has been debited")) {
        const amt = extractAmount(body);
        const receiver = extractText(body, /to (.*?) on/i);
        const date = extractText(body, /on (\d{2}-\d{2}-\d{2})/i);
        const ref = extractText(body, /reference number is (\d+)/i);

        if (amt !== null) {
          lastKnown -= amt;
          tx.appendRow([new Date(), "DEBIT", amt, receiver, date, ref, lastKnown]);
          matched = true;
        }
      }

      // BALANCE
      else if (body.includes("available balance") || body.includes("available bal")) {
        const balVal = extractAmount(body);

        if (balVal !== null) {
          bal.appendRow([new Date(), balVal]);

          if (Math.abs(balVal - lastKnown) > 1) {
            sendAlert(balVal, lastKnown);
          }

          lastKnown = balVal;
          matched = true;
        }
      }

      // Unknown → Debug sheet
      if (!matched) {
        debug.appendRow([new Date(), body]);
      }

      msg.star();
    });
  });

  settings.getRange("B1").setValue(lastKnown);
}

function extractAmount(t) {
  const m = t.match(/(?:Rs\.?|INR)\s*:?\.?\s*([0-9,]+(?:\.\d+)?)/i);
  return m ? parseFloat(m[1].replace(/,/g, "")) : null;
}

function extractText(body, pattern) {
  const m = body.match(pattern);
  return m ? m[1].trim() : "";
}

function sendAlert(real, calc) {
  MailApp.sendEmail({
    to: Session.getActiveUser().getEmail(),
    subject: "⚠️ HDFC Balance Mismatch Detected",
    body: `Bank Email Balance: ${real}\nCalculated Balance: ${calc}`
  });
}
