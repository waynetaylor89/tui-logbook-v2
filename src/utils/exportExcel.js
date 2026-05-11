// Excel Export functionality for TUI Logbook
export const exportToExcel = (data, filename = 'tui-logbook-export.xlsx') => {
  // Convert data to CSV format (Excel-compatible)
  const csvContent = generateCSV(data);
  
  // Create a Blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
};

const generateCSV = (data) => {
  // CSV Header
  const headers = [
    'Date',
    'Time',
    'Aircraft Registration',
    'Aircraft Type',
    'Movement Type',
    'From Stand',
    'To Stand',
    'Airport',
    'Created By',
    'Notes',
    'Entry ID'
  ];
  
  // Convert data to CSV rows
  const rows = data.map(item => {
    // Extract aircraft type from registration string
    const aircraftType = getAircraftType(item.aircraft);
    
    return [
      item.date || '',
      item.time || '',
      item.aircraft || '',
      aircraftType,
      item.movementType || '',
      item.fromStand || '',
      item.toStand || '',
      item.airport || 'LGW',
      item.createdBy || '',
      escapeCSVField(item.notes || ''),
      item.id || ''
    ].map(field => `"${field}"`).join(',');
  });
  
  // Combine header and rows
  const csvContent = [headers.join(','), ...rows].join('\n');
  
  // Add UTF-8 BOM for proper Excel encoding
  return '\ufeff' + csvContent;
};

const getAircraftType = (aircraft) => {
  if (!aircraft) return '';
  
  // Extract aircraft type from registration string
  // Format: "G-TAWA - Boeing 737-800"
  const parts = aircraft.split(' - ');
  return parts.length > 1 ? parts[1] : aircraft;
};

const escapeCSVField = (field) => {
  // Escape quotes and handle line breaks for CSV
  return field
    .replace(/"/g, '""')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
};

// Enhanced Excel export with multiple sheets (using separate CSV files)
export const exportToExcelMultiple = (data, filename = 'tui-logbook-export') => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  
  // Export different views as separate CSV files
  const exports = [
    {
      data: data,
      filename: `${filename}-all-movements-${timestamp}.csv`,
      description: 'All Movement Records'
    },
    {
      data: generateSummaryData(data),
      filename: `${filename}-summary-${timestamp}.csv`,
      description: 'Movement Summary'
    },
    {
      data: generateAircraftUtilization(data),
      filename: `${filename}-aircraft-utilization-${timestamp}.csv`,
      description: 'Aircraft Utilization'
    },
    {
      data: generateStandAnalysis(data),
      filename: `${filename}-stand-analysis-${timestamp}.csv`,
      description: 'Stand Usage Analysis'
    }
  ];
  
  // Download each file
  exports.forEach((exportItem, index) => {
    setTimeout(() => {
      const csvContent = generateCSVForType(exportItem.data, exportItem.description);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', exportItem.filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    }, index * 200); // Stagger downloads to avoid browser blocking
  });
};

const generateCSVForType = (data, description) => {
  if (description === 'Movement Summary') {
    return generateSummaryCSV(data);
  } else if (description === 'Aircraft Utilization') {
    return generateAircraftCSV(data);
  } else if (description === 'Stand Usage Analysis') {
    return generateStandCSV(data);
  }
  return generateCSV(data);
};

const generateSummaryData = (data) => {
  const summary = {
    totalMovements: data.length,
    uniqueAircraft: new Set(data.map(item => item.aircraft)).size,
    dateRange: getDateRange(data),
    movementTypes: getMovementTypeBreakdown(data),
    topStands: getTopStands(data),
    generatedAt: new Date().toISOString()
  };
  
  return [summary];
};

const generateAircraftUtilization = (data) => {
  const aircraftStats = {};
  
  data.forEach(item => {
    if (!item.aircraft) return;
    
    if (!aircraftStats[item.aircraft]) {
      aircraftStats[item.aircraft] = {
        registration: item.aircraft,
        type: getAircraftType(item.aircraft),
        totalMovements: 0,
        movementTypes: {},
        firstSeen: item.date,
        lastSeen: item.date
      };
    }
    
    const stats = aircraftStats[item.aircraft];
    stats.totalMovements++;
    
    if (!stats.movementTypes[item.movementType]) {
      stats.movementTypes[item.movementType] = 0;
    }
    stats.movementTypes[item.movementType]++;
    
    if (item.date && item.date < stats.firstSeen) {
      stats.firstSeen = item.date;
    }
    if (item.date && item.date > stats.lastSeen) {
      stats.lastSeen = item.date;
    }
  });
  
  return Object.values(aircraftStats);
};

const generateStandAnalysis = (data) => {
  const standStats = {};
  
  data.forEach(item => {
    // Process from stands
    if (item.fromStand) {
      if (!standStats[item.fromStand]) {
        standStats[item.fromStand] = {
          stand: item.fromStand,
          totalMovements: 0,
          asFrom: 0,
          asTo: 0,
          movementTypes: {}
        };
      }
      standStats[item.fromStand].totalMovements++;
      standStats[item.fromStand].asFrom++;
      
      if (!standStats[item.fromStand].movementTypes[item.movementType]) {
        standStats[item.fromStand].movementTypes[item.movementType] = 0;
      }
      standStats[item.fromStand].movementTypes[item.movementType]++;
    }
    
    // Process to stands
    if (item.toStand) {
      if (!standStats[item.toStand]) {
        standStats[item.toStand] = {
          stand: item.toStand,
          totalMovements: 0,
          asFrom: 0,
          asTo: 0,
          movementTypes: {}
        };
      }
      standStats[item.toStand].totalMovements++;
      standStats[item.toStand].asTo++;
      
      if (!standStats[item.toStand].movementTypes[item.movementType]) {
        standStats[item.toStand].movementTypes[item.movementType] = 0;
      }
      standStats[item.toStand].movementTypes[item.movementType]++;
    }
  });
  
  return Object.values(standStats);
};

const generateSummaryCSV = (data) => {
  const summary = data[0];
  const headers = Object.keys(summary);
  const values = headers.map(header => summary[header]);
  
  return '\ufeff' + headers.join(',') + '\n' + 
         values.map(value => `"${value}"`).join(',');
};

const generateAircraftCSV = (data) => {
  const headers = [
    'Aircraft Registration',
    'Aircraft Type',
    'Total Movements',
    'Movement Types',
    'First Movement',
    'Last Movement'
  ];
  
  const rows = data.map(item => [
    item.registration,
    item.type,
    item.totalMovements,
    Object.keys(item.movementTypes).join(', '),
    item.firstSeen,
    item.lastSeen
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(field => `"${field}"`).join(','))
  ].join('\n');
  
  return '\ufeff' + csvContent;
};

const generateStandCSV = (data) => {
  const headers = [
    'Stand',
    'Total Movements',
    'As From Stand',
    'As To Stand',
    'Movement Types'
  ];
  
  const rows = data.map(item => [
    item.stand,
    item.totalMovements,
    item.asFrom,
    item.asTo,
    Object.keys(item.movementTypes).join(', ')
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(field => `"${field}"`).join(','))
  ].join('\n');
  
  return '\ufeff' + csvContent;
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

const getMovementTypeBreakdown = (data) => {
  const types = {};
  data.forEach(item => {
    if (item.movementType) {
      types[item.movementType] = (types[item.movementType] || 0) + 1;
    }
  });
  return Object.entries(types)
    .map(([type, count]) => `${type}: ${count}`)
    .join(', ');
};

const getTopStands = (data) => {
  const standCounts = {};
  data.forEach(item => {
    if (item.fromStand) {
      standCounts[item.fromStand] = (standCounts[item.fromStand] || 0) + 1;
    }
    if (item.toStand) {
      standCounts[item.toStand] = (standCounts[item.toStand] || 0) + 1;
    }
  });
  
  return Object.entries(standCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([stand, count]) => `${stand}: ${count}`)
    .join(', ');
};
