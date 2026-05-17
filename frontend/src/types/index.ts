export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer' | 'captain';
  captainId?: string;
}

export interface Group {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
}

export interface Captain {
  id: string;
  name: string;
  team_name: string;
  purse: number;
  spent: number;
  remaining: number;
  group_id: string | null;
  group_name: string | null;
  created_at: string;
}

export interface Player {
  id: string;
  name: string;
  role: string;
  group_id: string | null;
  group_name: string | null;
  base_price: number;
  status: 'unsold' | 'sold' | 'in_auction';
  sold_to: string | null;
  sold_to_name: string | null;
  sold_to_team: string | null;
  sold_price: number | null;
  created_at: string;
}

export interface AuctionState {
  status: 'idle' | 'group_selected' | 'spinning' | 'player_selected' | 'bidding' | 'sold' | 'unsold';
  activeGroupId: string | null;
  activeGroupName: string | null;
  wheelPool: Player[];
  selectedPlayer: Player | null;
  currentBid: number;
  highestBidder: {
    captainId: string;
    captainName: string;
    teamName: string;
  } | null;
  outCaptains: string[];
  lastAction: string;
  timestamp: number;
}

export interface AuctionLog {
  id: string;
  player_id: string;
  player_name: string;
  captain_id: string | null;
  captain_name: string | null;
  team_name: string | null;
  price: number;
  action: 'sold' | 'unsold';
  group_name: string | null;
  created_at: string;
}

export interface TeamData {
  captain_id: string;
  captain_name: string;
  team_name: string;
  purse: number;
  spent: number;
  remaining: number;
  player_count: number;
  players: { id: string; name: string; role: string; sold_price: number }[];
}

export interface DashboardSummary {
  totalGroups: number;
  totalCaptains: number;
  totalPlayers: number;
  playersSold: number;
  highestBid: number;
  auctionProgress: number;
}
