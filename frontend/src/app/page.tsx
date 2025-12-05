import { Header } from "@/components/header";
import { LobbyCard } from "@/components/lobby-card";
import { mockLobbies, mockUserStats } from "@/lib/mock-data";
import { Trophy, Activity } from "lucide-react";

function Badge({ children, color = "green" }: { children: React.ReactNode; color?: "green" | "zinc" }) {
  const colors = {
    green: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    zinc: "bg-zinc-800 text-zinc-300",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />

      <main className="max-w-md mx-auto relative">
        <div className="p-4 space-y-6 pb-24 animate-in">
          {/* Hero Stats Card */}
          <section className="bg-gradient-to-br from-orange-950/40 via-zinc-900 to-zinc-900 border border-orange-500/20 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="text-zinc-400 text-sm font-medium mb-1">Total Winnings</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">
                  ${mockUserStats.totalWinnings.toFixed(2)}
                </span>
                <Badge color="green">+12.4%</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-zinc-950/50 rounded-2xl p-3 border border-zinc-800/50">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                    <Trophy className="w-3 h-3 text-orange-500" />
                    Win Rate
                  </div>
                  <div className="text-lg font-bold text-white">{mockUserStats.winRate}%</div>
                </div>
                <div className="bg-zinc-950/50 rounded-2xl p-3 border border-zinc-800/50">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                    <Activity className="w-3 h-3 text-amber-500" />
                    Streak
                  </div>
                  <div className="text-lg font-bold text-white">{mockUserStats.streak} Days</div>
                </div>
              </div>
            </div>
          </section>

          {/* Markets List */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Live Markets</h3>
              <span className="text-xs text-orange-500 font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                Live Updates
              </span>
            </div>

            {mockLobbies.map((lobby) => (
              <LobbyCard key={lobby.id} lobby={lobby} />
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
