import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/players
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let query = supabase
      .from('players')
      .select('*, groups(name), captains(name, team_name)')
      .order('created_at', { ascending: true });

    const { group_id, status } = req.query;
    if (group_id) query = query.eq('group_id', group_id as string);
    if (status) query = query.eq('status', status as string);

    const { data, error } = await query;
    if (error) throw error;

    const players = (data || []).map((p: any) => ({
      ...p,
      group_name: p.groups?.name || null,
      sold_to_name: p.captains?.name || null,
      sold_to_team: p.captains?.team_name || null,
    }));

    res.json({ players });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// POST /api/players
router.post('/', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, role, group_id, base_price } = req.body;
    if (!name || !role) {
      res.status(400).json({ error: 'Name and role are required' });
      return;
    }

    const { data, error } = await supabase
      .from('players')
      .insert({ name, role, group_id: group_id || null, base_price: base_price || 100 })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ player: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create player' });
  }
});

// POST /api/players/bulk
router.post('/bulk', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { players } = req.body;
    if (!Array.isArray(players) || players.length === 0) {
      res.status(400).json({ error: 'Players array is required' });
      return;
    }

    const insertData = players.map((p: any) => ({
      name: p.name,
      role: p.role,
      group_id: p.group_id || null,
      base_price: p.base_price || 100,
    }));

    const { data, error } = await supabase
      .from('players')
      .insert(insertData)
      .select();

    if (error) throw error;
    res.status(201).json({ players: data, count: data?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to bulk create players' });
  }
});

// PUT /api/players/:id
router.put('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, role, group_id, base_price, status, sold_to, sold_price } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (group_id !== undefined) updateData.group_id = group_id;
    if (base_price !== undefined) updateData.base_price = base_price;
    if (status !== undefined) updateData.status = status;
    if (sold_to !== undefined) updateData.sold_to = sold_to;
    if (sold_price !== undefined) updateData.sold_price = sold_price;

    const { data, error } = await supabase
      .from('players')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ player: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update player' });
  }
});

// DELETE /api/players/:id
router.delete('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('players').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Player deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

export default router;
