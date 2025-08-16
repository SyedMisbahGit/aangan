import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Sun, TrendingUp, Activity, Users } from "lucide-react";

const SummerSoulAnalytics: React.FC = () => {
  // Mock data - replace with actual data fetching
  const summerStats = {
    activeUsers: 1250,
    engagementRate: '68%',
    weeklyGrowth: 12.5,
    topZones: ['Library', 'Cafeteria', 'Quad']
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summerStats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{summerStats.weeklyGrowth}% from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summerStats.engagementRate}</div>
            <p className="text-xs text-muted-foreground">+3.2% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Zone</CardTitle>
            <Sun className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summerStats.topZones[0]}</div>
            <p className="text-xs text-muted-foreground">Most active location</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Summer Engagement Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
            <div className="text-center text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Weekly engagement chart will appear here</p>
              <p className="text-sm text-gray-400">(Connect to your analytics service)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummerSoulAnalytics;
