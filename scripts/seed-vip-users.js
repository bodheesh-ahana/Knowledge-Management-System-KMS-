require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Define schema inline
const VIPUserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true, default: 'Numera VIP Client' },
  priority: { type: String, required: true, enum: ['P1', 'P2', 'P3'], default: 'P1' },
  notes: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const VIPUser = mongoose.model('VIPUser', VIPUserSchema);

const vipUsersData = [
  { name: 'Benjamin Ancher', company: 'Numera VIP Client', priority: 'P1', notes: 'VIP User - requires immediate P1 priority for all tickets' },
  { name: 'Bill Shenkin', company: 'Numera VIP Client', priority: 'P1', notes: 'VIP User - requires immediate P1 priority for all tickets' },
  { name: 'Gabsriel Buldra', company: 'Numera VIP Client', priority: 'P1', notes: 'VIP User - requires immediate P1 priority for all tickets' },
  { name: 'Jean Pierre Puchulu', company: 'Numera VIP Client', priority: 'P1', notes: 'VIP User - requires immediate P1 priority for all tickets' },
  { name: 'Jorge Romero', company: 'Numera VIP Client', priority: 'P1', notes: 'VIP User - requires immediate P1 priority for all tickets' },
  { name: 'Jyotsna Thota', company: 'Numera VIP Client', priority: 'P1', notes: 'VIP User - requires immediate P1 priority for all tickets' },
  { name: 'Madhusudham Mendu', company: 'Numera VIP Client', priority: 'P1', notes: 'VIP User - requires immediate P1 priority for all tickets' },
  { name: 'Mike Jerram', company: 'Numera VIP Client', priority: 'P1', notes: 'VIP User - requires immediate P1 priority for all tickets' },
  { name: 'Nicholas Meester', company: 'Numera VIP Client', priority: 'P1', notes: 'VIP User - requires immediate P1 priority for all tickets' },
  { name: 'Phillipus Cilliers', company: 'Numera VIP Client', priority: 'P1', notes: 'VIP User - requires immediate P1 priority for all tickets' },
  { name: 'Rahul Chatterjee', company: 'Numera VIP Client', priority: 'P1', notes: 'VIP User - requires immediate P1 priority for all tickets' },
  { name: 'Sandeep Shroff (CEO)', company: 'Numera VIP Client', priority: 'P1', notes: 'VIP User (CEO) - requires immediate P1 priority for all tickets' },
  { name: 'Sara Meher', company: 'Numera VIP Client', priority: 'P1', notes: 'VIP User - requires immediate P1 priority for all tickets' },
  { name: 'Scott', company: 'Numera VIP Client', priority: 'P1', notes: 'VIP User - requires immediate P1 priority for all tickets' },
  { name: 'Shilpa Sharma', company: 'Numera VIP Client', priority: 'P1', notes: 'VIP User - requires immediate P1 priority for all tickets' },
  { name: 'Shriya Garg', company: 'Numera VIP Client', priority: 'P1', notes: 'VIP User - requires immediate P1 priority for all tickets' },
  { name: 'Traci Cilliers', company: 'Numera VIP Client', priority: 'P1', notes: 'VIP User - requires immediate P1 priority for all tickets' },
  { name: 'Vincent Vo', company: 'Numera VIP Client', priority: 'P1', notes: 'VIP User - requires immediate P1 priority for all tickets' },
];

async function seedVIPUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing VIP users
    await VIPUser.deleteMany({});
    console.log('Cleared existing VIP users');

    // Insert VIP users
    const inserted = await VIPUser.insertMany(vipUsersData);
    console.log(`✅ Inserted ${inserted.length} VIP users`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedVIPUsers();
