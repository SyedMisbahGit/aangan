import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserHistoryModal } from "./UserHistoryModal";

interface Ban {
  guest_id: string;
  banned_at: string;
  reason: string;
}

interface BanHistory {
  id: number;
  guest_id: string;
  action: string;
  admin_id: number;
  reason: string;
  created_at: string;
}

export const BanTable: React.FC = () => {
  const [bans, setBans] = useState<Ban[]>([]);
  const [history, setHistory] = useState<BanHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestId, setGuestId] = useState("");
  const [reason, setReason] = useState("");
  const [banLoading, setBanLoading] = useState(false);
  const [userModal, setUserModal] = useState<string | null>(null);

  const jwt = localStorage.getItem("admin_jwt");

  useEffect(() => {
    fetchBans();
    fetchHistory();
    // eslint-disable-next-line
  }, []);

  async function fetchBans() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/admin/bans", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setBans(res.data);
    } catch (err) {
      setError("Failed to fetch bans");
    } finally {
      setLoading(false);
    }
  }

  async function fetchHistory() {
    try {
      const res = await axios.get("/api/admin/ban-history", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setHistory(res.data);
    } catch {}
  }

  async function handleBan(e: React.FormEvent) {
    e.preventDefault();
    setBanLoading(true);
    try {
      await axios.post(
        "/api/admin/ban-user",
        { guest_id: guestId, reason },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      setGuestId("");
      setReason("");
      fetchBans();
      fetchHistory();
    } catch {
      setError("Failed to ban user");
    } finally {
      setBanLoading(false);
    }
  }

  async function handleUnban(guest_id: string) {
    try {
      await axios.post(
        "/api/admin/unban-user",
        { guest_id, reason: "Unbanned by admin" },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      fetchBans();
      fetchHistory();
    } catch {
      setError("Failed to unban user");
    }
  }

  return (
    <div>
      <form className="flex gap-4 mb-6" onSubmit={handleBan}>
        <input
          className="border rounded px-3 py-2"
          placeholder="Guest ID to ban"
          value={guestId}
          onChange={e => setGuestId(e.target.value)}
          required
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Reason"
          value={reason}
          onChange={e => setReason(e.target.value)}
          required
        />
        <button
          className="bg-red-600 text-white px-4 py-2 rounded"
          type="submit"
          disabled={banLoading}
        >
          {banLoading ? "Banning..." : "Ban User"}
        </button>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <table className="w-full bg-white rounded shadow overflow-x-auto mb-8">
          <thead>
            <tr className="bg-gray-100">
              <th>Guest ID</th>
              <th>Banned At</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bans.map(ban => (
              <tr key={ban.guest_id} className="border-b hover:bg-gray-50">
                <td>
                  <button className="underline text-blue-600" onClick={() => setUserModal(ban.guest_id)}>{ban.guest_id}</button>
                </td>
                <td>{new Date(ban.banned_at).toLocaleString()}</td>
                <td>{ban.reason}</td>
                <td>
                  <button className="text-green-700" onClick={() => handleUnban(ban.guest_id)}>Unban</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h3 className="font-semibold mb-2">Ban/Unban History</h3>
      <table className="w-full bg-white rounded shadow overflow-x-auto">
        <thead>
          <tr className="bg-gray-100">
            <th>ID</th>
            <th>Guest ID</th>
            <th>Action</th>
            <th>Admin</th>
            <th>Reason</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {history.map(h => (
            <tr key={h.id} className="border-b hover:bg-gray-50">
              <td>{h.id}</td>
              <td>
                <button className="underline text-blue-600" onClick={() => setUserModal(h.guest_id)}>{h.guest_id}</button>
              </td>
              <td>{h.action}</td>
              <td>{h.admin_id}</td>
              <td>{h.reason}</td>
              <td>{new Date(h.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {userModal && (
        <UserHistoryModal guestId={userModal} open={!!userModal} onClose={() => setUserModal(null)} />
      )}
    </div>
  );
}; 