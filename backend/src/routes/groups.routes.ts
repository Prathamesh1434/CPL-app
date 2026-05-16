import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/groups
router.get('/', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json({ groups: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// POST /api/groups
router.post('/', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Group name is required' });
      return;
    }

    const { data, error } = await supabase
      .from('groups')
      .insert({ name })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ group: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// PUT /api/groups/:id
router.put('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, active } = req.body;

    const { data, error } = await supabase
      .from('groups')
      .update({ name, active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ group: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// DELETE /api/groups/:id
router.delete('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('groups').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Group deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

export default router;
