import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Database, Shield, Bell, Palette } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-white">Settings</h1><p className="text-gray-400 mt-1">Platform configuration</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4"><Shield className="w-5 h-5 text-neon-blue" /><h3 className="text-lg font-semibold text-white">Account</h3></div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-400">Name</span><span className="text-white">{user?.name}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Email</span><span className="text-white">{user?.email}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Role</span><span className="text-neon-green capitalize">{user?.role}</span></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4"><Database className="w-5 h-5 text-neon-purple" /><h3 className="text-lg font-semibold text-white">Database</h3></div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-400">Provider</span><span className="text-white">Supabase PostgreSQL</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Status</span><span className="text-neon-green">● Connected</span></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4"><Bell className="w-5 h-5 text-neon-orange" /><h3 className="text-lg font-semibold text-white">Notifications</h3></div>
          <p className="text-sm text-gray-400">Notification settings will be available in v2.0</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4"><Palette className="w-5 h-5 text-neon-pink" /><h3 className="text-lg font-semibold text-white">Appearance</h3></div>
          <p className="text-sm text-gray-400">Theme customization coming in v2.0</p>
        </motion.div>
      </div>

      <div className="glass-card p-4 text-center text-sm text-gray-500">
        CPL Auction Platform v1.0.0 • Built with ❤️ for Cricket
      </div>
    </div>
  );
}
