import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gavel, RotateCcw, Play } from 'lucide-react';
import { useAuctionStore } from '../stores/auctionStore';
import SpinningWheel from '../components/auction/SpinningWheel';
import BiddingPanel from '../components/auction/BiddingPanel';
import api from '../services/api';
import { socketService } from '../services/socket';
import { Group, AuctionLog } from '../types';
import toast from 'react-hot-toast';

export default function LiveAuctionPage() {
  const { state, initialize, cleanup, startAuction, spinWheel, placeBid, markSold, markUnsold, resetAuction, error } = useAuctionStore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinTarget, setSpinTarget] = useState<number | undefined>();
  const [logs, setLogs] = useState<AuctionLog[]>([]);

  useEffect(() => {
    initialize();
    api.get('/groups').then(res => setGroups(res.data.groups)).catch(() => {});
    api.get('/auction/logs').then(res => setLogs(res.data.logs?.slice(0, 20) || [])).catch(() => {});

    // Listen for spin events
    const handleSpin = (data: any) => {
      setIsSpinning(true);
      setSpinTarget(data.targetIndex);
      setTimeout(() => setIsSpinning(false), 5000);
    };

    const handleSold = (data: any) => {
      toast.success(`${data.selectedPlayer?.name} SOLD! 🎉`);
      api.get('/auction/logs').then(res => setLogs(res.data.logs?.slice(0, 20) || [])).catch(() => {});
    };

    const handleUnsold = (data: any) => {
      toast(`${data.selectedPlayer?.name} went unsold`, { icon: '❌' });
      api.get('/auction/logs').then(res => setLogs(res.data.logs?.slice(0, 20) || [])).catch(() => {});
    };

    socketService.on('auction:spin', handleSpin);
    socketService.on('auction:sold', handleSold);
    socketService.on('auction:unsold', handleUnsold);

    return () => {
      socketService.off('auction:spin', handleSpin);
      socketService.off('auction:sold', handleSold);
      socketService.off('auction:unsold', handleUnsold);
    };
  }, []);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleStartAuction = () => {
    if (!selectedGroup) { toast.error('Select a group first'); return; }
    startAuction(selectedGroup);
  };

  const handleSpin = () => {
    if (state.wheelPool.length === 0) { toast.error('No players left'); return; }
    spinWheel();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Gavel className="w-8 h-8 text-neon-green" /> Live Auction
          </h1>
          <p className="text-gray-400 mt-1">
            {state.activeGroupName ? `Active: ${state.activeGroupName}` : 'Select a group to start'}
            {state.wheelPool.length > 0 && ` • ${state.wheelPool.length} players remaining`}
          </p>
        </div>
        <div className="flex gap-2">
          {state.status !== 'idle' && (
            <button onClick={resetAuction} className="btn-secondary flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Group Selection */}
      {state.status === 'idle' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card neon-border p-8 text-center max-w-lg mx-auto">
          <Gavel className="w-16 h-16 mx-auto mb-4 text-neon-green opacity-50" />
          <h2 className="text-xl font-semibold text-white mb-4">Start Auction</h2>
          <div className="space-y-4">
            <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} className="input-field text-center">
              <option value="">Select a group...</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <button onClick={handleStartAuction} disabled={!selectedGroup} className="btn-primary w-full flex items-center justify-center gap-2">
              <Play className="w-5 h-5" /> Start Auction
            </button>
          </div>
        </motion.div>
      )}

      {/* Active Auction */}
      {state.status !== 'idle' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wheel - Left */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Auction Wheel</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{state.wheelPool.length} players</span>
                  {(state.status === 'group_selected') && (
                    <button onClick={handleSpin} disabled={isSpinning} className="btn-primary flex items-center gap-2">
                      🎯 Spin Wheel
                    </button>
                  )}
                </div>
              </div>
              <div className="flex justify-center">
                <SpinningWheel
                  players={state.status === 'group_selected' ? state.wheelPool : (state.selectedPlayer ? [...state.wheelPool, state.selectedPlayer] : state.wheelPool)}
                  isSpinning={isSpinning}
                  targetIndex={spinTarget}
                />
              </div>
            </div>
          </div>

          {/* Bidding Panel - Right */}
          <div>
            <BiddingPanel
              selectedPlayer={state.selectedPlayer}
              currentBid={state.currentBid}
              highestBidder={state.highestBidder}
              onBid={placeBid}
              onSold={markSold}
              onUnsold={markUnsold}
              status={state.status}
            />
          </div>
        </div>
      )}

      {/* Auction Log */}
      {logs.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Auction Log</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {logs.map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-300/30">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${log.action === 'sold' ? 'bg-neon-green' : 'bg-yellow-400'}`} />
                  <span className="text-sm text-white">{log.player_name}</span>
                  {log.action === 'sold' && <span className="text-xs text-gray-400">→ {log.team_name}</span>}
                </div>
                {log.action === 'sold' ? (
                  <span className="text-neon-green font-semibold text-sm">₹{log.price}</span>
                ) : (
                  <span className="text-yellow-400 text-xs">Unsold</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
