# Supported HDFC Email Formats

Below are the known supported patterns used in automation.gs

---

## CREDIT (Money Received)

Example:
Dear Customer, Rs. 200.00 is successfully credited to your account **0682 by VPA ...

Regex:
credited to your account

---

## DEBIT (Money Sent)

Example:
Dear Customer, Rs. 50.00 has been debited from account 0682 to VPA ...

Regex:
has been debited

---

## BALANCE EMAIL

Example:
The available balance in your account ending XX0682 is Rs. INR 11,020.45 ...

Regex:
available balance


---

## Unknown formats

Any email not matching patterns above goes to the Debug sheet.
