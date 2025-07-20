import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  FileText,
  TrendingUp,
  Heart,
  Brain,
  AlertTriangle,
  Calendar,
} from "lucide-react";

interface DigestItem {
  category: string;
  summary: string;
  sentiment: "positive" | "neutral" | "concerning";
  trend: "rising" | "stable" | "declining";
  anonymizedCount: number;
}

export const WeeklyDigest = () => {
  const [currentWeek] = useState("15-21 January 2024");
  const [digestData] = useState<DigestItem[]>([
    {
      category: "🎓 Academic Concerns",
      summary:
        "Students expressing increased stress about upcoming semester exams. Common themes: time management, syllabus coverage concerns.",
      sentiment: "concerning",
      trend: "rising",
      anonymizedCount: 42,
    },
    {
      category: "💬 Campus Life",
      summary:
        "Positive feedback about new cafeteria menu and extended library hours. Students appreciating infrastructure improvements.",
      sentiment: "positive",
      trend: "stable",
      anonymizedCount: 28,
    },
    {
      category: "🧠 Mental Health",
      summary:
        "Placement season anxiety showing in anonymous posts. Students seeking peer support and study groups formation.",
      sentiment: "concerning",
      trend: "rising",
      anonymizedCount: 15,
    },
    {
      category: "📢 Campus Events",
      summary:
        "High engagement around upcoming cultural fest. Excitement about guest performances and competition registrations.",
      sentiment: "positive",
      trend: "rising",
      anonymizedCount: 35,
    },
    {
      category: "❗ Infrastructure Issues",
      summary:
        "Recurring complaints about WiFi connectivity in certain hostels and classroom AC issues during afternoon slots.",
      sentiment: "neutral",
      trend: "stable",
      anonymizedCount: 18,
    },
  ]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-emerald-500/20 text-emerald-200";
      case "concerning":
        return "bg-red-500/20 text-red-200";
      default:
        return "bg-blue-500/20 text-blue-200";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "rising":
        return <TrendingUp className="h-4 w-4 text-orange-400" />;
      case "declining":
        return <TrendingUp className="h-4 w-4 text-green-400 rotate-180" />;
      default:
        return (
          <div className="w-4 h-4 border-2 border-gray-400 rounded-full"></div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <div className="relative">
          <FileText className="h-6 w-6 text-purple-400" />
          <div className="absolute -inset-1 bg-purple-400/20 rounded-full blur animate-pulse"></div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Weekly Campus Digest</h2>
          <p className="text-purple-300 text-sm">
            Anonymous insights • {currentWeek}
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4 text-center">
          <div className="text-2xl font-bold text-white">138</div>
          <div className="text-sm text-gray-400">Total Whispers</div>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">78%</div>
          <div className="text-sm text-gray-400">Positive Sentiment</div>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">12</div>
          <div className="text-sm text-gray-400">Trending Topics</div>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">5</div>
          <div className="text-sm text-gray-400">Support Connects</div>
        </Card>
      </div>

      {/* Digest Items */}
      <div className="space-y-4">
        {digestData.map((item, index) => (
          <Card
            key={index}
            className="bg-white/5 backdrop-blur-lg border-white/10 p-6 hover:bg-white/10 transition-all duration-300 animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className="bg-blue-500/20 text-blue-200">
                    {item.category}
                  </Badge>
                  <Badge className={getSentimentColor(item.sentiment)}>
                    {item.sentiment}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(item.trend)}
                  <span className="text-sm text-gray-400">
                    {item.anonymizedCount} whispers
                  </span>
                </div>
              </div>

              <p className="text-white leading-relaxed">{item.summary}</p>

              {item.sentiment === "concerning" && (
                <div className="flex items-center space-x-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span className="text-amber-200 text-sm">
                    Campus wellness team has been notified for support
                    initiatives
                  </span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Cultural Note */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-lg border-purple-500/20 p-6">
        <div className="flex items-center space-x-3 mb-3">
          <Heart className="h-5 w-5 text-purple-400" />
          <h3 className="font-bold text-white">Community Insights</h3>
        </div>
        <p className="text-purple-200 text-sm leading-relaxed">
          This week shows typical pre-exam season patterns with increased
          academic stress balanced by positive campus life engagement. The rise
          in mental health discussions indicates healthy awareness - students
          are reaching out anonymously for support.
          <br />
          <span className="text-purple-300 text-xs mt-2 block">
            सभी डेटा गुमनाम है • All data is anonymized and aggregated for
            community insights only
          </span>
        </p>
      </Card>
    </div>
  );
};
