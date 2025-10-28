function extractDate(errorText: string): string | null {
  const dateRegex = /(\w{3} \w{3} \d{1,2} \d{4})/;
  const match = errorText.match(dateRegex);
  
  if (!match) return null;
  
  const date = new Date(match[0]);
  if (isNaN(date.getTime())) return null;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// Использование
const errorLog = `componentStack: '\n    at 5
alesPointInputDate (https://
localhost:300../localhost:30
00/index.tsx?t=176166365610
0:35:20)';

sales_point_input da…?t=176166…
Sat Feb 01 2121 00:00:00
GMT+0300 (MockBa, стандартное время)`;

const result = extractDate(errorLog); // "2121-02-01"
console.log(result);