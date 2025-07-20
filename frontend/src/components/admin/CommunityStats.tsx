import { Card } from "../ui/card";
import { Users, MessageSquare, Shield, Activity } from "lucide-react";

export const CommunityStats = () => {
  const stats = [
    {
      label: "Active Students",
      value: "2,847",
      icon: Users,
      color: "text-blue-400",
      change: "+12%",
    },
    {
      label: "Posts Today",
      value: "156",
      icon: MessageSquare,
      color: "text-green-400",
      change: "+8%",
    },
    {
      label: "Safety Score",
      value: "98.2%",
      icon: Shield,
      color: "text-purple-400",
      change: "+0.3%",
    },
    {
      label: "Engagement",
      value: "High",
      icon: Activity,
      color: "text-yellow-400",
      change: "Stable",
    },
  ];

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6">
      <h3 className="font-bold text-white mb-4">Community Pulse</h3>

      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <div>
                <p className="text-white text-sm font-medium">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            </div>
            <span className="text-xs text-green-400">{stat.change}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-green-400" />
          <span className="text-green-200 text-sm font-medium">
            Community Health: Excellent
          </span>
        </div>
        <p className="text-xs text-green-300 mt-1">
          High engagement, low toxicity, strong moderation
        </p>
      </div>
    </Card>
  );
};
