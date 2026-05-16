import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gavel, ChevronUp } from 'lucide-react';
import { useAuctionStore } from '../stores/auctionStore';
import { useAuthStore } from '../stores/authStore';
import { socketService } from '../services/socket';
import toast from 'react-hot-toast';
import { getNextBids } from '../utils/bidding';

export default function CaptainLivePage() {
  const { user } = useAuthStore();
  const { state, initialize, placeBid, error } = useAuctionStore();
  const [bidAmount, setBidAmount] = useState(0);

  useEffect(() => {
    initialize();

    const handleSold = (data: any) => {
      toast.success(`${data.selectedPlayer?.name} SOLD! 🎉`);
    };

    const handleUnsold = (data: any) => {
      toast(`${data.selectedPlayer?.name} went unsold`, { icon: '❌' });
    };

    socketService.on('auction:sold', handleSold);
    socketService.on('auction:unsold', handleUnsold);

    return () => {
      socketService.off('auction:sold', handleSold);
      socketService.off('auction:unsold', handleUnsold);
    };
  }, []);

  useEffect(() => {
    setBidAmount(state.currentBid);
  }, [state.currentBid]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleBid = () => {
    if (!user?.captainId) {
      toast.error('You are not linked to a captain profile.');
      return;
    }
    if (bidAmount <= state.currentBid) {
      toast.error('Bid must be higher than current bid.');
      return;
    }
    placeBid(user.captainId, bidAmount);
  };

  if (state.status === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Gavel className="w-16 h-16 text-gray-600 mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold text-white mb-2">Auction Not Started</h2>
        <p className="text-gray-400">Please wait for the operator to start the auction.</p>
      </div>
    );
  }

  const isBiddingActive = state.status === 'player_selected' || state.status === 'bidding';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
          <Gavel className="w-8 h-8 text-neon-green" /> Live Bidding
        </h1>
        <p className="text-gray-400 mt-2">Group: {state.activeGroupName}</p>
      </div>

      {!state.selectedPlayer ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-full border-4 border-neon-blue/30 border-t-neon-blue animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Spinning...</h2>
          <p className="text-gray-400">Waiting for the operator to select the next player.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Selected Player */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card neon-border p-8 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Now Bidding</p>
            <h2 className="text-3xl font-bold text-white mb-2">{state.selectedPlayer.name}</h2>
            <p className="text-neon-blue text-lg mb-2">{state.selectedPlayer.role}</p>
            <p className="text-gray-400">Base Price: ₹{state.selectedPlayer.base_price}</p>
          </motion.div>

          {/* Current Bid */}
          <div className="glass-card p-8 text-center">
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Current Bid</p>
            <motion.p key={state.currentBid} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-5xl font-bold neon-text">
              ₹{state.currentBid}
            </motion.p>
            {state.highestBidder && (
              <p className="text-neon-blue mt-3 font-medium">
                Highest Bidder: {state.highestBidder.teamName} ({state.highestBidder.captainName})
              </p>
            )}
          </div>

          {/* Bidding Controls */}
          {isBiddingActive && (
            <div className="glass-card p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-3 text-center">Next Valid Bids</label>
                  <div className="grid grid-cols-4 gap-3">
                    {getNextBids(state.currentBid).map(bidVal => (
                      <button key={bidVal} onClick={() => setBidAmount(bidVal)}
                        className="py-3 px-4 bg-surface-300/80 border border-white/10 rounded-xl text-white font-bold hover:border-neon-green hover:bg-surface-200 hover:text-neon-green transition-all shadow-lg text-lg flex items-center justify-center">
                        ₹{bidVal}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-3 text-center">Place Custom Bid</label>
                  <div className="flex gap-3">
                    <input type="number" value={bidAmount} onChange={e => setBidAmount(parseInt(e.target.value) || 0)}
                      className="input-field text-xl font-bold text-center flex-1 h-14" min={state.currentBid + 1} />
                    <button onClick={handleBid} className="btn-primary h-14 px-8 text-lg font-bold shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                      PLACE BID
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
