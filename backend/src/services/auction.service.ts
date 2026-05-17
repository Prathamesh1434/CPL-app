import { supabase } from '../config/supabase';

export interface Player {
  id: string;
  name: string;
  role: string;
  group_id: string;
  base_price: number;
  status: string;
}

export interface AuctionState {
  status: 'idle' | 'group_selected' | 'spinning' | 'player_selected' | 'bidding' | 'sold' | 'unsold';
  activeGroupId: string | null;
  activeGroupName: string | null;
  wheelPool: Player[];
  selectedPlayer: Player | null;
  currentBid: number;
  highestBidder: { captainId: string; captainName: string; teamName: string } | null;
  lastAction: string;
  timestamp: number;
}

class AuctionEngine {
  private state: AuctionState = {
    status: 'idle',
    activeGroupId: null,
    activeGroupName: null,
    wheelPool: [],
    selectedPlayer: null,
    currentBid: 0,
    highestBidder: null,
    outCaptains: [],
    lastAction: 'Auction engine initialized',
    timestamp: Date.now(),
  };

  getState(): AuctionState {
    return { ...this.state };
  }

  async startAuction(groupId: string): Promise<AuctionState> {
    // Fetch group info
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      throw new Error('Group not found');
    }

    // Fetch unsold players from this group
    const { data: players, error: playerError } = await supabase
      .from('players')
      .select('id, name, role, group_id, base_price, status')
      .eq('group_id', groupId)
      .eq('status', 'unsold');

    if (playerError) {
      throw new Error('Failed to fetch players');
    }

    if (!players || players.length === 0) {
      throw new Error('No unsold players in this group');
    }

    this.state = {
      status: 'group_selected',
      activeGroupId: groupId,
      activeGroupName: group.name,
      wheelPool: players,
      selectedPlayer: null,
      currentBid: 0,
      highestBidder: null,
      outCaptains: [],
      lastAction: `Auction started for group: ${group.name}`,
      timestamp: Date.now(),
    };

    return this.getState();
  }

  spinWheel(): { selectedPlayer: Player; spinIndex: number } {
    if (this.state.wheelPool.length === 0) {
      throw new Error('No players left in the pool');
    }

    // Random selection
    const randomIndex = Math.floor(Math.random() * this.state.wheelPool.length);
    const selectedPlayer = this.state.wheelPool[randomIndex];

    this.state.status = 'spinning';
    this.state.lastAction = 'Wheel spinning...';
    this.state.timestamp = Date.now();

    return { selectedPlayer, spinIndex: randomIndex };
  }

  selectPlayer(player: Player): AuctionState {
    // Remove from wheel pool
    this.state.wheelPool = this.state.wheelPool.filter(p => p.id !== player.id);
    this.state.selectedPlayer = player;
    this.state.currentBid = player.base_price;
    this.state.highestBidder = null;
    this.state.outCaptains = [];
    this.state.status = 'player_selected';
    this.state.lastAction = `${player.name} selected from wheel`;
    this.state.timestamp = Date.now();

    return this.getState();
  }

  async placeBid(captainId: string, amount: number): Promise<AuctionState> {
    if (!this.state.selectedPlayer) {
      throw new Error('No player selected');
    }

    if (amount <= this.state.currentBid) {
      throw new Error('Bid must be higher than current bid');
    }

    // Validate captain's purse
    const { data: captain, error } = await supabase
      .from('captains')
      .select('*')
      .eq('id', captainId)
      .single();

    if (error || !captain) {
      throw new Error('Captain not found');
    }

    const remaining = captain.purse - captain.spent;
    if (amount > remaining) {
      throw new Error(`Bid exceeds remaining purse (${remaining} available)`);
    }

    this.state.currentBid = amount;
    this.state.highestBidder = {
      captainId: captain.id,
      captainName: captain.name,
      teamName: captain.team_name,
    };
    this.state.status = 'bidding';
    this.state.lastAction = `${captain.name} (${captain.team_name}) bid ${amount}`;
    this.state.timestamp = Date.now();

    return this.getState();
  }

  markOut(captainId: string): AuctionState {
    if (!this.state.outCaptains.includes(captainId)) {
      this.state.outCaptains.push(captainId);
      this.state.timestamp = Date.now();
    }
    return this.getState();
  }

  async markSold(): Promise<AuctionState> {
    if (!this.state.selectedPlayer || !this.state.highestBidder) {
      throw new Error('No active bid to finalize');
    }

    const player = this.state.selectedPlayer;
    const bidder = this.state.highestBidder;
    const price = this.state.currentBid;

    // Update player status
    const { error: playerError } = await supabase
      .from('players')
      .update({
        status: 'sold',
        sold_to: bidder.captainId,
        sold_price: price,
      })
      .eq('id', player.id);

    if (playerError) {
      throw new Error('Failed to update player');
    }

    // Update captain's spent amount
    const { data: captain } = await supabase
      .from('captains')
      .select('spent')
      .eq('id', bidder.captainId)
      .single();

    if (captain) {
      await supabase
        .from('captains')
        .update({ spent: captain.spent + price })
        .eq('id', bidder.captainId);
    }

    // Log the auction
    await supabase.from('auction_logs').insert({
      player_id: player.id,
      player_name: player.name,
      captain_id: bidder.captainId,
      captain_name: bidder.captainName,
      team_name: bidder.teamName,
      price,
      action: 'sold',
      group_name: this.state.activeGroupName,
    });

    this.state.status = 'sold';
    this.state.lastAction = `${player.name} SOLD to ${bidder.teamName} for ${price}`;
    this.state.timestamp = Date.now();

    // Reset for next player but keep group
    const savedState = this.getState();

    this.state.selectedPlayer = null;
    this.state.currentBid = 0;
    this.state.highestBidder = null;
    this.state.outCaptains = [];
    this.state.status = this.state.wheelPool.length > 0 ? 'group_selected' : 'idle';

    return savedState;
  }

  async markUnsold(): Promise<AuctionState> {
    if (!this.state.selectedPlayer) {
      throw new Error('No player selected');
    }

    const player = this.state.selectedPlayer;

    // Player remains unsold in DB (status stays 'unsold')
    // But remove from current wheel pool so they're not re-selected this round

    // Log the auction
    await supabase.from('auction_logs').insert({
      player_name: player.name,
      player_id: player.id,
      price: 0,
      action: 'unsold',
      group_name: this.state.activeGroupName,
    });

    this.state.status = 'unsold';
    this.state.lastAction = `${player.name} went UNSOLD`;
    this.state.timestamp = Date.now();

    const savedState = this.getState();

    // Reset for next player
    this.state.selectedPlayer = null;
    this.state.currentBid = 0;
    this.state.highestBidder = null;
    this.state.outCaptains = [];
    this.state.status = this.state.wheelPool.length > 0 ? 'group_selected' : 'idle';

    return savedState;
  }

  resetAuction(): AuctionState {
    this.state = {
      status: 'idle',
      activeGroupId: null,
      activeGroupName: null,
      wheelPool: [],
      selectedPlayer: null,
      currentBid: 0,
      highestBidder: null,
      outCaptains: [],
      lastAction: 'Auction reset',
      timestamp: Date.now(),
    };
    return this.getState();
  }
}

// Singleton instance
export const auctionEngine = new AuctionEngine();
