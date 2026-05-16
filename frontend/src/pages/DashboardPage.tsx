import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCircle, Trophy, Gavel, TrendingUp, Activity, Radio, BarChart3 } from 'lucide-react';
import api from '../services/api';
import { DashboardSummary, AuctionLog } from '../types';

function StatCard({ icon: Icon, label, value, color, delay }: {
  icon: any; label: string; value: string | number; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="stat-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [logs, setLogs] = useState<AuctionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, logsRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/auction/logs'),
        ]);
        setSummary(summaryRes.data.summary);
        setLogs(logsRes.data.logs?.slice(0, 10) || []);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Cricket Premier League — Live Auction Control Center</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Trophy} label="Total Groups" value={summary?.totalGroups ?? 0} color="bg-neon-blue/20 text-neon-blue" delay={0} />
        <StatCard icon={UserCircle} label="Total Captains" value={summary?.totalCaptains ?? 0} color="bg-neon-purple/20 text-neon-purple" delay={0.1} />
        <StatCard icon={Users} label="Total Players" value={summary?.totalPlayers ?? 0} color="bg-neon-orange/20 text-neon-orange" delay={0.2} />
        <StatCard icon={Gavel} label="Players Sold" value={summary?.playersSold ?? 0} color="bg-neon-green/20 text-neon-green" delay={0.3} />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Highest Bid</p>
              <p className="text-3xl font-bold neon-text">₹{summary?.highestBid ?? 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-neon-green/20 text-neon-green">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Auction Progress</p>
              <p className="text-3xl font-bold text-white">{summary?.auctionProgress ?? 0}%</p>
            </div>
            <div className="p-3 rounded-xl bg-neon-blue/20 text-neon-blue">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 h-2 bg-surface-300/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${summary?.auctionProgress ?? 0}%` }}
              transition={{ duration: 1, delay: 0.8 }}
              className="h-full bg-gradient-to-r from-neon-green to-emerald-500 rounded-full"
            />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <Radio className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Live Status</p>
              <p className="text-lg font-semibold text-white">
                {(summary?.playersSold ?? 0) > 0 ? 'In Progress' : 'Not Started'}
              </p>
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${(summary?.playersSold ?? 0) > 0 ? 'bg-neon-green animate-pulse' : 'bg-gray-600'}`} />
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-neon-green" />
          <h2 className="text-xl font-semibold text-white">Recent Auction Activity</h2>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Gavel className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No auction activity yet</p>
            <p className="text-sm mt-1">Start an auction to see activity here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-300/30 hover:bg-surface-300/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${log.action === 'sold' ? 'bg-neon-green' : 'bg-yellow-400'}`} />
                  <div>
                    <p className="text-sm text-white font-medium">{log.player_name}</p>
                    <p className="text-xs text-gray-500">
                      {log.action === 'sold' ? `→ ${log.team_name}` : 'Unsold'} • {log.group_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {log.action === 'sold' ? (
                    <span className="text-neon-green font-semibold">₹{log.price}</span>
                  ) : (
                    <span className="text-yellow-400 text-sm">Unsold</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
