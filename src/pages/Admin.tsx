import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { Dialog } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

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

const AdminPanel: React.FC = () => {
  const [jwt, setJwt] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  // Check for JWT in localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("admin_jwt");
    if (token) setJwt(token);
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
    setLoading(true);
    setLoginError(null);
    try {
      const res = await axios.post("/api/auth/login", loginForm);
      setJwt(res.data.token);
      localStorage.setItem("admin_jwt", res.data.token);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
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
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 py-8 px-2 md:px-8 flex flex-col gap-8">
        <div className="flex justify-end items-center mb-2 gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="py-2 px-4 rounded bg-slate-800 hover:bg-violet-700 text-white font-semibold transition shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                onClick={handleRefresh}
                tabIndex={0}
                aria-label="Refresh Stats"
              >
                🔄 Refresh Stats
              </button>
            </TooltipTrigger>
            <TooltipContent>Refresh analytics and token stats</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="py-2 px-4 rounded bg-slate-800 hover:bg-red-700 text-white font-semibold transition shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                onClick={handleLogout}
                tabIndex={0}
                aria-label="Logout"
              >
                🚪 Logout
              </button>
            </TooltipTrigger>
            <TooltipContent>Log out of admin session</TooltipContent>
          </Tooltip>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl font-extrabold text-center mb-6 text-white drop-shadow-lg"
        >
          🛠️ Shhh – Admin Control Panel
        </motion.h1>
        {/* Broadcast Notification Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-8 p-6 glassy border-2 border-violet-400/40 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                📣 Broadcast Notification
              </h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    aria-label="Broadcast Info"
                    className="cursor-pointer"
                  >
                    ℹ️
                  </span>
                </TooltipTrigger>
                <TooltipContent>Send a push to all FCM users.</TooltipContent>
              </Tooltip>
            </div>
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-violet-200 font-semibold mb-1">
                  Title
                </label>
                <input
                  className="w-full p-2 rounded bg-slate-800 border border-violet-400/30 text-white"
                  type="text"
                  maxLength={60}
                  value={broadcast.title}
                  onChange={(e) =>
                    setBroadcast((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                />
                <div className="text-xs text-violet-300 text-right">
                  {broadcast.title.length}/60
                </div>
              </div>
              <div>
                <label className="block text-violet-200 font-semibold mb-1">
                  Body
                </label>
                <textarea
                  className="w-full p-2 rounded bg-slate-800 border border-violet-400/30 text-white min-h-[60px]"
                  maxLength={200}
                  value={broadcast.body}
                  onChange={(e) =>
                    setBroadcast((f) => ({ ...f, body: e.target.value }))
                  }
                  required
                />
                <div className="text-xs text-violet-300 text-right">
                  {broadcast.body.length}/200
                </div>
              </div>
              <div>
                <label className="block text-violet-200 font-semibold mb-1">
                  Optional URL
                </label>
                <input
                  className="w-full p-2 rounded bg-slate-800 border border-violet-400/30 text-white"
                  type="url"
                  value={broadcast.url}
                  onChange={(e) =>
                    setBroadcast((f) => ({ ...f, url: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-between items-center">
                <button
                  className="py-2 px-4 rounded bg-violet-600 hover:bg-violet-700 text-white font-semibold transition shadow-lg"
                  type="submit"
                  disabled={
                    broadcastLoading || !broadcast.title || !broadcast.body
                  }
                >
                  {broadcastLoading ? "Sending..." : "📣 Send Notification"}
                </button>
                {broadcastError && (
                  <span className="text-red-400 text-sm ml-4">
                    {broadcastError}
                  </span>
                )}
                {broadcastSuccess && (
                  <span className="text-green-400 text-sm ml-4">
                    {broadcastSuccess}
                  </span>
                )}
              </div>
              {/* Live Preview */}
              <div className="mt-6">
                <div className="font-semibold text-violet-300 mb-2">
                  Live Preview
                </div>
                <motion.div
                  initial={{ scale: 0.95, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-xl bg-gradient-to-br from-violet-800/80 to-indigo-900/80 p-4 shadow-2xl border border-violet-400/30"
                >
                  <div className="text-lg font-bold text-white mb-1">
                    {broadcast.title || "Notification Title"}
                  </div>
                  <div className="text-slate-200 mb-1">
                    {broadcast.body || "Notification body will appear here."}
                  </div>
                  {broadcast.url && (
                    <div className="text-xs text-blue-300">
                      🔗 {broadcast.url}
                    </div>
                  )}
                </motion.div>
              </div>
            </form>
          </Card>
        </motion.div>
        {/* Analytics Snapshot */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-8 p-6 glassy border-2 border-cyan-400/40 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                📊 Analytics Snapshot
              </h2>
            </div>
            {lastUpdated && (
              <div className="text-xs text-cyan-300 mb-2">
                Last updated{" "}
                {Math.floor((Date.now() - lastUpdated.getTime()) / 1000)}{" "}
                seconds ago
              </div>
            )}
            {analyticsLoading ? (
              <div className="text-cyan-300">Loading analytics...</div>
            ) : analyticsError ? (
              <div className="text-red-400">{analyticsError}</div>
            ) : analytics ? (
              <div className="flex flex-wrap gap-6">
                <div className="bg-cyan-900/60 rounded-xl p-4 min-w-[180px] shadow-md">
                  <div className="text-cyan-200 text-lg font-bold">
                    Total Whispers
                  </div>
                  <div className="text-3xl font-extrabold text-white">
                    {analytics.totalWhispers}
                  </div>
                </div>
                <div className="bg-cyan-900/60 rounded-xl p-4 min-w-[180px] shadow-md">
                  <div className="text-cyan-200 text-lg font-bold">
                    Whispers Today
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {analytics.whispersToday}
                  </div>
                </div>
                <div className="bg-cyan-900/60 rounded-xl p-4 min-w-[180px] shadow-md">
                  <div className="text-cyan-200 text-lg font-bold">
                    Active Zones
                  </div>
                  <div className="text-xl font-bold text-white">
                    {zones.length}
                  </div>
                  <div className="text-xs text-cyan-300 mt-1">
                    {zones
                      .slice(0, 3)
                      .map((z) => z.zone)
                      .join(", ")}
                    {zones.length > 3 ? "..." : ""}
                  </div>
                </div>
                {/* Mood Distribution */}
                <div className="bg-cyan-900/60 rounded-xl p-4 min-w-[220px] shadow-md">
                  <div className="text-cyan-200 text-lg font-bold mb-1">
                    Mood Distribution
                  </div>
                  <div className="flex flex-col gap-1">
                    {analytics.emotionDistribution.map((e) => (
                      <div
                        key={e.emotion}
                        className="flex justify-between text-cyan-100"
                      >
                        <span>{e.emotion}</span>
                        <span className="font-bold">{e.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-cyan-300">No analytics data.</div>
            )}
          </Card>
        </motion.div>
        {/* Scheduled Nudges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-8 p-6 glassy border-2 border-pink-400/40 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                ⏳ Scheduled Nudges
              </h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    aria-label="Nudges Info"
                    className="cursor-pointer"
                  >
                    🔮
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Scheduled emotional reminders (mocked for now).
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-pink-300 font-semibold">Status:</span>
                <span className="inline-block w-3 h-3 rounded-full bg-pink-400 animate-pulse"></span>
                <span className="text-pink-200">Cron Active (mock)</span>
              </div>
              <button
                className="py-2 px-4 rounded bg-pink-600 hover:bg-pink-700 text-white font-semibold transition shadow-lg ml-auto"
                onClick={() => setNudgeModalOpen(true)}
              >
                ⏳ Schedule New Nudge
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {nudgeExamples.map((nudge, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-gradient-to-br from-pink-800/80 to-indigo-900/80 p-4 shadow-2xl border border-pink-400/30 text-pink-100"
                >
                  <span className="text-lg">{nudge}</span>
                </div>
              ))}
            </div>
            {/* Nudge Modal (mocked) */}
            {nudgeModalOpen && (
              <Dialog open={nudgeModalOpen} onOpenChange={setNudgeModalOpen}>
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
                  <div className="bg-slate-900 rounded-xl p-8 max-w-md w-full border-2 border-pink-400/40 shadow-2xl">
                    <h3 className="text-xl font-bold mb-4 text-pink-200">
                      Schedule New Nudge (Mock)
                    </h3>
                    <div className="text-pink-100 mb-4">
                      Scheduling nudges will be available soon. For now, this is
                      a preview modal.
                    </div>
                    <button
                      className="py-2 px-4 rounded bg-pink-600 hover:bg-pink-700 text-white font-semibold transition shadow-lg w-full"
                      onClick={() => setNudgeModalOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </Dialog>
            )}
          </Card>
        </motion.div>
        {/* FCM Token Manager */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mb-8 p-6 glassy border-2 border-emerald-400/40 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                📱 FCM Token Manager
              </h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    aria-label="FCM Table Info"
                    className="cursor-pointer"
                  >
                    🔍
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  These tokens are registered devices.
                </TooltipContent>
              </Tooltip>
            </div>
            {/* TODO: FCM token table */}
            <div className="text-slate-300">FCM token table goes here.</div>
          </Card>
        </motion.div>
        {/* Karma Viewer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="mb-8 p-6 glassy border-2 border-yellow-400/40 shadow-xl">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              🌟 Karma Viewer
            </h2>
            <div className="flex flex-col gap-2">
              {topZones.length === 0 ? (
                <div className="text-yellow-200">No zone data available.</div>
              ) : (
                topZones.map((zone, i) => (
                  <div key={zone.zone} className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-yellow-300">
                      #{i + 1}
                    </span>
                    <span className="text-lg text-yellow-100 font-semibold">
                      {zone.zone}
                    </span>
                    <span className="ml-auto text-yellow-200 font-mono">
                      {zone.likes || zone.whisper_count} karma
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
        {/* Zone Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="mb-8 p-6 glassy border-2 border-orange-400/40 shadow-xl">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              🔥 Zone Heatmap
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {zones.length === 0 ? (
                <div className="text-orange-200 col-span-4">
                  No zone data available.
                </div>
              ) : (
                zones.map((zone, i) => {
                  const intensity = Math.round(
                    70 + 180 * (zone.whisper_count / maxWhispers),
                  );
                  return (
                    <div
                      key={zone.zone}
                      className="rounded-xl p-4 shadow-xl border border-orange-400/30 text-orange-100 font-semibold text-center"
                      style={{
                        background: `linear-gradient(135deg, hsl(24, 100%, ${intensity}%) 60%, hsl(24, 80%, 18%) 100%)`,
                      }}
                    >
                      <div className="text-lg">{zone.zone}</div>
                      <div className="text-2xl font-bold">
                        {zone.whisper_count}
                      </div>
                      <div className="text-xs text-orange-200">whispers</div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </TooltipProvider>
  );
};

export default AdminPanel;
