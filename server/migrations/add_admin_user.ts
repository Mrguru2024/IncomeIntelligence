
import { db } from '../db';
import { users } from '@shared/schema';

async function createAdminUser() {
  try {
    await db.insert(users).values({
      username: 'Mrguru2026',
      email: '5epmgllc@gmail.com',
      password: '', // This will be set through Firebase Auth
      role: 'admin',
      accountStatus: 'active',
      verified: true,
      profileCompleted: true,
      onboardingCompleted: true
    });
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();
