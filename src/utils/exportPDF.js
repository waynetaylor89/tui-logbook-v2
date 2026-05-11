// PDF Export functionality for TUI Logbook
export const exportToPDF = (data, filename = 'tui-logbook-export.pdf') => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }

  // Generate HTML content for PDF
  const htmlContent = generatePDFHTML(data);
  
  // Write content to the new window
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
};

const generatePDFHTML = (data) => {
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>TUI Airways Movement Logbook</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #007acc;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #007acc;
          margin: 0;
          font-size: 24px;
        }
        .header .subtitle {
          color: #666;
          margin: 5px 0 0 0;
          font-size: 14px;
        }
        .summary {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .summary h2 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 16px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
        }
        .summary-item {
          background: white;
          padding: 10px;
          border-radius: 3px;
          border-left: 4px solid #007acc;
        }
        .summary-item .label {
          font-size: 12px;
          color: #666;
          margin-bottom: 3px;
        }
        .summary-item .value {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #007acc;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #666;
          font-size: 12px;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        .no-data {
          text-align: center;
          padding: 40px;
          color: #666;
          font-style: italic;
        }
        @media print {
          body { margin: 15px; }
          .header { page-break-after: always; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>TUI Airways Movement Logbook</h1>
        <div class="subtitle">Aircraft Movement Records Report</div>
        <div class="subtitle">Generated on ${currentDate} at ${currentTime}</div>
      </div>
      
      <div class="summary">
        <h2>Summary Statistics</h2>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="label">Total Movements</div>
            <div class="value">${data.length}</div>
          </div>
          <div class="summary-item">
            <div class="label">Unique Aircraft</div>
            <div class="value">${new Set(data.map(item => item.aircraft)).size}</div>
          </div>
          <div class="summary-item">
            <div class="label">Date Range</div>
            <div class="value">${getDateRange(data)}</div>
          </div>
          <div class="summary-item">
            <div class="label">Top Stand</div>
            <div class="value">${getTopStand(data)}</div>
          </div>
        </div>
      </div>
      
      ${data.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Aircraft</th>
              <th>Movement Type</th>
              <th>From Stand</th>
              <th>To Stand</th>
              <th>Created By</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr>
                <td>${item.date || '-'}</td>
                <td>${item.time || '-'}</td>
                <td>${item.aircraft || '-'}</td>
                <td>${item.movementType || '-'}</td>
                <td>${item.fromStand || '-'}</td>
                <td>${item.toStand || '-'}</td>
                <td>${item.createdBy || '-'}</td>
                <td>${item.notes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : `
        <div class="no-data">
          No movement records found for the selected criteria.
        </div>
      `}
      
      <div class="footer">
        <p>TUI Airways Movement Logbook - Confidential Document</p>
        <p>This report contains sensitive operational data and should be handled accordingly.</p>
        <p>Page 1 of 1</p>
      </div>
    </body>
    </html>
  `;
};

const getDateRange = (data) => {
  if (data.length === 0) return 'No data';
  
  const dates = data
    .filter(item => item.date)
    .map(item => new Date(item.date))
    .sort((a, b) => a - b);
  
  if (dates.length === 0) return 'No dates';
  if (dates.length === 1) return dates[0].toLocaleDateString();
  
  return `${dates[0].toLocaleDateString()} - ${dates[dates.length - 1].toLocaleDateString()}`;
};

const getTopStand = (data) => {
  if (data.length === 0) return 'No data';
  
  const standCounts = {};
  data.forEach(item => {
    if (item.fromStand) {
      standCounts[item.fromStand] = (standCounts[item.fromStand] || 0) + 1;
    }
    if (item.toStand) {
      standCounts[item.toStand] = (standCounts[item.toStand] || 0) + 1;
    }
  });
  
  const topStand = Object.entries(standCounts)
    .sort(([,a], [,b]) => b - a)[0];
  
  return topStand ? topStand[0] : 'No stands';
};
