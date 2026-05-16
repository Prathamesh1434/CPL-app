import { Client } from 'pg';

async function fixConstraints() {
  const connectionString = 'postgresql://postgres:motkU9-mexref-sobfab@db.ztkzusijufznciucemoo.supabase.co:5432/postgres';
  const client = new Client({ connectionString });

  try {
    console.log('Connecting to Supabase to fix foreign key constraints...');
    await client.connect();

    // 1. Fix auction_logs -> players constraint
    console.log('Updating auction_logs constraint to ON DELETE CASCADE...');
    await client.query(`
      ALTER TABLE auction_logs DROP CONSTRAINT IF EXISTS auction_logs_player_id_fkey;
      ALTER TABLE auction_logs ADD CONSTRAINT auction_logs_player_id_fkey 
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE;
    `);

    // 2. Fix auction_logs -> captains constraint (just in case)
    console.log('Updating auction_logs captain_id constraint to ON DELETE CASCADE...');
    await client.query(`
      ALTER TABLE auction_logs DROP CONSTRAINT IF EXISTS auction_logs_captain_id_fkey;
      ALTER TABLE auction_logs ADD CONSTRAINT auction_logs_captain_id_fkey 
        FOREIGN KEY (captain_id) REFERENCES captains(id) ON DELETE CASCADE;
    `);

    console.log('✅ Database constraints fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing constraints:', error);
  } finally {
    await client.end();
  }
}

fixConstraints();
