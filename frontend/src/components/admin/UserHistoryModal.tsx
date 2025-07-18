import React, { useEffect, useState } from "react";
import axios from "axios";

interface Props {
  guestId: string;
  open: boolean;
  onClose: () => void;
}

interface WhisperHistory {
  id: string;
  content: string;
  emotion: string;
  zone: string;
  created_at: string;
}

interface ReportHistory {
  id: string;
  reason: string;
  created_at: string;
}

interface BanHistory {
  id: string;
  action: string;
  reason: string;
  created_at: string;
}

interface UserHistoryData {
  whispers: WhisperHistory[];
  reports: ReportHistory[];
  bans: BanHistory[];
}

export const UserHistoryModal: React.FC<Props> = ({ guestId, open, onClose }) => {
  const [tab, setTab] = useState("whispers");
  const [data, setData] = useState<UserHistoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const jwt = localStorage.getItem("admin_jwt");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    axios.get(`/api/admin/users/${guestId}/history`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then(res => setData(res.data))
      .catch(() => setError("Failed to fetch user history"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [guestId, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-semibold mb-4">User History: {guestId}</h2>
        <div className="flex gap-4 mb-4">
          <button className={`px-3 py-1 rounded ${tab === "whispers" ? "bg-aangan-primary text-white" : "bg-gray-100"}`} onClick={() => setTab("whispers")}>Whispers</button>
          <button className={`px-3 py-1 rounded ${tab === "reports" ? "bg-aangan-primary text-white" : "bg-gray-100"}`} onClick={() => setTab("reports")}>Reports</button>
          <button className={`px-3 py-1 rounded ${tab === "bans" ? "bg-aangan-primary text-white" : "bg-gray-100"}`} onClick={() => setTab("bans")}>Ban History</button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : data ? (
          <div>
            {tab === "whispers" && (
              <table className="w-full mb-4">
                <thead><tr><th>ID</th><th>Content</th><th>Emotion</th><th>Zone</th><th>Created</th></tr></thead>
                <tbody>
                  {data.whispers.map((w) => (
                    <tr key={w.id} className="border-b"><td>{w.id}</td><td>{w.content}</td><td>{w.emotion}</td><td>{w.zone}</td><td>{new Date(w.created_at).toLocaleString()}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === "reports" && (
              <table className="w-full mb-4">
                <thead><tr><th>ID</th><th>Reason</th><th>Created</th></tr></thead>
                <tbody>
                  {data.reports.map((r) => (
                    <tr key={r.id} className="border-b"><td>{r.id}</td><td>{r.reason}</td><td>{new Date(r.created_at).toLocaleString()}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === "bans" && (
              <table className="w-full mb-4">
                <thead><tr><th>ID</th><th>Action</th><th>Reason</th><th>Time</th></tr></thead>
                <tbody>
                  {data.bans.map((b) => (
                    <tr key={b.id} className="border-b"><td>{b.id}</td><td>{b.action}</td><td>{b.reason}</td><td>{new Date(b.created_at).toLocaleString()}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}; 