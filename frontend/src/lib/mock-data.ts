import { Lobby, Player, LobbyWithPlayers, HistoryItem, UserStats } from './types';

export const mockPlayers: Player[] = [
  { id: '1', address: '0x1234...5678', name: 'Alice', hasDeposited: true, isVerified: true, hasClaimed: false, avatarColor: '#ff6b35' },
  { id: '2', address: '0x2345...6789', name: 'Bob', hasDeposited: true, isVerified: true, hasClaimed: false, avatarColor: '#4ade80' },
  { id: '3', address: '0x3456...7890', name: 'Cathy', hasDeposited: true, isVerified: false, hasClaimed: false, avatarColor: '#60a5fa' },
  { id: '4', address: '0x4567...8901', name: 'Dan', hasDeposited: true, isVerified: false, hasClaimed: false, avatarColor: '#f472b6' },
  { id: '5', address: '0x5678...9012', name: 'Emma', hasDeposited: true, isVerified: true, hasClaimed: false, avatarColor: '#a78bfa' },
];

export const mockLobbies: LobbyWithPlayers[] = [
  {
    id: '1',
    name: 'Morning Gym Squad',
    taskDescription: 'Go to the gym',
    entryFee: 10,
    charityWallet: 'charity1.sol',
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    totalPot: 70,
    verifiedCount: 3,
    totalMembers: 7,
    icon: '🏋️',
    status: 'active',
    players: mockPlayers.slice(0, 7),
  },
  {
    id: '2',
    name: 'Study Group',
    taskDescription: 'Go to class',
    entryFee: 5,
    charityWallet: 'charity2.sol',
    deadline: new Date(Date.now() + 12 * 60 * 60 * 1000),
    totalPot: 25,
    verifiedCount: 3,
    totalMembers: 5,
    icon: '📚',
    status: 'active',
    players: mockPlayers.slice(0, 5),
  },
  {
    id: '3',
    name: 'Early Birds',
    taskDescription: 'Wake up before 7am',
    entryFee: 20,
    charityWallet: 'charity1.sol',
    deadline: new Date(Date.now() + 8 * 60 * 60 * 1000),
    totalPot: 80,
    verifiedCount: 2,
    totalMembers: 4,
    icon: '🌅',
    status: 'active',
    players: mockPlayers.slice(0, 4),
  },
];

export const mockHistory: HistoryItem[] = [
  {
    id: '1',
    lobbyName: 'Study Group',
    taskDescription: 'Go to class',
    icon: '📚',
    result: 'win',
    amount: 6,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    verifiedCount: 3,
    totalMembers: 5,
  },
  {
    id: '2',
    lobbyName: 'Morning Gym Squad',
    taskDescription: 'Go to the gym',
    icon: '🏋️',
    result: 'loss',
    amount: -10,
    date: new Date(Date.now() - 48 * 60 * 60 * 1000),
    verifiedCount: 6,
    totalMembers: 7,
  },
  {
    id: '3',
    lobbyName: 'Meditation Circle',
    taskDescription: 'Meditate for 10 minutes',
    icon: '🧘',
    result: 'win',
    amount: 15,
    date: new Date(Date.now() - 72 * 60 * 60 * 1000),
    verifiedCount: 2,
    totalMembers: 5,
  },
];

export const mockUserStats: UserStats = {
  totalWinnings: 200,
  weeklyWinnings: 10,
  activeMarkets: 3,
  winRate: 67,
};

export const mockCurrentUser: Player = {
  id: 'current',
  address: '0xYOUR...WALLET',
  name: 'You',
  hasDeposited: false,
  isVerified: false,
  hasClaimed: false,
  avatarColor: '#ff6b35',
};
