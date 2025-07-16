import React, { useEffect, useState } from "react";
import axios from "axios";
import realtimeService from "../../services/realtime";
import { toast } from "../ui/use-toast";
import { WhisperViewModal } from "./WhisperViewModal";
import { UserHistoryModal } from "./UserHistoryModal";

interface Report {
  id?: number;
  whisper_id: string;
  reason: string;
  guest_id: string;
  created_at: string;
  zone?: string;
  isNew?: boolean;
}

export const ModerationInbox: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [whisperModal, setWhisperModal] = useState<string | null>(null);
  const [userModal, setUserModal] = useState<string | null>(null);
  const jwt = localStorage.getItem("admin_jwt");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    fetchReports();
    interval = setInterval(() => setRefresh(r => r + 1), 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line
  }, [refresh]);

  useEffect(() => {
    const handleNewReport = (report: Report) => {
      // Play soft sound (optional, ignore if not supported)
      try {
        const audio = new Audio("/notification.mp3");
        audio.volume = 0.2;
        audio.play().catch(() => {});
      } catch {}
      setReports(prev => [{ ...report, id: Math.random(), isNew: true }, ...prev]);
      toast({
        title: "New Report",
        description: `User ${report.guest_id} reported a whisper (${report.whisper_id})`,
        variant: "default",
      });
      setTimeout(() => {
        setReports(prev => prev.map(r => r.whisper_id === report.whisper_id ? { ...r, isNew: false } : r));
      }, 2000);
    };
    realtimeService.on("new-report", handleNewReport);
    return () => {
      realtimeService.off("new-report", handleNewReport);
    };
  }, []);

  async function fetchReports() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/admin/reports", {
        headers: { Authorization: `Bearer ${jwt}` },
        params: { status: "open" },
      });
      setReports(res.data);
    } catch {
      setError("Failed to fetch moderation inbox");
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve(id?: number, whisper_id?: string) {
    if (!id && whisper_id) {
      // Real-time report, no DB id yet: fallback to polling
      setReports(prev => prev.filter(r => r.whisper_id !== whisper_id));
      return;
    }
    await axios.patch(`/api/admin/reports/${id}/resolve`, { resolution: "resolved from inbox" }, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    fetchReports();
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold">Moderation Inbox</span>
        {reports.length > 0 && (
          <span className="bg-red-600 text-white rounded-full px-2 py-0.5 text-xs">{reports.length}</span>
        )}
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : reports.length === 0 ? (
        <div className="text-gray-500">No pending reports.</div>
      ) : (
        <ul className="divide-y divide-gray-200 bg-white rounded shadow">
          {reports.map(r => (
            <li
              key={r.id || r.whisper_id}
              className={`flex items-center justify-between px-4 py-2 transition-colors duration-500 ${r.isNew ? "bg-yellow-100 animate-pulse" : ""}`}
            >
              <div>
                <div className="font-medium">
                  Whisper: <button className="underline text-blue-700" onClick={() => setWhisperModal(r.whisper_id)}>{r.whisper_id}</button>
                </div>
                <div className="text-xs text-gray-600">
                  User: <button className="underline text-blue-700" onClick={() => setUserModal(r.guest_id)}>{r.guest_id}</button> | Zone: {r.zone || "-"} | Reason: {r.reason}
                </div>
                <div className="text-xs text-gray-400">{new Date(r.created_at).toLocaleString()}</div>
              </div>
              <button
                className="bg-green-600 text-white px-3 py-1 rounded text-xs ml-4"
                onClick={() => handleResolve(r.id, r.whisper_id)}
              >Mark Resolved</button>
            </li>
          ))}
        </ul>
      )}
      {whisperModal && (
        <WhisperViewModal whisperId={whisperModal} open={!!whisperModal} onClose={() => setWhisperModal(null)} />
      )}
      {userModal && (
        <UserHistoryModal guestId={userModal} open={!!userModal} onClose={() => setUserModal(null)} />
      )}
    </div>
  );
}; 