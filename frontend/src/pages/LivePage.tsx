import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuctionState, Captain } from '../types';
import { socketService } from '../services/socket';
import api from '../services/api';

export default function LivePage() {
  const [state, setState] = useState<AuctionState | null>(null);
  const [captains, setCaptains] = useState<Captain[]>([]);

  useEffect(() => {
    socketService.connect();

    const handleUpdate = (newState: AuctionState) => setState(newState);
    const handleState = (newState: AuctionState) => setState(newState);

    socketService.on('auction:update', handleUpdate);
    socketService.on('auction:state', handleState);
    socketService.on('auction:sold', handleUpdate);
    socketService.on('auction:unsold', handleUpdate);
    socketService.on('auction:bid', () => {});

    socketService.emit('auction:state');

    // Fetch captains for purse display
    api.get('/captains').then(res => setCaptains(res.data.captains)).catch(() => {});

    return () => {
      socketService.off('auction:update', handleUpdate);
      socketService.off('auction:state', handleState);
    };
  }, []);

  const isActive = state && state.status !== 'idle';

  return (
    <div className="min-h-screen live-bg text-white p-8 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-black tracking-tight">
          <span className="neon-text">CPL</span> <span className="text-white">AUCTION</span>
        </motion.h1>
        {state?.activeGroupName && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl text-neon-blue mt-2">
            {state.activeGroupName}
          </motion.p>
        )}
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`} />
          <span className="text-sm text-gray-400">{isActive ? 'LIVE' : 'WAITING'}</span>
        </div>
      </div>

      {!isActive ? (
        <div className="flex items-center justify-center h-[60vh]">
          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
            className="text-center">
            <div className="text-8xl mb-6">🏏</div>
            <p className="text-2xl text-gray-400">Waiting for auction to begin...</p>
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-[1600px] mx-auto">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Current Player */}
            <AnimatePresence mode="wait">
              {state.selectedPlayer ? (
                <motion.div key={state.selectedPlayer.id} initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  className="glass-card neon-border p-12 text-center">
                  <p className="text-sm text-gray-400 uppercase tracking-[0.3em] mb-4">Now Bidding</p>
                  <h2 className="text-6xl font-black text-white mb-3">{state.selectedPlayer.name}</h2>
                  <p className="text-2xl text-neon-blue mb-6">{state.selectedPlayer.role}</p>

                  <div className="flex items-center justify-center gap-12">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Base Price</p>
                      <p className="text-3xl font-bold text-white">₹{state.selectedPlayer.base_price}</p>
                    </div>
                    <div className="w-px h-16 bg-white/10" />
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Current Bid</p>
                      <motion.p key={state.currentBid} initial={{ scale: 1.5 }} animate={{ scale: 1 }}
                        className="text-5xl font-black neon-text">
                        ₹{state.currentBid}
                      </motion.p>
                    </div>
                  </div>

                  {state.highestBidder && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-8 inline-block px-8 py-3 rounded-full bg-neon-blue/10 border border-neon-blue/30">
                      <p className="text-neon-blue text-xl font-semibold">
                        🏆 {state.highestBidder.captainName} — {state.highestBidder.teamName}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ) : state.status === 'sold' || state.status === 'unsold' ? (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  className={`glass-card p-12 text-center ${state.status === 'sold' ? 'border-2 border-neon-green/50' : 'border-2 border-yellow-500/50'}`}>
                  <div className="text-6xl mb-4">{state.status === 'sold' ? '🎉' : '❌'}</div>
                  <h2 className="text-4xl font-black text-white">{state.status === 'sold' ? 'SOLD!' : 'UNSOLD'}</h2>
                  <p className="text-xl text-gray-400 mt-2">{state.lastAction}</p>
                </motion.div>
              ) : (
                <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="glass-card p-12 text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-2xl text-gray-400">Spinning wheel...</p>
                  <p className="text-sm text-gray-500 mt-2">{state.wheelPool.length} players in pool</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status Bar */}
            <div className="glass-card p-4 flex items-center justify-between">
              <span className="text-sm text-gray-400">{state.lastAction}</span>
              <span className="text-sm text-gray-500">{state.wheelPool.length} players remaining</span>
            </div>
          </div>

          {/* Team Purses Sidebar */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-300 uppercase tracking-wider mb-4">Team Purses</h3>
            {captains.map(captain => (
              <div key={captain.id}
                className={`glass-card p-4 transition-all ${state.highestBidder?.captainId === captain.id ? 'neon-border' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{captain.team_name}</p>
                    <p className="text-xs text-gray-500">{captain.name}</p>
                  </div>
                  <p className="text-lg font-bold text-neon-green">₹{captain.remaining}</p>
                </div>
                <div className="h-1.5 bg-surface-300/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-neon-green to-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.max(0, (captain.remaining / captain.purse) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
