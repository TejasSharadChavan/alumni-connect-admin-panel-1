import { db } from '../src/db';
import { users } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function addProfileImages() {
  try {
    console.log('Adding profile images to users...');

    // Update Aarav Sharma (student)
    await db.update(users)
      .set({ 
        profileImageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3f882c8b-dfd5-4cb8-ba1d-87b67382094d/generated_images/professional-headshot-portrait-of-a-youn-60acf566-20251201084746.jpg',
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.email, 'aarav.sharma@terna.ac.in'));
    console.log('✓ Updated Aarav Sharma');

    // Update Prof. Kapoor (faculty)
    await db.update(users)
      .set({ 
        profileImageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3f882c8b-dfd5-4cb8-ba1d-87b67382094d/generated_images/professional-headshot-portrait-of-a-dist-610feaa6-20251201084746.jpg',
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.email, 'prof.kapoor@terna.ac.in'));
    console.log('✓ Updated Prof. Kapoor');

    // Update Priya Patel (alumni)
    await db.update(users)
      .set({ 
        profileImageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3f882c8b-dfd5-4cb8-ba1d-87b67382094d/generated_images/professional-headshot-portrait-of-a-youn-976e7c28-20251201084746.jpg',
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.email, 'priya.patel@gmail.com'));
    console.log('✓ Updated Priya Patel');

    // Update Rohit Deshmukh (alumni)
    await db.update(users)
      .set({ 
        profileImageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3f882c8b-dfd5-4cb8-ba1d-87b67382094d/generated_images/professional-headshot-portrait-of-a-youn-c10a599b-20251201084745.jpg',
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.email, 'rohit.deshmukh@gmail.com'));
    console.log('✓ Updated Rohit Deshmukh');

    // Update Ananya Desai (student)
    await db.update(users)
      .set({ 
        profileImageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/3f882c8b-dfd5-4cb8-ba1d-87b67382094d/generated_images/professional-headshot-portrait-of-a-youn-12755ed6-20251201084746.jpg',
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.email, 'ananya.desai@terna.ac.in'));
    console.log('✓ Updated Ananya Desai');

    console.log('\n✅ Successfully added profile images to 5 users!');
  } catch (error) {
    console.error('❌ Error adding profile images:', error);
    process.exit(1);
  }
}

addProfileImages();
