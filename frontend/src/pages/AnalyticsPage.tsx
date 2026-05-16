import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Brain, Star, Globe, Lock } from 'lucide-react';

const features = [
  { icon: TrendingUp, title: 'Spending Trends', desc: 'Track spending patterns across teams', badge: 'Coming Soon' },
  { icon: BarChart3, title: 'Team Balance', desc: 'Analyze role distribution and team composition', badge: 'Coming Soon' },
  { icon: Users, title: 'Player Demand', desc: 'Most contested player analysis', badge: 'Beta' },
  { icon: Brain, title: 'AI Valuation', desc: 'ML-powered player valuation engine', badge: 'Coming Soon' },
  { icon: Star, title: 'MVP Engine', desc: 'Performance-based MVP predictions', badge: 'Coming Soon' },
  { icon: Globe, title: 'CricHeroes Sync', desc: 'Import stats from CricHeroes platform', badge: 'Coming Soon' },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-white">Analytics</h1><p className="text-gray-400 mt-1">Advanced auction analytics & insights</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feat, i) => (
          <motion.div key={feat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card p-6 relative overflow-hidden group cursor-default">
            <div className="absolute top-3 right-3">
              <span className={`badge ${feat.badge === 'Beta' ? 'bg-neon-blue/20 text-neon-blue border-neon-blue/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                {feat.badge}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface-300/50 w-fit mb-4">
              <feat.icon className="w-6 h-6 text-gray-400 group-hover:text-neon-green transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{feat.title}</h3>
            <p className="text-sm text-gray-400">{feat.desc}</p>
            <div className="absolute inset-0 bg-surface-400/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 text-gray-300"><Lock className="w-5 h-5" /><span className="font-medium">Coming in v2.0</span></div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
