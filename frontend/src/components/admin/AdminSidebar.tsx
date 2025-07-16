import React from "react";
import { NavLink } from "react-router-dom";
import { Shield, FileText, Ban, MessageCircle, Users, Settings, BarChart3 } from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: <BarChart3 size={18} />, to: "/admin/dashboard" },
  { label: "Reports", icon: <FileText size={18} />, to: "/admin/reports" },
  { label: "Bans", icon: <Ban size={18} />, to: "/admin/bans" },
  { label: "Whispers", icon: <MessageCircle size={18} />, to: "/admin/whispers" },
  { label: "Users", icon: <Users size={18} />, to: "/admin/users" },
  { label: "Settings", icon: <Settings size={18} />, to: "/admin/settings" },
];

export const AdminSidebar: React.FC = () => (
  <aside className="h-full w-56 bg-white border-r border-gray-200 flex flex-col py-6 px-2 shadow-md">
    <div className="mb-8 flex items-center gap-2 px-4">
      <Shield className="text-aangan-primary" size={24} />
      <span className="font-bold text-lg tracking-wide text-aangan-primary">Aangan Admin</span>
    </div>
    <nav className="flex-1 flex flex-col gap-2">
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              isActive ? "bg-aangan-primary text-white" : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </nav>
  </aside>
); 