import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/analytics/summary
router.get('/summary', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [groupsRes, captainsRes, playersRes, soldRes, logsRes] = await Promise.all([
      supabase.from('groups').select('id', { count: 'exact' }),
      supabase.from('captains').select('id', { count: 'exact' }),
      supabase.from('players').select('id', { count: 'exact' }),
      supabase.from('players').select('id, sold_price', { count: 'exact' }).eq('status', 'sold'),
      supabase.from('auction_logs').select('price').eq('action', 'sold').order('price', { ascending: false }).limit(1),
    ]);

    const highestBid = logsRes.data?.[0]?.price || 0;
    const totalPlayers = playersRes.count || 0;
    const soldPlayers = soldRes.count || 0;

    res.json({
      summary: {
        totalGroups: groupsRes.count || 0,
        totalCaptains: captainsRes.count || 0,
        totalPlayers,
        playersSold: soldPlayers,
        highestBid,
        auctionProgress: totalPlayers > 0 ? Math.round((soldPlayers / totalPlayers) * 100) : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/analytics/teams
router.get('/teams', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data: captains, error: captError } = await supabase
      .from('captains')
      .select('*')
      .order('created_at', { ascending: true });

    if (captError) throw captError;

    const teams = [];
    for (const captain of captains || []) {
      const { data: players } = await supabase
        .from('players')
        .select('id, name, role, sold_price')
        .eq('sold_to', captain.id)
        .eq('status', 'sold');

      teams.push({
        captain_id: captain.id,
        captain_name: captain.name,
        team_name: captain.team_name,
        purse: captain.purse,
        spent: captain.spent,
        remaining: captain.purse - captain.spent,
        player_count: players?.length || 0,
        players: players || [],
      });
    }

    res.json({ teams });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch team data' });
  }
});

export default router;
