const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const ticketLogSchema = new mongoose.Schema({
  account: String,
  requestId: { type: String, required: true },
  status: String,
  requestType: String,
  category: String,
  technician: String,
  subject: String,
  requester: String,
  createdTime: Date,
  respondedDate: Date,
  responseDueByTime: Date,
  resolvedTime: Date,
  slaResolutionTime: String,
  slaResponseTime: String,
  source: String,
});

const TicketLog = mongoose.models.TicketLog || mongoose.model('TicketLog', ticketLogSchema);

async function cleanupTicketLog() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all 2025 data
    const delete2025 = await TicketLog.deleteMany({
      createdTime: {
        $gte: new Date('2025-01-01'),
        $lt: new Date('2026-01-01'),
      },
    });
    console.log(`Deleted ${delete2025.deletedCount} records from 2025`);

    // Delete Jan/Feb 2026 onboarding and offboarding data
    const deleteOnboardingOffboarding = await TicketLog.deleteMany({
      category: { $in: ['Onboarding', 'Offboarding'] },
      createdTime: {
        $gte: new Date('2026-01-01'),
        $lt: new Date('2026-03-01'),
      },
    });
    console.log(`Deleted ${deleteOnboardingOffboarding.deletedCount} onboarding/offboarding records from Jan/Feb 2026`);

    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
  }
}

cleanupTicketLog();
