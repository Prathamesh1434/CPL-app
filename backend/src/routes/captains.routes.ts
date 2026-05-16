import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/captains
router.get('/', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('captains')
      .select('*, groups(name)')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const captains = (data || []).map((c: any) => ({
      ...c,
      remaining: c.purse - c.spent,
      group_name: c.groups?.name || null,
    }));

    res.json({ captains });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch captains' });
  }
});

// POST /api/captains
router.post('/', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, team_name, purse, group_id } = req.body;
    if (!name || !team_name) {
      res.status(400).json({ error: 'Name and team name are required' });
      return;
    }

    const { data, error } = await supabase
      .from('captains')
      .insert({ name, team_name, purse: purse || 2200, group_id: group_id || null })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ captain: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create captain' });
  }
});

// PUT /api/captains/:id
router.put('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, team_name, purse, spent, group_id } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (team_name !== undefined) updateData.team_name = team_name;
    if (purse !== undefined) updateData.purse = purse;
    if (spent !== undefined) updateData.spent = spent;
    if (group_id !== undefined) updateData.group_id = group_id;

    const { data, error } = await supabase
      .from('captains')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ captain: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update captain' });
  }
});

// DELETE /api/captains/:id
router.delete('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('captains').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Captain deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete captain' });
  }
});

export default router;
