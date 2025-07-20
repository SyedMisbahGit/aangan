import { useState } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  Users,
  Activity,
  CheckCircle,
} from "lucide-react";

export const SafetyDashboard = () => {
  const [safetyMetrics] = useState({
    postsModerated: 247,
    flaggedContent: 12,
    emergencyProtocols: 2,
    communityReports: 5,
    averageResponseTime: "< 2 min",
    safetyScore: 94,
  });

  const [recentAlerts] = useState([
    {
      id: 1,
      type: "moderation",
      message: "High confidence flag: potential distress signal detected",
      timestamp: "2 minutes ago",
      severity: "high",
      status: "reviewed",
    },
    {
      id: 2,
      type: "community",
      message: "Multiple reports on post #2847 - investigating",
      timestamp: "15 minutes ago",
      severity: "medium",
      status: "investigating",
    },
    {
      id: 3,
      type: "system",
      message:
        "AI moderation confidence dropped to 89% - manual review queue activated",
      timestamp: "1 hour ago",
      severity: "low",
      status: "resolved",
    },
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/20 text-red-200";
      case "medium":
        return "bg-yellow-500/20 text-yellow-200";
      case "low":
        return "bg-blue-500/20 text-blue-200";
      default:
        return "bg-gray-500/20 text-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "investigating":
        return <Activity className="h-4 w-4 text-yellow-400" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Shield className="h-6 w-6 text-green-400" />
        <h2 className="text-xl font-bold text-white">
          Safety & Moderation Dashboard
        </h2>
      </div>

      {/* Safety Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {safetyMetrics.postsModerated}
            </div>
            <div className="text-sm text-gray-400">Posts Moderated</div>
          </div>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {safetyMetrics.flaggedContent}
            </div>
            <div className="text-sm text-gray-400">Flagged Content</div>
          </div>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {safetyMetrics.safetyScore}%
            </div>
            <div className="text-sm text-gray-400">Safety Score</div>
          </div>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {safetyMetrics.emergencyProtocols}
            </div>
            <div className="text-sm text-gray-400">Emergency Protocols</div>
          </div>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {safetyMetrics.communityReports}
            </div>
            <div className="text-sm text-gray-400">Community Reports</div>
          </div>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {safetyMetrics.averageResponseTime}
            </div>
            <div className="text-sm text-gray-400">Response Time</div>
          </div>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          <h3 className="font-bold text-white">Recent Safety Alerts</h3>
        </div>

        <div className="space-y-3">
          {recentAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start justify-between p-3 bg-white/5 rounded-lg"
            >
              <div className="flex items-start space-x-3">
                {getStatusIcon(alert.status)}
                <div>
                  <p className="text-white text-sm">{alert.message}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {alert.timestamp}
                    </span>
                  </div>
                </div>
              </div>

              {alert.status === "investigating" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Review
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Emergency Protocols */}
      <Card className="bg-red-500/10 backdrop-blur-md border-red-500/20 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="h-5 w-5 text-red-400" />
          <h3 className="font-bold text-white">Emergency Protocol Status</h3>
          <Badge className="bg-green-500/20 text-green-200">Active</Badge>
        </div>

        <div className="space-y-2 text-sm text-red-200">
          <p>✓ Mental health crisis detection: Active</p>
          <p>✓ Self-harm keyword monitoring: Active</p>
          <p>✓ Emergency response team: On standby</p>
          <p>✓ Campus counseling integration: Connected</p>
        </div>
      </Card>
    </div>
  );
};
