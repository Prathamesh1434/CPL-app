import bcrypt from 'bcryptjs';
import { Client } from 'pg';

async function seed() {
  console.log('🌱 Seeding database...');

  const connectionString = 'postgresql://postgres:motkU9-mexref-sobfab@db.ztkzusijufznciucemoo.supabase.co:5432/postgres';
  const client = new Client({ connectionString });
  
  try {
    await client.connect();

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO users (name, email, password, role) 
      VALUES ('Admin', 'admin@cpl.com', $1, 'admin')
      ON CONFLICT (email) DO UPDATE SET password = $1
    `, [adminPassword]);
    console.log('✅ Admin user created: admin@cpl.com');

    // Create operator user
    const opPassword = await bcrypt.hash('operator123', 10);
    await client.query(`
      INSERT INTO users (name, email, password, role) 
      VALUES ('Operator', 'operator@cpl.com', $1, 'operator')
      ON CONFLICT (email) DO UPDATE SET password = $1
    `, [opPassword]);
    console.log('✅ Operator user created: operator@cpl.com');

    // Create viewer user
    const viewerPassword = await bcrypt.hash('viewer123', 10);
    await client.query(`
      INSERT INTO users (name, email, password, role) 
      VALUES ('Viewer', 'viewer@cpl.com', $1, 'viewer')
      ON CONFLICT (email) DO UPDATE SET password = $1
    `, [viewerPassword]);
    console.log('✅ Viewer user created: viewer@cpl.com');

    console.log('\n📋 Login credentials:');
    console.log('  Admin:    admin@cpl.com / admin123');
    console.log('  Operator: operator@cpl.com / operator123');
    console.log('  Viewer:   viewer@cpl.com / viewer123');

  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await client.end();
  }
}

seed().catch(console.error);
