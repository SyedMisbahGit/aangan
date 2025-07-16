import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAdminUser } from "./AdminShell";

interface Admin {
  id: number;
  username: string;
  role: string;
  email?: string;
}

export const AdminSettings: React.FC = () => {
  const user = useAdminUser();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleUpdate, setRoleUpdate] = useState<{ id: number; role: string } | null>(null);
  const [updating, setUpdating] = useState(false);
  const jwt = localStorage.getItem("admin_jwt");

  useEffect(() => {
    fetchAdmins();
    // eslint-disable-next-line
  }, []);

  async function fetchAdmins() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/admins", { headers: { Authorization: `Bearer ${jwt}` } });
      setAdmins(res.data);
    } catch {
      setError("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(id: number, role: string) {
    setUpdating(true);
    try {
      await axios.post(
        "/api/admin/roles/assign",
        { admin_id: id, role },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      fetchAdmins();
    } catch {
      setError("Failed to update role");
    } finally {
      setUpdating(false);
      setRoleUpdate(null);
    }
  }

  async function handleRevoke(id: number) {
    setUpdating(true);
    try {
      await axios.post(
        "/api/admin/roles/revoke",
        { admin_id: id },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      fetchAdmins();
    } catch {
      setError("Failed to revoke role");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded shadow p-6 mb-8">
        <h3 className="font-semibold mb-2">Your Info</h3>
        <div>Username: <span className="font-bold">{user?.username}</span></div>
        <div>Role: <span className="font-bold text-aangan-primary">{user?.role}</span></div>
      </div>
      <div className="bg-white rounded shadow p-6">
        <h3 className="font-semibold mb-2">All Admins</h3>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Email</th>
                {user?.role === "super_admin" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {admins.map(a => (
                <tr key={a.id} className="border-b">
                  <td>{a.id}</td>
                  <td>{a.username}</td>
                  <td>
                    {user?.role === "super_admin" && roleUpdate?.id === a.id ? (
                      <select
                        value={roleUpdate.role}
                        onChange={e => setRoleUpdate({ id: a.id, role: e.target.value })}
                        className="border rounded px-2 py-1"
                      >
                        <option value="moderator">moderator</option>
                        <option value="admin">admin</option>
                        <option value="super_admin">super_admin</option>
                      </select>
                    ) : (
                      <span className="font-bold text-aangan-primary">{a.role}</span>
                    )}
                  </td>
                  <td>{a.email || "-"}</td>
                  {user?.role === "super_admin" && (
                    <td>
                      {roleUpdate?.id === a.id ? (
                        <>
                          <button
                            className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                            disabled={updating}
                            onClick={() => handleRoleChange(a.id, roleUpdate.role)}
                          >Save</button>
                          <button
                            className="bg-gray-300 px-3 py-1 rounded"
                            onClick={() => setRoleUpdate(null)}
                          >Cancel</button>
                        </>
                      ) : (
                        <>
                          <button
                            className="bg-blue-600 text-white px-3 py-1 rounded mr-2"
                            onClick={() => setRoleUpdate({ id: a.id, role: a.role })}
                          >Change Role</button>
                          {a.role !== "moderator" && (
                            <button
                              className="bg-red-600 text-white px-3 py-1 rounded"
                              disabled={updating}
                              onClick={() => handleRevoke(a.id)}
                            >Revoke to Moderator</button>
                          )}
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}; 