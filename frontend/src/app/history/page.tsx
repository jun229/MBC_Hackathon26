import { Header } from "@/components/header";
import { mockHistory, mockUserStats } from "@/lib/mock-data";
import { Activity, TrendingUp } from "lucide-react";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  );
}

function CalendarStrip() {
  const days = ["Su", "M", "T", "W", "Th", "F", "Sa"];
  const today = new Date().getDay();

  // Generate dates for the week
  const currentDate = new Date();
  const dates = days.map((_, i) => {
    const diff = i - today;
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() + diff);
    return date.getDate();
  });

  return (
    <div className="grid grid-cols-7 gap-2 mb-6">
      {days.map((d, i) => (
        <div
          key={i}
          className={`aspect-square rounded-xl flex flex-col items-center justify-center border cursor-pointer transition-all ${
            i === today
              ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
          }`}
        >
          <span className="text-[10px] opacity-80">{d}</span>
          <span className="text-lg font-bold">{dates[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />

      <main className="max-w-md mx-auto relative">
        <div className="p-4 space-y-6 pb-24 animate-in">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <h3 className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">
                Total Winnings
              </h3>
              <div className="text-3xl font-mono font-bold text-emerald-400">
                +${mockUserStats.totalWinnings.toFixed(0)}
              </div>
            </Card>
            <Card>
              <h3 className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">
                This Week
              </h3>
              <div className="text-3xl font-mono font-bold text-white">
                +${mockUserStats.weeklyWinnings}
              </div>
            </Card>
          </div>

          {/* Calendar Strip */}
          <CalendarStrip />

          {/* History List */}
          <div className="space-y-3">
            {mockHistory.map((item) => (
              <Card
                key={item.id}
                className="flex justify-between items-center group cursor-pointer hover:border-zinc-700 transition-colors p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 text-zinc-400">
                    {item.icon === "🏋️" || item.icon === "🏃" ? (
                      <Activity className="w-5 h-5" />
                    ) : (
                      <TrendingUp className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1">
                      {item.lobbyName}
                    </h4>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                        item.result === "win"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : item.result === "loss"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {item.result === "win" ? "Yes ✓" : item.result === "loss" ? "No ✗" : "Pending"}
                    </span>
                  </div>
                </div>
                <div
                  className={`font-mono font-bold text-lg ${
                    item.amount > 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {item.amount > 0 ? "+" : ""}
                  {item.amount}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
