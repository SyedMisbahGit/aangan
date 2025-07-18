import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminShell } from "../components/admin/AdminShell";
// Placeholder imports for tab components
import { ReportList } from "../components/admin/ReportList";
import { BanTable } from "../components/admin/BanTable";
import { AdminDashboard } from "../components/admin/AdminDashboard";
// import { WhisperList } from "../components/admin/WhisperList";
// import { UserList } from "../components/admin/UserList";
import { AdminSettings } from "../components/admin/AdminSettings";
import AdminAIJobs from "./AdminAIJobs";
import ErrorBoundary from "../components/shared/ErrorBoundary";
import { getErrorMessage } from "../lib/errorUtils";
import { useRef } from "react";

const Admin: React.FC = () => {
  const mainRef = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, []);
  return (
    <ErrorBoundary narratorLine="A gentle hush falls over the campus. Something went adrift in the admin dashboard.">
      <main
        role="main"
        aria-labelledby="page-title"
        tabIndex={-1}
        ref={mainRef}
        className="min-h-screen"
      >
        <h1 id="page-title" className="sr-only">Admin Dashboard</h1>
        <AdminShell>
          <Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="reports" element={<ReportList />} />
            <Route path="bans" element={<BanTable />} />
            <Route path="whispers" element={<div>Whispers (Coming Soon)</div>} />
            <Route path="users" element={<div>Users (Coming Soon)</div>} />
            <Route path="ai-jobs" element={<AdminAIJobs />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </AdminShell>
      </main>
    </ErrorBoundary>
  );
};

export default Admin;
