import { Header } from "@/components/header";
import { StatCard } from "@/components/stat-card";
import { LobbyCard } from "@/components/lobby-card";
import { mockLobbies, mockUserStats } from "@/lib/mock-data";

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-10 py-10">
      <Header userName="User" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <StatCard
          value={mockUserStats.totalWinnings}
          label="Won So Far"
          variant="success"
        />
        <StatCard
          value={mockUserStats.activeMarkets}
          label="Active Markets"
          variant="accent"
        />
        <StatCard
          value={`${mockUserStats.winRate}%`}
          label="Win Rate"
          variant="default"
        />
      </div>

      {/* Markets Grid */}
      <h2 className="text-2xl font-bold mb-6">Active Lobbies</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockLobbies.map((lobby) => (
          <LobbyCard key={lobby.id} lobby={lobby} />
        ))}
      </div>
    </div>
  );
}
