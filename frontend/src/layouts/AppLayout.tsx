import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, UserCircle, Trophy, Gavel, Radio,
  BarChart3, Settings, LogOut, Zap, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'operator', 'viewer', 'captain'] },
  { to: '/live-auction', icon: Gavel, label: 'Live Auction', roles: ['admin', 'operator'] },
  { to: '/captain-live', icon: Gavel, label: 'Live Bidding', roles: ['captain'] },
  { to: '/live', icon: Radio, label: 'Live Screen', roles: ['admin', 'operator', 'viewer', 'captain'] },
  { to: '/groups', icon: Trophy, label: 'Groups', roles: ['admin'] },
  { to: '/captains', icon: UserCircle, label: 'Captains', roles: ['admin'] },
  { to: '/players', icon: Users, label: 'Players', roles: ['admin'] },
  { to: '/teams', icon: Users, label: 'Teams', roles: ['admin', 'operator', 'viewer', 'captain'] },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['admin'] },
  { to: '/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const filteredNav = navItems.filter(item => user && item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-surface-500 overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 72 }}
        className="h-full bg-surface-400/80 backdrop-blur-xl border-r border-white/5 flex flex-col z-30 relative"
      >
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-white/5 h-16">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-green to-emerald-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-black" />
          </div>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
              <h1 className="font-bold text-lg text-white tracking-tight">CPL Auction</h1>
              <p className="text-xs text-gray-500">Cricket Premier League</p>
            </motion.div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + collapse */}
        <div className="p-3 border-t border-white/5 space-y-2">
          {sidebarOpen && user && (
            <div className="px-3 py-2 rounded-xl bg-surface-300/50">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex-1 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5 mx-auto" /> : <Menu className="w-5 h-5 mx-auto" />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 lg:p-8 max-w-[1600px] mx-auto"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
