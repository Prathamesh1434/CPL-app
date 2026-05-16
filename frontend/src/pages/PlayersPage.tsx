import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Users, X, Search, Upload } from 'lucide-react';
import api from '../services/api';
import { Player, Group } from '../types';
import toast from 'react-hot-toast';

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [form, setForm] = useState({ name: '', role: 'Batsman', group_id: '', base_price: 100 });
  const [bulkText, setBulkText] = useState('');
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchData = async () => {
    try {
      const [pRes, gRes] = await Promise.all([api.get('/players'), api.get('/groups')]);
      setPlayers(pRes.data.players); setGroups(gRes.data.groups);
    } catch { toast.error('Failed to fetch'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = players.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterGroup && p.group_id !== filterGroup) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, group_id: form.group_id || null };
      if (editPlayer) { await api.put(`/players/${editPlayer.id}`, payload); toast.success('Updated'); }
      else { await api.post('/players', payload); toast.success('Created'); }
      setShowModal(false); fetchData();
    } catch { toast.error('Failed'); }
  };

  const handleBulkAdd = async () => {
    try {
      const lines = bulkText.trim().split('\n').filter(l => l.trim());
      const bulkPlayers = lines.map(line => {
        const [name, role = 'Batsman', base_price = '100'] = line.split(',').map(s => s.trim());
        return { name, role, base_price: parseInt(base_price) || 100, group_id: filterGroup || null };
      });
      await api.post('/players/bulk', { players: bulkPlayers });
      toast.success(`${bulkPlayers.length} players added`);
      setShowBulk(false); setBulkText(''); fetchData();
    } catch { toast.error('Bulk add failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete player?')) return;
    try { await api.delete(`/players/${id}`); toast.success('Deleted'); fetchData(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-3xl font-bold text-white">Players</h1><p className="text-gray-400 mt-1">Manage player pool</p></div>
        <div className="flex gap-2">
          <button onClick={() => setShowBulk(true)} className="btn-secondary flex items-center gap-2"><Upload className="w-4 h-4" /> Bulk Add</button>
          <button onClick={() => { setEditPlayer(null); setForm({ name: '', role: 'Batsman', group_id: '', base_price: 100 }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Player</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search players..." />
        </div>
        <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)} className="input-field w-auto min-w-[150px]">
          <option value="">All Groups</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field w-auto min-w-[130px]">
          <option value="">All Status</option>
          <option value="unsold">Unsold</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" /></div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-medium text-gray-400">Name</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Role</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Group</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Base Price</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Sold To</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Price</th>
                <th className="text-right p-4 text-sm font-medium text-gray-400">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map((player, i) => (
                  <motion.tr key={player.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="table-row">
                    <td className="p-4 text-white font-medium">{player.name}</td>
                    <td className="p-4 text-gray-300">{player.role}</td>
                    <td className="p-4 text-gray-400">{player.group_name || '—'}</td>
                    <td className="p-4 text-gray-300">₹{player.base_price}</td>
                    <td className="p-4"><span className={player.status === 'sold' ? 'badge-sold' : 'badge-unsold'}>{player.status}</span></td>
                    <td className="p-4 text-gray-300">{player.sold_to_team || '—'}</td>
                    <td className="p-4 text-neon-green font-medium">{player.sold_price ? `₹${player.sold_price}` : '—'}</td>
                    <td className="p-4 text-right">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => { setEditPlayer(player); setForm({ name: player.name, role: player.role, group_id: player.group_id || '', base_price: player.base_price }); setShowModal(true); }} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(player.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="p-12 text-center text-gray-500">No players found</div>}
          <div className="p-4 border-t border-white/5 text-sm text-gray-500">Showing {filtered.length} of {players.length} players</div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card neon-border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-semibold text-white">{editPlayer ? 'Edit Player' : 'Add Player'}</h2><button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-300 mb-2">Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required /></div>
              <div><label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="input-field">
                  {['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-300 mb-2">Group</label>
                <select value={form.group_id} onChange={e => setForm({...form, group_id: e.target.value})} className="input-field">
                  <option value="">Select group</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-300 mb-2">Base Price</label><input type="number" value={form.base_price} onChange={e => setForm({...form, base_price: parseInt(e.target.value)})} className="input-field" required /></div>
              <div className="flex gap-3 justify-end"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">{editPlayer ? 'Update' : 'Create'}</button></div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Bulk Add Modal */}
      {showBulk && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card neon-border p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-semibold text-white">Bulk Add Players</h2><button onClick={() => setShowBulk(false)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400"><X className="w-5 h-5" /></button></div>
            <p className="text-sm text-gray-400 mb-4">One player per line: Name, Role, Base Price</p>
            <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} className="input-field h-48 font-mono text-sm" placeholder="Virat Kohli, Batsman, 200&#10;Jasprit Bumrah, Bowler, 150" />
            <div className="flex gap-3 justify-end mt-4"><button onClick={() => setShowBulk(false)} className="btn-secondary">Cancel</button><button onClick={handleBulkAdd} className="btn-primary">Add Players</button></div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
