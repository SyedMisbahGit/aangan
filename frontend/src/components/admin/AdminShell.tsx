import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import axios from "axios";
import { ModerationInbox } from "./ModerationInbox";
import { AdminUserProvider } from "../../contexts/AdminUserContext";
import { useAdminUser } from "../../contexts/useAdminUser";

const AdminContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser } = useAdminUser();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const jwt = localStorage.getItem("admin_jwt");
    if (!jwt) {
      navigate("/admin-login", { replace: true });
      return;
    }
    axios.get("/api/auth/verify", { headers: { Authorization: `Bearer ${jwt}` } })
      .then(res => {
        if (res.data && res.data.user) {
          setUser(res.data.user);
        } else {
          localStorage.removeItem("admin_jwt");
          navigate("/admin-login", { replace: true });
        }
      })
      .catch(() => {
        localStorage.removeItem("admin_jwt");
        navigate("/admin-login", { replace: true });
      })
      .finally(() => setLoading(false));
     
  }, [navigate, setUser]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-aangan-primary text-xl">Loading admin...</div>;
  }
  if (!user) return null;

  return (
    <div className="flex h-screen bg-cream-50">
      <AdminSidebar />
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <div className="font-semibold text-lg text-aangan-primary">Aangan Admin Dashboard</div>
          <div className="flex items-center gap-8">
            <ModerationInbox />
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">{user.username}</span>
              <span className="text-xs bg-aangan-primary text-white rounded px-2 py-1">{user.role}</span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </main>
    </div>
  );
};

const AdminShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AdminUserProvider>
      <AdminContent>{children}</AdminContent>
    </AdminUserProvider>
  );
};

export default AdminShell;