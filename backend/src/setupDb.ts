import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

async function setup() {
  const connectionString = 'postgresql://postgres:motkU9-mexref-sobfab@db.ztkzusijufznciucemoo.supabase.co:5432/postgres';
  const client = new Client({ connectionString });

  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();

    const schemaPath = path.resolve(__dirname, '../../supabase/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema.sql...');
    await client.query(sql);
    console.log('✅ Database schema created successfully!');
  } catch (error) {
    console.error('❌ Error creating schema:', error);
  } finally {
    await client.end();
  }
}

setup();
