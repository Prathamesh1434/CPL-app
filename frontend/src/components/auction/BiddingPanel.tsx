import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, AlertTriangle, ChevronUp, Check, X as XIcon } from 'lucide-react';
import { Captain, Player } from '../../types';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { getNextBids } from '../../utils/bidding';

interface BiddingPanelProps {
  selectedPlayer: Player | null;
  currentBid: number;
  highestBidder: { captainId: string; captainName: string; teamName: string } | null;
  outCaptains: string[];
  onBid: (captainId: string, amount: number) => void;
  onSold: () => void;
  onUnsold: () => void;
  status: string;
}

export default function BiddingPanel({
  selectedPlayer, currentBid, highestBidder, outCaptains, onBid, onSold, onUnsold, status,
}: BiddingPanelProps) {
  const [captains, setCaptains] = useState<Captain[]>([]);
  const [selectedCaptain, setSelectedCaptain] = useState('');
  const [bidAmount, setBidAmount] = useState(0);

  useEffect(() => {
    api.get('/captains').then(res => setCaptains(res.data.captains)).catch(() => {});
  }, []);

  useEffect(() => {
    setBidAmount(currentBid);
  }, [currentBid]);

  const handleBid = () => {
    if (!selectedCaptain) { toast.error('Select a captain'); return; }
    if (bidAmount <= currentBid) { toast.error('Bid must be higher'); return; }
    const captain = captains.find(c => c.id === selectedCaptain);
    if (captain && bidAmount > captain.remaining) {
      toast.error(`Exceeds ${captain.name}'s purse (₹${captain.remaining} left)`);
      return;
    }
    onBid(selectedCaptain, bidAmount);
  };

  if (!selectedPlayer) {
    return (
      <div className="glass-card p-8 text-center">
        <Gavel className="w-12 h-12 mx-auto mb-3 text-gray-600" />
        <p className="text-gray-400">Spin the wheel to select a player</p>
      </div>
    );
  }

  const isBiddingActive = status === 'player_selected' || status === 'bidding';

  return (
    <div className="space-y-4">
      {/* Selected Player */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card neon-border p-6 text-center">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Now Bidding</p>
        <h2 className="text-2xl font-bold text-white mb-1">{selectedPlayer.name}</h2>
        <p className="text-neon-blue">{selectedPlayer.role}</p>
        <p className="text-sm text-gray-400 mt-1">Base Price: ₹{selectedPlayer.base_price}</p>
      </motion.div>

      {/* Current Bid */}
      <div className="glass-card p-6 text-center">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Current Bid</p>
        <motion.p key={currentBid} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-4xl font-bold neon-text">
          ₹{currentBid}
        </motion.p>
        {highestBidder && (
          <p className="text-sm text-neon-blue mt-2">
            by {highestBidder.captainName} ({highestBidder.teamName})
          </p>
        )}
      </div>

      {/* Bidding Controls */}
      {isBiddingActive && (
        <div className="glass-card p-6 space-y-4">
          {/* Captain Select */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Bidding Captain</label>
            <select value={selectedCaptain} onChange={e => setSelectedCaptain(e.target.value)} className="input-field">
              <option value="">Select captain...</option>
              {captains.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.team_name}) — ₹{c.remaining} left</option>
              ))}
            </select>
          </div>

          {/* Increment Buttons */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Next Valid Bid</label>
            <div className="grid grid-cols-1 gap-2">
              {getNextBids(currentBid).slice(0, 1).map(bidVal => (
                <button key={bidVal} onClick={() => setBidAmount(bidVal)}
                  className="py-3 px-3 bg-surface-300/80 border border-white/10 rounded-lg text-white font-bold hover:border-neon-green/30 hover:bg-surface-200 transition-all text-lg">
                  ₹{bidVal}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Bid Amount</label>
            <div className="flex gap-2">
              <input type="number" value={bidAmount} onChange={e => setBidAmount(parseInt(e.target.value) || 0)}
                className="input-field flex-1" min={currentBid + 1} />
              <button onClick={handleBid} className="btn-primary whitespace-nowrap">
                Place Bid
              </button>
            </div>
          </div>

          {/* Sold / Unsold */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
            <button onClick={onSold} disabled={!highestBidder} className="btn-sold flex items-center justify-center gap-2 disabled:opacity-30">
              <Check className="w-5 h-5" /> SOLD
            </button>
            <button onClick={onUnsold} className="btn-unsold flex items-center justify-center gap-2">
              <XIcon className="w-5 h-5" /> UNSOLD
            </button>
          </div>
          {/* Out Captains Display */}
          {outCaptains?.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-red-400 uppercase tracking-wider mb-2 text-center">Captains Out</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {captains.filter(c => outCaptains.includes(c.id)).map(c => (
                  <span key={c.id} className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-md">
                    {c.team_name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
