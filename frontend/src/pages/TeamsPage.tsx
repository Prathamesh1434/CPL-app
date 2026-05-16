import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy } from 'lucide-react';
import api from '../services/api';
import { TeamData } from '../types';

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/teams').then(res => setTeams(res.data.teams)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-white">Teams</h1><p className="text-gray-400 mt-1">Auto-generated team compositions</p></div>

      {teams.length === 0 ? (
        <div className="glass-card p-12 text-center"><Trophy className="w-12 h-12 mx-auto mb-3 text-gray-600" /><p className="text-gray-400">No teams yet — captains will appear here after auction</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team, i) => (
            <motion.div key={team.captain_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card-hover overflow-hidden">
              {/* Team Header */}
              <div className="p-6 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">{team.team_name}</h3>
                    <p className="text-sm text-gray-400">Captain: {team.captain_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Remaining</p>
                    <p className="text-2xl font-bold text-neon-green">₹{team.remaining}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-4 text-sm text-gray-400">
                  <span>Purse: ₹{team.purse}</span>
                  <span>Spent: ₹{team.spent}</span>
                  <span>Players: {team.player_count}</span>
                </div>
                <div className="h-2 bg-surface-300/50 rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-gradient-to-r from-neon-green to-emerald-500 rounded-full" style={{ width: `${(team.remaining / team.purse) * 100}%` }} />
                </div>
              </div>

              {/* Players */}
              <div className="p-4">
                {team.players && team.players.length > 0 ? (
                  <div className="space-y-2">
                    {team.players.map(player => (
                      <div key={player.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-white">{player.name}</p>
                            <p className="text-xs text-gray-500">{player.role}</p>
                          </div>
                        </div>
                        <span className="text-sm text-neon-green font-medium">₹{player.sold_price}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4 text-sm">No players purchased yet</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
