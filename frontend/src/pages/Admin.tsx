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

const Admin: React.FC = () => {
  return (
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
  );
};

export default Admin;
