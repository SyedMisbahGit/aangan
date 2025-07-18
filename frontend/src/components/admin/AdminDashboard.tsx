import React, { useEffect, useState } from "react";
import axios from "axios";
import { Suspense } from "react";
import { CustomSkeletonCard, useErrorBoundaryLogger } from "../ui/skeleton";

interface RecentActivity {
  content: string;
  zone: string;
  emotion: string;
  created_at: string;
}

interface Analytics {
  total: number;
  byEmotion: Record<string, number>;
  byZone: Record<string, number>;
  recentActivity: RecentActivity[];
}

interface ZoneStat {
  zone: string;
  whisper_count: number;
  activity_level: string;
}

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [zones, setZones] = useState<ZoneStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const jwt = localStorage.getItem("admin_jwt");
  const logError = useErrorBoundaryLogger("AdminDashboard");

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      axios.get("/api/analytics/whispers", { headers: { Authorization: `Bearer ${jwt}` } }),
      axios.get("/api/analytics/zones", { headers: { Authorization: `Bearer ${jwt}` } })
    ])
      .then(([whispersRes, zonesRes]) => {
        setAnalytics(whispersRes.data);
        setZones(zonesRes.data);
      })
      .catch((err) => {
        setError("Failed to fetch analytics");
        logError(err, { context: "fetch analytics" });
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!analytics) return null;

  return (
    <Suspense fallback={<CustomSkeletonCard className="my-12" />}>
      <div className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded shadow p-6 text-center">
            <div className="text-2xl font-bold text-aangan-primary">{analytics.total}</div>
            <div className="text-gray-600">Total Whispers</div>
          </div>
          <div className="bg-white rounded shadow p-6 text-center">
            <div className="text-2xl font-bold text-aangan-primary">{Object.values(analytics.byEmotion).reduce((a, b) => a + b, 0)}</div>
            <div className="text-gray-600">Whispers Today</div>
          </div>
          <div className="bg-white rounded shadow p-6 text-center">
            <div className="text-2xl font-bold text-aangan-primary">{Object.keys(analytics.byEmotion).length}</div>
            <div className="text-gray-600">Emotions</div>
          </div>
          <div className="bg-white rounded shadow p-6 text-center">
            <div className="text-2xl font-bold text-aangan-primary">{zones.length}</div>
            <div className="text-gray-600">Zones</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded shadow p-6">
            <h3 className="font-semibold mb-2">Emotion Distribution</h3>
            <ul>
              {Object.entries(analytics.byEmotion).map(([emotion, count]) => (
                <li key={emotion} className="flex justify-between py-1 border-b last:border-b-0">
                  <span>{emotion}</span>
                  <span className="font-bold text-aangan-primary">{count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded shadow p-6">
            <h3 className="font-semibold mb-2">Top Zones</h3>
            <ul>
              {zones.slice(0, 5).map(z => (
                <li key={z.zone} className="flex justify-between py-1 border-b last:border-b-0">
                  <span>{z.zone}</span>
                  <span className="font-bold text-aangan-primary">{z.whisper_count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h3 className="font-semibold mb-2">Recent Activity</h3>
          <ul>
            {analytics.recentActivity.map((a, i) => (
              <li key={i} className="flex justify-between py-1 border-b last:border-b-0">
                <span>{a.content}</span>
                <span className="text-xs text-gray-500">{a.zone} • {a.emotion} • {new Date(a.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Suspense>
  );
}; 