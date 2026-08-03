import '../setup/mongodb';
import VIPUser from '../../models/VIPUser';

describe('VIPUser Model', () => {
  it('should create a valid VIP user', async () => {
    const validUser = {
      name: 'John Doe',
      company: 'Numera VIP Client',
      priority: 'P1',
      notes: 'VIP User - requires immediate P1 priority for all tickets',
    };

    const user = await VIPUser.create(validUser);

    expect(user.name).toBe(validUser.name);
    expect(user.company).toBe(validUser.company);
    expect(user.priority).toBe(validUser.priority);
    expect(user.notes).toBe(validUser.notes);
    expect(user.isActive).toBe(true);
  });

  it('should fail without required fields', async () => {
    const invalidUser = {
      company: 'Numera VIP Client',
    };

    await expect(VIPUser.create(invalidUser)).rejects.toThrow();
  });

  it('should fail with invalid priority', async () => {
    const invalidUser = {
      name: 'John Doe',
      company: 'Numera VIP Client',
      priority: 'INVALID',
      notes: 'Test',
    };

    await expect(VIPUser.create(invalidUser)).rejects.toThrow();
  });

  it('should have default isActive as true', async () => {
    const user = await VIPUser.create({
      name: 'Jane Doe',
      company: 'Numera VIP Client',
      priority: 'P1',
      notes: 'Test',
    });

    expect(user.isActive).toBe(true);
  });

  it('should allow updating isActive', async () => {
    const user = await VIPUser.create({
      name: 'Jane Doe',
      company: 'Numera VIP Client',
      priority: 'P1',
      notes: 'Test',
    });

    user.isActive = false;
    await user.save();

    const updatedUser = await VIPUser.findById(user._id);
    expect(updatedUser.isActive).toBe(false);
  });

  it('should support text search on name and company', async () => {
    await VIPUser.create({
      name: 'John Smith',
      company: 'Numera VIP Client',
      priority: 'P1',
      notes: 'Test',
    });

    await VIPUser.create({
      name: 'Jane Doe',
      company: 'Numera VIP Client',
      priority: 'P2',
      notes: 'Test',
    });

    const results = await VIPUser.find({
      $text: { $search: 'John' }
    });

    expect(results.length).toBe(1);
    expect(results[0].name).toBe('John Smith');
  });
});
