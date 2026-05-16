import { create } from 'zustand';
import { AuctionState, Player } from '../types';
import { socketService } from '../services/socket';

interface AuctionStore {
  state: AuctionState;
  isConnected: boolean;
  error: string | null;
  initialize: () => void;
  cleanup: () => void;
  startAuction: (groupId: string) => void;
  spinWheel: () => void;
  placeBid: (captainId: string, amount: number) => void;
  markSold: () => void;
  markUnsold: () => void;
  resetAuction: () => void;
}

const initialState: AuctionState = {
  status: 'idle',
  activeGroupId: null,
  activeGroupName: null,
  wheelPool: [],
  selectedPlayer: null,
  currentBid: 0,
  highestBidder: null,
  lastAction: '',
  timestamp: 0,
};

export const useAuctionStore = create<AuctionStore>((set, get) => ({
  state: initialState,
  isConnected: false,
  error: null,

  initialize: () => {
    socketService.connect();

    const handleUpdate = (newState: AuctionState) => {
      set({ state: newState, error: null });
    };

    const handleError = (data: { message: string }) => {
      set({ error: data.message });
      setTimeout(() => set({ error: null }), 5000);
    };

    // Clear existing to prevent accumulation
    socketService.off('auction:update', handleUpdate);
    socketService.off('auction:state', handleUpdate);
    socketService.off('auction:error', handleError);
    
    socketService.on('auction:update', handleUpdate);
    socketService.on('auction:state', handleUpdate);
    socketService.on('auction:error', handleError);
    socketService.on('auction:sold', (finalState: AuctionState) => {
      set({ state: { ...finalState } });
    });
    socketService.on('auction:unsold', (finalState: AuctionState) => {
      set({ state: { ...finalState } });
    });

    socketService.on('connect', () => set({ isConnected: true }));
    socketService.on('disconnect', () => set({ isConnected: false }));

    // Request current state
    socketService.emit('auction:state');
    set({ isConnected: socketService.isConnected });
  },

  cleanup: () => {
    socketService.disconnect();
    set({ isConnected: false, state: initialState });
  },

  startAuction: (groupId: string) => {
    socketService.emit('auction:start', { groupId });
  },

  spinWheel: () => {
    socketService.emit('auction:spin');
  },

  placeBid: (captainId: string, amount: number) => {
    socketService.emit('auction:bid', { captainId, amount });
  },

  markSold: () => {
    socketService.emit('auction:sold');
  },

  markUnsold: () => {
    socketService.emit('auction:unsold');
  },

  resetAuction: () => {
    socketService.emit('auction:reset');
  },
}));
