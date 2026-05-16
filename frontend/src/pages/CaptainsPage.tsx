import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, UserCircle, X, Wallet } from 'lucide-react';
import api from '../services/api';
import { Captain, Group } from '../types';
import toast from 'react-hot-toast';

export default function CaptainsPage() {
  const [captains, setCaptains] = useState<Captain[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCaptain, setEditCaptain] = useState<Captain | null>(null);
  const [form, setForm] = useState({ name: '', team_name: '', purse: 2200, group_id: '', email: '', password: '' });

  const fetchData = async () => {
    try {
      const [cRes, gRes] = await Promise.all([api.get('/captains'), api.get('/groups')]);
      setCaptains(cRes.data.captains);
      setGroups(gRes.data.groups);
    } catch { toast.error('Failed to fetch data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditCaptain(null); setForm({ name: '', team_name: '', purse: 2200, group_id: '', email: '', password: '' }); setShowModal(true); };
  const openEdit = (c: Captain) => { setEditCaptain(c); setForm({ name: c.name, team_name: c.team_name, purse: c.purse, group_id: c.group_id || '', email: '', password: '' }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, group_id: form.group_id || null };
      if (editCaptain) { await api.put(`/captains/${editCaptain.id}`, payload); toast.success('Captain updated'); }
      else { await api.post('/captains', payload); toast.success('Captain created'); }
      setShowModal(false); fetchData();
    } catch { toast.error('Failed to save captain'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this captain?')) return;
    try { await api.delete(`/captains/${id}`); toast.success('Deleted'); fetchData(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold text-white">Captains</h1><p className="text-gray-400 mt-1">Manage team captains and purses</p></div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Captain</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" /></div>
      ) : captains.length === 0 ? (
        <div className="glass-card p-12 text-center"><UserCircle className="w-12 h-12 mx-auto mb-3 text-gray-600" /><p className="text-gray-400">No captains yet</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {captains.map((captain, i) => (
            <motion.div key={captain.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card-hover p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-blue/30 to-neon-purple/30 flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-neon-blue" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{captain.name}</h3>
                    <p className="text-sm text-neon-blue">{captain.team_name}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(captain)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(captain.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Total Purse</span>
                  <span className="text-white font-medium">₹{captain.purse}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Spent</span>
                  <span className="text-red-400 font-medium">₹{captain.spent}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Remaining</span>
                  <span className="text-neon-green font-semibold">₹{captain.remaining}</span>
                </div>
                <div className="h-2 bg-surface-300/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-neon-green to-emerald-500 rounded-full transition-all" style={{ width: `${Math.max(0, ((captain.purse - captain.spent) / captain.purse) * 100)}%` }} />
                </div>
              </div>
              {captain.group_name && <div className="mt-3 text-xs text-gray-500">Group: {captain.group_name}</div>}
            </motion.div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card neon-border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">{editCaptain ? 'Edit Captain' : 'Add Captain'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-300 mb-2">Captain Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required /></div>
              <div><label className="block text-sm font-medium text-gray-300 mb-2">Team Name</label><input value={form.team_name} onChange={e => setForm({...form, team_name: e.target.value})} className="input-field" required /></div>
              <div><label className="block text-sm font-medium text-gray-300 mb-2">Purse Amount</label><input type="number" value={form.purse} onChange={e => setForm({...form, purse: parseInt(e.target.value)})} className="input-field" required /></div>
              <div><label className="block text-sm font-medium text-gray-300 mb-2">Group (Optional)</label>
                <select value={form.group_id} onChange={e => setForm({...form, group_id: e.target.value})} className="input-field">
                  <option value="">No group</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              {!editCaptain && (
                <>
                  <div className="pt-4 border-t border-white/10">
                    <h3 className="text-sm font-semibold text-neon-blue mb-3">Captain Login Details</h3>
                    <div className="space-y-4">
                      <div><label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" placeholder="captain@cpl.com" required={!editCaptain} /></div>
                      <div><label className="block text-sm font-medium text-gray-300 mb-2">Password</label><input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input-field" placeholder="Create a password" required={!editCaptain} /></div>
                    </div>
                  </div>
                </>
              )}
              <div className="flex gap-3 justify-end"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">{editCaptain ? 'Update' : 'Create'}</button></div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
