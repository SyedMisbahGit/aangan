import React, { useState, useEffect } from 'react';
import { useRealtime } from '../../contexts/RealtimeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Wifi, WifiOff, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

interface PerformanceMetrics {
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  latency: number;
  messageDeliveryRate: number;
  memoryUsage: number;
  batteryLevel?: number;
  networkType?: string;
}

export const PerformanceMonitor: React.FC = () => {
  const { isConnected, connectionStatus } = useRealtime();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    connectionQuality: 'disconnected',
    latency: 0,
    messageDeliveryRate: 100,
    memoryUsage: 0
  });
  const [showDetails, setShowDetails] = useState(false);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceMetrics[]>([]);

  useEffect(() => {
    const updateMetrics = () => {
      // Simulate performance metrics (in real app, these would come from actual measurements)
      const newMetrics: PerformanceMetrics = {
        connectionQuality: isConnected ? 
          (metrics.latency < 100 ? 'excellent' : metrics.latency < 300 ? 'good' : 'poor') : 
          'disconnected',
        latency: isConnected ? Math.random() * 500 + 50 : 0,
        messageDeliveryRate: isConnected ? 95 + Math.random() * 5 : 0,
        memoryUsage: performance.memory?.usedJSHeapSize ? 
          performance.memory.usedJSHeapSize / 1024 / 1024 : 0,
        batteryLevel: (navigator as any).getBattery?.() ? 
          (navigator as any).getBattery().then((battery: any) => battery.level * 100) : undefined,
        networkType: (navigator as any).connection?.effectiveType || 'unknown'
      };

      setMetrics(newMetrics);
      setPerformanceHistory(prev => [...prev.slice(-9), newMetrics]); // Keep last 10 readings
    };

    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, [isConnected, connectionStatus]);

  const getConnectionIcon = () => {
    switch (metrics.connectionQuality) {
      case 'excellent':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'good':
        return <Wifi className="h-4 w-4 text-yellow-500" />;
      case 'poor':
        return <Wifi className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConnectionColor = () => {
    switch (metrics.connectionQuality) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPerformanceStatus = () => {
    if (!isConnected) return { status: 'disconnected', message: 'Connection lost' };
    if (metrics.latency > 1000) return { status: 'warning', message: 'High latency detected' };
    if (metrics.messageDeliveryRate < 90) return { status: 'warning', message: 'Message delivery issues' };
    if (metrics.memoryUsage > 100) return { status: 'warning', message: 'High memory usage' };
    return { status: 'healthy', message: 'All systems operational' };
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4" />
          System Performance
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            {showDetails ? 'Hide' : 'Details'}
          </button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getConnectionIcon()}
            <span className="text-sm font-medium">Connection</span>
          </div>
          <Badge className={getConnectionColor()}>
            {metrics.connectionQuality}
          </Badge>
        </div>

        {/* Performance Status Alert */}
        {performanceStatus.status !== 'healthy' && (
          <Alert className={performanceStatus.status === 'warning' ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {performanceStatus.message}
            </AlertDescription>
          </Alert>
        )}

        {showDetails && (
          <div className="space-y-3 pt-2 border-t">
            {/* Latency */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Latency</span>
                <span>{metrics.latency.toFixed(0)}ms</span>
              </div>
              <Progress 
                value={Math.min((metrics.latency / 1000) * 100, 100)} 
                className="h-1"
              />
            </div>

            {/* Message Delivery Rate */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Message Delivery</span>
                <span>{metrics.messageDeliveryRate.toFixed(1)}%</span>
              </div>
              <Progress 
                value={metrics.messageDeliveryRate} 
                className="h-1"
              />
            </div>

            {/* Memory Usage */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Memory Usage</span>
                <span>{metrics.memoryUsage.toFixed(1)}MB</span>
              </div>
              <Progress 
                value={Math.min((metrics.memoryUsage / 200) * 100, 100)} 
                className="h-1"
              />
            </div>

            {/* Network Type */}
            {metrics.networkType && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Network</span>
                <span className="font-medium">{metrics.networkType}</span>
              </div>
            )}

            {/* Battery Level */}
            {metrics.batteryLevel && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Battery</span>
                <span className="font-medium">{metrics.batteryLevel.toFixed(0)}%</span>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Active: {connectionStatus.activeConnections || 0}</span>
          <span>Zones: {connectionStatus.activeZones || 0}</span>
          <span>Uptime: {Math.floor(connectionStatus.uptime || 0)}s</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor; 