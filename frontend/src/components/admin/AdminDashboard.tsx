import React, { useEffect, useState, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { Suspense } from "react";
import { CustomSkeletonCard } from "../ui/skeleton";
import { useErrorBoundaryLogger } from "../../hooks/useErrorBoundaryLogger";
import { AnalyticsResponse, ZoneStat } from "../../types/analytics";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";

// Error boundary for the dashboard
class DashboardErrorBoundary extends React.Component<
  { children: React.ReactNode; onReset: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onReset: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Dashboard Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                this.props.onReset();
              }}
              className="mt-2"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

// Skeleton loader for dashboard stats
const DashboardStatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white rounded shadow p-6 animate-pulse">
        <div className="h-7 w-3/4 bg-gray-200 rounded mb-2"></div>
        <div className="h-5 w-1/2 bg-gray-100 rounded"></div>
      </div>
    ))}
  </div>
);

// Skeleton loader for charts
const ChartsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {[1, 2].map((i) => (
      <div key={i} className="bg-white rounded shadow p-6 animate-pulse">
        <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((j) => (
            <div key={j} className="flex justify-between items-center">
              <div className="h-4 w-1/4 bg-gray-100 rounded"></div>
              <div className="h-4 w-1/6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Skeleton loader for recent activity
const RecentActivitySkeleton = () => (
  <div className="bg-white rounded shadow p-6 animate-pulse">
    <div className="h-6 w-1/4 bg-gray-200 rounded mb-4"></div>
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex justify-between py-2 border-b last:border-b-0">
          <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
          <div className="h-4 w-1/4 bg-gray-100 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [zones, setZones] = useState<ZoneStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const jwt = localStorage.getItem("admin_jwt");
  const logError = useErrorBoundaryLogger("AdminDashboard");
  
  // Memoized fetch function to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    if (!jwt) {
      setError("Authentication required");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const [whispersRes, zonesRes] = await Promise.all([
        axios.get("/api/analytics/whispers", { 
          headers: { Authorization: `Bearer ${jwt}` },
          timeout: 10000 // 10 second timeout
        }),
        axios.get("/api/analytics/zones", { 
          headers: { Authorization: `Bearer ${jwt}` },
          timeout: 10000 // 10 second timeout
        })
      ]);
      
      setAnalytics(whispersRes.data);
      setZones(zonesRes.data);
    } catch (err) {
      const error = err as AxiosError;
      const errorMessage = error.response?.status === 401 
        ? "Authentication failed. Please log in again."
        : error.response?.status === 403
        ? "You don't have permission to view this data."
        : "Failed to fetch analytics data. Please try again.";
      
      setError(errorMessage);
      logError(error, { 
        context: "fetch analytics",
        url: error.config?.url,
        status: error.response?.status 
      });
    } finally {
      setLoading(false);
    }
  }, [jwt, logError, retryCount]); // Retry when jwt or retryCount changes

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Handle retry
  const handleRetry = () => {
    setRetryCount(prev => prev + 1); // This will trigger a refetch
  };

  // Show error message if there's an error
  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            <p className="mb-2">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                'Try Again'
              )}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Show loading skeleton if data is being fetched
  if (loading) {
    return (
      <div className="container mx-auto p-4" data-testid="loading-skeleton">
        <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
        
        {/* Stats Loading */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <CustomSkeletonCard className="h-32" data-testid="stat-skeleton-1" />
          <CustomSkeletonCard className="h-32" data-testid="stat-skeleton-2" />
          <CustomSkeletonCard className="h-32" data-testid="stat-skeleton-3" />
        </div>
        
        {/* Charts Loading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CustomSkeletonCard className="h-80" data-testid="chart-skeleton-1" />
          <CustomSkeletonCard className="h-80" data-testid="chart-skeleton-2" />
        </div>
        
        {/* Recent Activity Loading */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <CustomSkeletonCard className="h-20" data-testid="activity-skeleton-1" />
            <CustomSkeletonCard className="h-20" data-testid="activity-skeleton-2" />
            <CustomSkeletonCard className="h-20" data-testid="activity-skeleton-3" />
          </div>
        </div>
      </div>
    );
  }
  
  // Show empty state if no data is available
  if (!analytics) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">No analytics data available</p>
        <Button variant="outline" onClick={handleRetry} className="mt-2">
          Refresh Data

// Main dashboard content
return (
<DashboardErrorBoundary onReset={handleRetry}>
<Suspense fallback={<CustomSkeletonCard className="my-12" />}>
<div className="container mx-auto p-4" data-testid="dashboard-content">
<h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

{/* Stats */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
<div className="bg-white rounded-lg shadow p-6" data-testid="total-whispers">
<h3 className="text-gray-500 text-sm font-medium">Total Whispers</h3>
<p className="text-3xl font-bold">{analytics.total}</p>
</div>
<div className="bg-white rounded-lg shadow p-6" data-testid="top-emotion">
<h3 className="text-gray-500 text-sm font-medium">Top Emotion</h3>
<p className="text-3xl font-bold capitalize">
{Object.entries(analytics.byEmotion).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || 'N/A'}
</p>
</div>
<div className="bg-white rounded-lg shadow p-6" data-testid="top-zone">
<h3 className="text-gray-500 text-sm font-medium">Top Zone</h3>
<p className="text-3xl font-bold">
{Object.entries(analytics.byZone).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || 'N/A'}
</p>
</div>
</div>

{/* Charts */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
<div className="bg-white rounded-lg shadow p-6" data-testid="emotion-distribution">
<h3 className="text-gray-500 text-sm font-medium mb-4">Emotion Distribution</h3>
<div className="space-y-2">
{Object.entries(analytics.byEmotion).map(([emotion, count]) => (
<div key={emotion} className="flex items-center">
<div className="w-1/3 capitalize">{emotion}</div>
<div className="w-2/3">
<div className="w-full bg-gray-200 rounded-full h-2.5">
<div 
className="bg-aangan-primary h-2.5 rounded-full" 
style={{ width: `${(count as number / Math.max(...Object.values(analytics.byEmotion).map(v => v as number), 1)) * 100}%` }}
/>
</div>
</div>
<div className="w-8 text-right text-sm font-medium">
{count as number}
</div>
</div>
))}
</div>
</div>

{/* Zone Distribution */}
<div className="bg-white rounded-lg shadow p-6" data-testid="zone-distribution">
<h3 className="text-gray-500 text-sm font-medium mb-4">Top Zones</h3>
<div className="space-y-4">
{zones.slice(0, 5).map((zone) => (
<div key={zone.zone} className="flex items-center">
<div className="w-1/3">{zone.zone}</div>
<div className="w-2/3">
<div className="w-full bg-gray-200 rounded-full h-2.5">
<div 
className="bg-aangan-primary h-2.5 rounded-full" 
style={{ 
width: `${(zone.whisper_count / Math.max(...zones.map(z => z.whisper_count), 1)) * 100}%` 
}}
/>
</div>
</div>
<div className="w-8 text-right text-sm font-medium">
{zone.whisper_count}
</div>
</div>
))}
</div>
</div>
</div>

{/* Recent Activity */}
<div className="bg-white rounded-lg shadow p-6" data-testid="recent-activity">
<h3 className="text-gray-500 text-sm font-medium mb-4">Recent Activity</h3>
<div className="space-y-2">
{analytics.recentActivity && analytics.recentActivity.length > 0 ? (
analytics.recentActivity.map((activity, index) => (
<div key={index} className="py-2 border-b last:border-b-0">
<p className="text-sm">{activity.content}</p>
<div className="flex justify-between text-xs text-gray-500 mt-1">
<span>{activity.zone}</span>
<div>
{activity.emotion && <span className="capitalize">{activity.emotion.toLowerCase()}</span>}
{activity.emotion && activity.created_at && <span> • </span>}
{activity.created_at && (
<span>{new Date(activity.created_at).toLocaleString()}</span>
)}
</div>
</div>
</div>
))
) : (
<p className="text-gray-500 text-sm">No recent activity</p>
)}
</div>
</div>
</div>
</Suspense>
</DashboardErrorBoundary>
);
};