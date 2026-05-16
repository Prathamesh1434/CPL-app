import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Trophy, X } from 'lucide-react';
import api from '../services/api';
import { Group } from '../types';
import toast from 'react-hot-toast';

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [name, setName] = useState('');

  const fetchGroups = async () => {
    try {
      const { data } = await api.get('/groups');
      setGroups(data.groups);
    } catch { toast.error('Failed to fetch groups'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editGroup) {
        await api.put(`/groups/${editGroup.id}`, { name });
        toast.success('Group updated');
      } else {
        await api.post('/groups', { name });
        toast.success('Group created');
      }
      setShowModal(false); setName(''); setEditGroup(null);
      fetchGroups();
    } catch { toast.error('Failed to save group'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this group?')) return;
    try {
      await api.delete(`/groups/${id}`);
      toast.success('Group deleted');
      fetchGroups();
    } catch { toast.error('Failed to delete group'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Groups</h1>
          <p className="text-gray-400 mt-1">Manage auction groups</p>
        </div>
        <button onClick={() => { setEditGroup(null); setName(''); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Group
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" /></div>
      ) : groups.length === 0 ? (
        <div className="glass-card p-12 text-center"><Trophy className="w-12 h-12 mx-auto mb-3 text-gray-600" /><p className="text-gray-400">No groups yet</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group, i) => (
            <motion.div key={group.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card-hover p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neon-purple/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-neon-purple" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{group.name}</h3>
                    <span className={`text-xs ${group.active ? 'text-neon-green' : 'text-gray-500'}`}>
                      {group.active ? '● Active' : '● Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditGroup(group); setName(group.name); setShowModal(true); }} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(group.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card neon-border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">{editGroup ? 'Edit Group' : 'Add Group'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Group Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="e.g., Group A" required />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editGroup ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
