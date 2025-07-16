import React, { useEffect, useState, useCallback } from 'react';

interface AIJob {
  id: number;
  whisper_id: string;
  zone: string;
  emotion: string;
  status: string;
  created_at: string;
  updated_at: string;
  error?: string;
}

interface Stats {
  total: number;
  byStatus: { status: string; c: number }[];
  avgTime: number | null;
  medianTime: number | null;
  failRate: number | null;
}

const AdminAIJobs: React.FC = () => {
  const [jobs, setJobs] = useState<AIJob[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [whisperIdFilter, setWhisperIdFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/api/admin/ai-jobs';
      if (statusFilter || whisperIdFilter) {
        url = `/api/admin/ai-jobs/search?${statusFilter ? `status=${statusFilter}` : ''}${statusFilter && whisperIdFilter ? '&' : ''}${whisperIdFilter ? `whisper_id=${whisperIdFilter}` : ''}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      setError('Failed to fetch jobs');
    }
    setLoading(false);
  }, [statusFilter, whisperIdFilter]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/ai-jobs/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchStats();
    // Optionally poll every 30s
    // const interval = setInterval(() => { fetchJobs(); fetchStats(); }, 30000);
    // return () => clearInterval(interval);
  }, [fetchJobs]);

  const handleRetry = async (id: number) => {
    await fetch(`/api/admin/ai-jobs/${id}/retry`, { method: 'POST' });
    fetchJobs();
  };
  const handleCancel = async (id: number) => {
    await fetch(`/api/admin/ai-jobs/${id}/cancel`, { method: 'POST' });
    fetchJobs();
  };

  return (
    <div>
      <h1>AI Job Admin Dashboard</h1>
      <div>
        <label>Status: </label>
        <input value={statusFilter} onChange={e => setStatusFilter(e.target.value)} placeholder="pending|done|error|..." />
        <label> Whisper ID: </label>
        <input value={whisperIdFilter} onChange={e => setWhisperIdFilter(e.target.value)} placeholder="whisper_id" />
        <button onClick={fetchJobs}>Search</button>
      </div>
      {stats && (
        <div>
          <h3>Stats</h3>
          <div>Total: {stats.total}</div>
          <div>Failure Rate: {stats.failRate}</div>
          <div>Avg Time: {stats.avgTime}</div>
          <div>Median Time: {stats.medianTime}</div>
          <div>Status Counts: {stats.byStatus.map(s => `${s.status}: ${s.c}`).join(', ')}</div>
        </div>
      )}
      {loading ? <div>Loading...</div> : error ? <div>{error}</div> : (
        <table border={1} cellPadding={4}>
          <thead>
            <tr>
              <th>ID</th><th>Whisper ID</th><th>Status</th><th>Zone</th><th>Emotion</th><th>Created</th><th>Updated</th><th>Error</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.id}>
                <td>{job.id}</td>
                <td>{job.whisper_id}</td>
                <td>{job.status}</td>
                <td>{job.zone}</td>
                <td>{job.emotion}</td>
                <td>{job.created_at}</td>
                <td>{job.updated_at}</td>
                <td>{job.error}</td>
                <td>
                  {job.status === 'error' && <button onClick={() => handleRetry(job.id)}>Retry</button>}
                  {(job.status === 'pending' || job.status === 'running') && <button onClick={() => handleCancel(job.id)}>Cancel</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminAIJobs; 