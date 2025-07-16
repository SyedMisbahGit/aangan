import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserHistoryModal } from "./UserHistoryModal";
import { WhisperViewModal } from "./WhisperViewModal";

interface Report {
  id: number;
  whisper_id: string;
  reason: string;
  guest_id: string;
  created_at: string;
  zone?: string;
  resolved?: boolean;
  resolution?: string;
  note?: string;
}

export const ReportList: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [zone, setZone] = useState("");
  const [status, setStatus] = useState("");
  const [userModal, setUserModal] = useState<string | null>(null);
  const [whisperModal, setWhisperModal] = useState<string | null>(null);

  const jwt = localStorage.getItem("admin_jwt");

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line
  }, [zone, status]);

  async function fetchReports() {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (zone) params.zone = zone;
      if (status) params.status = status;
      const res = await axios.get("/api/admin/reports", {
        headers: { Authorization: `Bearer ${jwt}` },
        params,
      });
      setReports(res.data);
    } catch (err) {
      setError("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(id: number, checked: boolean) {
    setSelected(checked ? [...selected, id] : selected.filter(i => i !== id));
  }

  function handleSelectAll(checked: boolean) {
    setSelected(checked ? reports.map(r => r.id) : []);
  }

  async function handleBulkResolve() {
    for (const id of selected) {
      await axios.patch(`/api/admin/reports/${id}/resolve`, { resolution: "bulk resolved" }, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
    }
    setSelected([]);
    fetchReports();
  }

  async function handleBulkDelete() {
    for (const id of selected) {
      await axios.delete(`/api/whisper_reports/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
    }
    setSelected([]);
    fetchReports();
  }

  const filtered = reports.filter(r =>
    (!search || r.guest_id.includes(search) || r.reason.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="flex gap-4 mb-4 items-end">
        <input
          className="border rounded px-3 py-2"
          placeholder="Search by user or reason..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Zone"
          value={zone}
          onChange={e => setZone(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
        </select>
        <button
          className="bg-aangan-primary text-white px-4 py-2 rounded"
          onClick={fetchReports}
        >Refresh</button>
        {selected.length > 0 && (
          <>
            <button
              className="ml-2 bg-green-600 text-white px-3 py-2 rounded"
              onClick={handleBulkResolve}
            >Resolve Selected</button>
            <button
              className="ml-2 bg-red-600 text-white px-3 py-2 rounded"
              onClick={handleBulkDelete}
            >Delete Selected</button>
          </>
        )}
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <table className="w-full bg-white rounded shadow overflow-x-auto">
          <thead>
            <tr className="bg-gray-100">
              <th><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={e => handleSelectAll(e.target.checked)} /></th>
              <th>ID</th>
              <th>Whisper</th>
              <th>Reason</th>
              <th>User</th>
              <th>Zone</th>
              <th>Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td><input type="checkbox" checked={selected.includes(r.id)} onChange={e => handleSelect(r.id, e.target.checked)} /></td>
                <td>{r.id}</td>
                <td>
                  <button className="underline text-blue-600" onClick={() => setWhisperModal(r.whisper_id)}>{r.whisper_id}</button>
                </td>
                <td>{r.reason}</td>
                <td>
                  <button className="underline text-blue-600" onClick={() => setUserModal(r.guest_id)}>{r.guest_id}</button>
                </td>
                <td>{r.zone || "-"}</td>
                <td>{new Date(r.created_at).toLocaleString()}</td>
                <td>{r.resolved ? <span className="text-green-600">Resolved</span> : <span className="text-yellow-700">Open</span>}</td>
                <td>
                  {!r.resolved && (
                    <button className="text-green-700 mr-2" onClick={() => handleBulkResolve.call(null, [r.id])}>Resolve</button>
                  )}
                  <button className="text-red-700" onClick={() => handleBulkDelete.call(null, [r.id])}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {userModal && (
        <UserHistoryModal guestId={userModal} open={!!userModal} onClose={() => setUserModal(null)} />
      )}
      {whisperModal && (
        <WhisperViewModal whisperId={whisperModal} open={!!whisperModal} onClose={() => setWhisperModal(null)} />
      )}
    </div>
  );
}; 