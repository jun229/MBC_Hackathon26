import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";
import { mockHistory, mockUserStats } from "@/lib/mock-data";

export default function HistoryPage() {
  return (
    <div className="max-w-7xl mx-auto px-10 py-10">
      <Header userName="User" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="bg-[#252525] p-8 rounded-2xl border-[#333]">
          <h3 className="text-sm text-[#a0a0a0] mb-2 uppercase tracking-wider">
            Total Winnings
          </h3>
          <div className="font-mono-display text-4xl font-bold text-[#4ade80]">
            +${mockUserStats.totalWinnings}
          </div>
        </Card>
        <Card className="bg-[#252525] p-8 rounded-2xl border-[#333]">
          <h3 className="text-sm text-[#a0a0a0] mb-2 uppercase tracking-wider">
            This Week
          </h3>
          <div className="font-mono-display text-4xl font-bold text-[#4ade80]">
            +${mockUserStats.weeklyWinnings}
          </div>
        </Card>
        <Card className="bg-[#252525] p-8 rounded-2xl border-[#333]">
          <h3 className="text-sm text-[#a0a0a0] mb-2 uppercase tracking-wider">
            Win Rate
          </h3>
          <div className="font-mono-display text-4xl font-bold text-white">
            {mockUserStats.winRate}%
          </div>
        </Card>
      </div>

      {/* History List */}
      <h2 className="text-2xl font-bold mb-6">Past Markets</h2>
      <div className="space-y-4">
        {mockHistory.map((item) => (
          <Card
            key={item.id}
            className="bg-[#252525] p-6 rounded-2xl border-[#333] hover:border-[#ff6b35] transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-full border-2 border-[#333] flex items-center justify-center text-2xl">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{item.lobbyName}</h3>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm px-3 py-1 rounded-md ${
                        item.result === "win"
                          ? "bg-[#4ade80]/20 text-[#4ade80]"
                          : item.result === "loss"
                          ? "bg-[#ef4444]/20 text-[#ef4444]"
                          : "bg-[#1a1a1a] text-[#a0a0a0]"
                      }`}
                    >
                      {item.result === "win" ? "Won ✓" : item.result === "loss" ? "Lost ✗" : "Pending"}
                    </span>
                    <span className="text-sm text-[#a0a0a0]">
                      {item.verifiedCount}/{item.totalMembers} verified
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Progress circles */}
                <div className="flex gap-1">
                  {Array.from({ length: item.totalMembers }, (_, i) => (
                    <div
                      key={i}
                      className={`w-5 h-5 rounded-full border-2 ${
                        i < item.verifiedCount
                          ? "bg-[#ff6b35] border-[#ff6b35]"
                          : "border-[#333]"
                      }`}
                    />
                  ))}
                </div>

                <div
                  className={`font-mono-display text-2xl font-bold ${
                    item.amount > 0 ? "text-[#4ade80]" : "text-[#ef4444]"
                  }`}
                >
                  {item.amount > 0 ? "+" : ""}${item.amount}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
