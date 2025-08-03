// Analytics API response types

export interface RecentActivity {
  id: string;
  content: string;
  emotion: string;
  zone: string;
  created_at: string;
}

export interface AnalyticsResponse {
  total: number;
  byEmotion: Record<string, number>;
  byZone: Record<string, number>;
  recentActivity: RecentActivity[];
}

export interface ZoneStat {
  zone: string;
  whisper_count: number;
  activity_level: 'high' | 'medium' | 'low';
}
