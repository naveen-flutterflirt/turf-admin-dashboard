/**
 * Export data to CSV format and trigger browser download
 * @param data Array of objects representing rows
 * @param filename Name of the file to download (without .csv extension)
 * @param headers Optional mapping of object keys to user-friendly column headers
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportToCsv<T extends Record<string, any>>(
  data: T[], 
  filename: string, 
  headers?: { key: keyof T; label: string }[]
) {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  // Determine headers
  const cols = headers || Object.keys(data[0]).map(k => ({ key: k, label: k }));
  
  // Create CSV header row
  const csvRows = [];
  const headerRow = cols.map(c => `"${String(c.label).replace(/"/g, '""')}"`).join(',');
  csvRows.push(headerRow);

  // Create data rows
  for (const row of data) {
    const values = cols.map(col => {
      const val = row[col.key];
      const safeVal = (val === null || val === undefined) ? '' : val;
      const stringVal = String(safeVal).replace(/"/g, '""');
      return `"${stringVal}"`;
    });
    csvRows.push(values.join(','));
  }

  // Combine to single string
  const csvString = csvRows.join('\n');
  
  // Create blob and download link
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
