import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from backend/.env
dotenv.config({ path: resolve(__dirname, '../.env') });

import { supabase } from './config/supabase';

async function fixPurses() {
  console.log('Fetching captains...');
  const { data: captains, error: captainsError } = await supabase.from('captains').select('*');
  
  if (captainsError || !captains) {
    console.error('Failed to fetch captains:', captainsError);
    return;
  }

  for (const captain of captains) {
    // Fetch all currently existing players sold to this captain
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('sold_price')
      .eq('sold_to', captain.id)
      .eq('status', 'sold');

    if (playersError) {
      console.error(`Failed to fetch players for ${captain.name}:`, playersError);
      continue;
    }

    const actualSpent = players ? players.reduce((sum, p) => sum + (p.sold_price || 0), 0) : 0;
    
    if (captain.spent !== actualSpent) {
      console.log(`Fixing ${captain.name} (${captain.team_name}): was ${captain.spent}, should be ${actualSpent}`);
      const { error: updateError } = await supabase
        .from('captains')
        .update({ spent: actualSpent })
        .eq('id', captain.id);
        
      if (updateError) {
        console.error(`Failed to update ${captain.name}:`, updateError);
      } else {
        console.log(`✅ Successfully updated ${captain.name}`);
      }
    } else {
      console.log(`✅ ${captain.name} (${captain.team_name}) is already correct (spent: ${captain.spent})`);
    }
  }
  console.log("Done fixing purses!");
}

fixPurses();
