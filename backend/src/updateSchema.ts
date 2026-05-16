import { Client } from 'pg';

async function updateSchema() {
  const connectionString = 'postgresql://postgres:motkU9-mexref-sobfab@db.ztkzusijufznciucemoo.supabase.co:5432/postgres';
  const client = new Client({ connectionString });

  try {
    console.log('Connecting to Supabase to update schema for Captains...');
    await client.connect();

    // 1. Update the role check constraint in users table
    console.log('Updating users table role constraint...');
    await client.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'operator', 'viewer', 'captain'));
    `);

    // 2. Add user_id column to captains table
    console.log('Adding user_id to captains table...');
    await client.query(`
      ALTER TABLE captains ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES users(id) UNIQUE;
    `);

    console.log('✅ Database schema updated successfully!');
  } catch (error) {
    console.error('❌ Error updating schema:', error);
  } finally {
    await client.end();
  }
}

updateSchema();
