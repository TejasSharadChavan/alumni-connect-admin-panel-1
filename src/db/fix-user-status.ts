import { db } from './index';
import { users } from './schema';
import { ne } from 'drizzle-orm';

async function fixUserStatus() {
  try {
    console.log('Checking user statuses...');
    
    // Get all users
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      status: users.status
    }).from(users).limit(20);
    
    console.log('\nCurrent users:');
    allUsers.forEach(u => {
      console.log(`- ${u.email} (${u.role}): ${u.status}`);
    });
    
    // Update all users to active status
    console.log('\nUpdating all users to active status...');
    const result = await db.update(users)
      .set({ status: 'active' })
      .where(ne(users.status, 'active'));
    
    console.log('✓ All users updated to active status!');
    
    // Verify
    const updatedUsers = await db.select({
      id: users.id,
      email: users.email,
      status: users.status
    }).from(users).limit(20);
    
    console.log('\nUpdated users:');
    updatedUsers.forEach(u => {
      console.log(`- ${u.email}: ${u.status}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing user status:', error);
    process.exit(1);
  }
}

fixUserStatus();