# Analytics Setup — HDFC Finance Tracker

This file explains how to compute monthly spend analytics and a donut (radial) chart.

---

## 1. Required Data

Your `Transactions` sheet must have this helper column:
MonthNum (Column H)
=ARRAYFORMULA(IF(E2:E="","", MID(E2:E,4,2)))

This makes monthly formulas stable.

---

## 2. Create Analytics Sheet

### A1
Total Spent This Month  

### B1
=SUMIFS(Transactions!C:C,
Transactions!B:B,"DEBIT",
Transactions!H:H, TEXT(TODAY(),"MM"))

### A2
Total Received This Month  

### B2
=SUMIFS(Transactions!C:C,
Transactions!B:B,"CREDIT",
Transactions!H:H, TEXT(TODAY(),"MM"))

### A3
Net Change  

### B3
=B2-B1

---

## 3. Previous Month Spending

### A5
Previous Month Spending

### B5
=SUMIFS(Transactions!C:C,
Transactions!B:B,"DEBIT",
Transactions!H:H, TEXT(EDATE(TODAY(),-1),"MM"))

---

## 4. Donut Chart Dataset

| A10 | B10 |
|-------|------|
| Label | Value |
| Current Month Spend | `=B1` |
| Previous Month Spend | `=B5` |

---

## 5. Create Donut Chart

1. Select: `A10:B12`  
2. Insert → Chart  
3. Chart type → **Donut Chart**  
4. Hole Size → 70–80%  
5. Color:
   - Current Month → dark color  
   - Last Month → light color  

---

Now you have a clean radial spend comparison chart.

