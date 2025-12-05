export interface Lobby {
  id: string;
  name: string;
  taskDescription: string;
  entryFee: number;
  charityWallet: string;
  deadline: Date;
  totalPot: number;
  verifiedCount: number;
  totalMembers: number;
  icon: string;
  status: 'active' | 'resolved' | 'pending';
}

export interface Player {
  id: string;
  address: string;
  name: string;
  hasDeposited: boolean;
  isVerified: boolean;
  hasClaimed: boolean;
  avatarColor?: string;
}

export interface LobbyWithPlayers extends Lobby {
  players: Player[];
}

export interface HistoryItem {
  id: string;
  lobbyName: string;
  taskDescription: string;
  icon: string;
  result: 'win' | 'loss' | 'pending';
  amount: number;
  date: Date;
  verifiedCount: number;
  totalMembers: number;
}

export interface UserStats {
  totalWinnings: number;
  weeklyWinnings: number;
  activeMarkets: number;
  winRate: number;
}
