import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticate, AuthRequest } from '../middleware/auth';
import { auctionEngine } from '../services/auction.service';

const router = Router();

// GET /api/auction/state
router.get('/state', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ state: auctionEngine.getState() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get auction state' });
  }
});

// GET /api/auction/logs
router.get('/logs', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('auction_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json({ logs: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch auction logs' });
  }
});

export default router;
