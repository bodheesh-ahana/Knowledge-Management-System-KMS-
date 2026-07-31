const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define the schema inline
const manualTicketSchema = new mongoose.Schema({
  serialNumber: { type: Number, required: true },
  ticketId: { type: String, required: true },
  month: { type: String, required: true },
  resolvedByOurTeam: { type: String, default: '' },
  reassignedToOtherTeams: { type: String, default: '' },
  escalatedToOEM: { type: String, default: '' },
  slaBreach: { type: String, default: '' },
  reason: { type: String, default: '' },
  createdDate: { type: Date, default: null },
  resolvedDate: { type: Date, default: null },
  averageResolutionTime: { type: String, default: '' },
});

const ManualTicket = mongoose.models.ManualTicket || mongoose.model('ManualTicket', manualTicketSchema);

// Parse the manual report data
function parseManualReport(data) {
  const lines = data.split('\n').filter(line => line.trim());
  const tickets = [];
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('.')) continue;
    
    // Split by tab
    const parts = line.split('\t');
    
    if (parts.length < 2) continue;
    
    const ticket = {
      serialNumber: parseInt(parts[0]) || i,
      ticketId: parts[1] || '',
      month: parts[2] || '',
      resolvedByOurTeam: parts[3] || '',
      reassignedToOtherTeams: parts[4] || '',
      escalatedToOEM: parts[5] || '',
      slaBreach: parts[6] || '',
      reason: parts[7] || '',
      createdDate: parseDate(parts[8]),
      resolvedDate: parseDate(parts[9]),
      averageResolutionTime: parts[10] || '',
    };
    
    // Only add if we have a ticket ID
    if (ticket.ticketId) {
      tickets.push(ticket);
    }
  }
  
  return tickets;
}

// Parse date string to Date object
function parseDate(dateStr) {
  if (!dateStr || dateStr === 'NA' || dateStr === '') return null;
  
  // Try various date formats
  const formats = [
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // DD/MM/YYYY or MM/DD/YYYY
    /(\d{1,2})-(\d{1,2})-(\d{4})/, // DD-MM-YYYY or MM-DD-YYYY
    /(\w{3}) (\d{1,2}), (\d{4})/, // May 27, 2026
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      // For format like "May 27, 2026"
      if (format.toString().includes('\\w')) {
        const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 10 };
        const month = match[1].toLowerCase().substring(0, 3);
        const monthNum = months[month] || 0;
        return new Date(parseInt(match[3]), monthNum, parseInt(match[2]));
      }
      
      // For DD/MM/YYYY or MM/DD/YYYY
      // Assuming DD/MM/YYYY format based on the data
      const day = parseInt(match[1]);
      const month = parseInt(match[2]) - 1;
      const year = parseInt(match[3]);
      return new Date(year, month, day);
    }
  }
  
  return null;
}

async function importManualTickets() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Read the manual report file
    const filePath = path.join(__dirname, '../tickets/manualreport.md');
    const data = fs.readFileSync(filePath, 'utf-8');
    
    // Parse the data
    const tickets = parseManualReport(data);
    console.log(`Parsed ${tickets.length} tickets from manual report`);
    
    // Clear existing data
    await ManualTicket.deleteMany({});
    console.log('Cleared existing manual tickets');
    
    // Insert new data
    const result = await ManualTicket.insertMany(tickets);
    console.log(`Successfully imported ${result.length} manual tickets`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('Import completed successfully');
    
  } catch (error) {
    console.error('Error importing manual tickets:', error);
    process.exit(1);
  }
}

// Run the import
importManualTickets();
