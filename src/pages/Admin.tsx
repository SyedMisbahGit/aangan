import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "../components/ui/use-toast";
import { Dialog } from "../components/ui/dialog";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "../components/ui/tooltip";
import { DreamLayout } from "../components/shared/DreamLayout";
import { DreamHeader } from "../components/shared/DreamHeader";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { 
  Users, 
  MessageCircle, 
  Eye, 
  Heart, 
  TrendingUp, 
  Shield, 
  Settings,
  BarChart3,
  MapPin,
  Activity,
  Clock,
  Target
} from "lucide-react";
import { ShhhLine } from "../components/ShhhLine";
import AdminInsights from "./AdminInsights";
import { Navigate } from 'react-router-dom';
import { DreamLoadingScreen } from '../App';

interface Analytics {
  totalWhispers: number;
  whispersToday: number;
  emotionDistribution: { emotion: string; count: number }[];
}

interface Zone {
  zone: string;
  whisper_count?: number;
  likes?: number;
}

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const [stats] = useState({
    totalUsers: 1247,
    activeToday: 89,
    totalWhispers: 3421,
    whispersToday: 156,
    reportsHandled: 23,
    pendingReports: 5,
    avgResponseTime: "2.3h",
    communityScore: 8.7
  });

  const [recentActivity] = useState([
    {
      id: 1,
      type: "whisper",
      action: "New whisper posted",
      zone: "Library",
      time: "2 min ago",
      status: "active"
    },
    {
      id: 2,
      type: "report",
      action: "Report submitted",
      zone: "Cafeteria",
      time: "15 min ago",
      status: "pending"
    },
    {
      id: 3,
      type: "user",
      action: "New user joined",
      zone: "Student Center",
      time: "1 hour ago",
      status: "active"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "resolved": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const [jwt, setJwt] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState<string | null>(null);

  // Broadcast Notification State
  const [broadcast, setBroadcast] = useState({ title: "", body: "", url: "" });
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);

  // Analytics State
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Scheduled Nudges State
  const [nudgeModalOpen, setNudgeModalOpen] = useState(false);
  const nudgeExamples = [
    "The night feels heavy. Confess to the stars?",
    "Feeling something? Let it out quietly.",
    "A new day, a new whisper. Share your mood.",
    "Your zone is pulsing. Add your voice.",
  ];

  // Karma Viewer and Zone Heatmap use zones data from analytics
  const topZones = [...zones]
    .sort((a, b) => (b.likes || b.whisper_count) - (a.likes || a.whisper_count))
    .slice(0, 5);
  const maxWhispers = Math.max(...zones.map((z) => z.whisper_count || 0), 1);

  // On mount, check for admin_jwt in localStorage. If not present, redirect to /admin-login.
  useEffect(() => {
    const token = localStorage.getItem("admin_jwt");
    if (!token) window.location.replace("/admin-login");
    setJwt(token);
  }, []);

  // Fetch analytics on mount (after login)
  useEffect(() => {
    if (!jwt) return;
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    Promise.all([
      axios.get("/api/analytics/whispers", {
        headers: { Authorization: `Bearer ${jwt}` },
      }),
      axios.get("/api/analytics/zones", {
        headers: { Authorization: `Bearer ${jwt}` },
      }),
    ])
      .then(([whispersRes, zonesRes]) => {
        setAnalytics(whispersRes.data);
        setZones(zonesRes.data);
        setLastUpdated(new Date());
      })
      .catch(() => {
        setAnalyticsError("Failed to fetch analytics");
      })
      .finally(() => setAnalyticsLoading(false));
  }, [jwt]);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await axios.post("/api/auth/login", loginForm);
      setJwt(res.data.token);
      localStorage.setItem("admin_jwt", res.data.token);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  // Broadcast Notification Handler
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastLoading(true);
    setBroadcastError(null);
    setBroadcastSuccess(null);
    try {
      await axios.post(
        "/api/admin/broadcast",
        {
          title: broadcast.title,
          body: broadcast.body,
          url: broadcast.url || undefined,
        },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        },
      );
      setBroadcastSuccess("Notification sent!");
      toast({
        title: "Success",
        description: "Notification sent to all users.",
      });
      setBroadcast({ title: "", body: "", url: "" });
    } catch (err: unknown) {
      setBroadcastError(
        err instanceof Error ? err.message : "Failed to send notification",
      );
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setBroadcastLoading(false);
    }
  };

  // Refresh handler
  const handleRefresh = () => {
    setLastUpdated(null);
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    Promise.all([
      axios.get("/api/analytics/whispers", {
        headers: { Authorization: `Bearer ${jwt}` },
      }),
      axios.get("/api/analytics/zones", {
        headers: { Authorization: `Bearer ${jwt}` },
      }),
    ])
      .then(([whispersRes, zonesRes]) => {
        setAnalytics(whispersRes.data);
        setZones(zonesRes.data);
        setLastUpdated(new Date());
      })
      .catch(() => {
        setAnalyticsError("Failed to fetch analytics");
      })
      .finally(() => setAnalyticsLoading(false));
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("admin_jwt");
    setJwt(null);
    toast({ title: "Logged out", description: "You've been logged out." });
    setTimeout(() => window.location.reload(), 500);
  };

  if (!jwt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950">
        <Card className="p-8 w-full max-w-md glassy shadow-2xl border-2 border-violet-500/40">
          <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              className="w-full p-2 rounded bg-slate-800 border border-violet-400/30 text-white"
              type="text"
              placeholder="Username"
              value={loginForm.username}
              onChange={(e) =>
                setLoginForm((f) => ({ ...f, username: e.target.value }))
              }
              required
            />
            <input
              className="w-full p-2 rounded bg-slate-800 border border-violet-400/30 text-white"
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm((f) => ({ ...f, password: e.target.value }))
              }
              required
            />
            {loginError && (
              <div className="text-red-400 text-sm">{loginError}</div>
            )}
            <button
              className="w-full py-2 rounded bg-violet-600 hover:bg-violet-700 text-white font-semibold transition"
              type="submit"
              disabled={loginLoading}
            >
              {loginLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <DreamLayout>
      <DreamHeader 
        title="Aangan Admin Galleria" 
        subtitle="जैज़्बात का नक़्शा (Emotion Map)"
      />
      
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Poetic AI Narrator */}
        <div className="text-center mb-6">
          <ShhhLine 
            variant="header" 
            context="admin"
            className="text-center" 
          />
        </div>

        {/* Admin Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-paper-light border-inkwell/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-inkwell/10">
              <Eye className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-inkwell/10">
              <BarChart3 className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="moderation" className="data-[state=active]:bg-inkwell/10">
              <Shield className="w-4 h-4 mr-2" />
              Moderation
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-inkwell/10">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
        <motion.div
              initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <Card className="bg-paper-light border-inkwell/10 shadow-soft">
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 text-inkwell/60 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-inkwell">{stats.totalUsers}</div>
                  <div className="text-sm text-inkwell/70">Total Users</div>
                </CardContent>
              </Card>
              
              <Card className="bg-paper-light border-inkwell/10 shadow-soft">
                <CardContent className="p-4 text-center">
                  <MessageCircle className="w-6 h-6 text-inkwell/60 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-inkwell">{stats.totalWhispers}</div>
                  <div className="text-sm text-inkwell/70">Total Whispers</div>
                </CardContent>
              </Card>
              
              <Card className="bg-paper-light border-inkwell/10 shadow-soft">
                <CardContent className="p-4 text-center">
                  <Activity className="w-6 h-6 text-inkwell/60 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-inkwell">{stats.activeToday}</div>
                  <div className="text-sm text-inkwell/70">Active Today</div>
                </CardContent>
              </Card>
              
              <Card className="bg-paper-light border-inkwell/10 shadow-soft">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-inkwell/60 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-inkwell">{stats.communityScore}</div>
                  <div className="text-sm text-inkwell/70">Community Score</div>
                </CardContent>
          </Card>
        </motion.div>

            {/* Recent Activity */}
        <motion.div
              initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
        >
              <Card className="bg-paper-light border-inkwell/10 shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-inkwell">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-inkwell/10">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-inkwell/40 rounded-full" />
                          <div>
                            <p className="text-sm font-medium text-inkwell">{activity.action}</p>
                            <p className="text-xs text-inkwell/60">{activity.zone} • {activity.time}</p>
                  </div>
                </div>
                        <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
          </Card>
        </motion.div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <AdminInsights />
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="space-y-6">
        <motion.div
              initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
        >
              <Card className="bg-paper-light border-inkwell/10 shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-inkwell">
                    <Shield className="w-5 h-5" />
                    Moderation Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/50 rounded-lg border border-inkwell/10">
                      <div className="text-2xl font-bold text-inkwell">{stats.pendingReports}</div>
                      <div className="text-sm text-inkwell/70">Pending Reports</div>
            </div>
                    <div className="p-4 bg-white/50 rounded-lg border border-inkwell/10">
                      <div className="text-2xl font-bold text-inkwell">{stats.reportsHandled}</div>
                      <div className="text-sm text-inkwell/70">Reports Handled</div>
              </div>
                    <div className="p-4 bg-white/50 rounded-lg border border-inkwell/10">
                      <div className="text-2xl font-bold text-inkwell">{stats.avgResponseTime}</div>
                      <div className="text-sm text-inkwell/70">Avg Response Time</div>
                    </div>
                  </div>
                </CardContent>
          </Card>
        </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
        <motion.div
              initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
        >
              <Card className="bg-paper-light border-inkwell/10 shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-inkwell">
                    <Settings className="w-5 h-5" />
                    System Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-inkwell/70">Admin settings and configuration options will be available here.</p>
                </CardContent>
          </Card>
        </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DreamLayout>
  );
};

export default Admin;
