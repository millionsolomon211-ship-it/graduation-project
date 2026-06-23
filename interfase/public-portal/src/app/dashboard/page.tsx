"use client";

import React from 'react';
import { Shield, Home, FileText, Settings, LogOut, Bell, User } from 'lucide-react';
import { motion } from 'framer-motion';

import { useRouter } from 'next/navigation';
import { clearAuthCookies } from '@/lib/auth-client';

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    clearAuthCookies();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white p-6 hidden md:flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <Shield className="w-8 h-8 text-accent" />
          <span className="font-bold text-xl">Citizen Hub</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <NavItem icon={<Home className="w-5 h-5" />} label="Overview" active />
          <NavItem icon={<FileText className="w-5 h-5" />} label="My Cases" />
          <NavItem icon={<Bell className="w-5 h-5" />} label="Notifications" />
          <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" />
        </nav>

        <div className="pt-6 border-t border-white/10">
          <button onClick={handleLogout} className="w-full">
            <NavItem icon={<LogOut className="w-5 h-5" />} label="Sign Out" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-20 border-b border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#020617]/50 backdrop-blur-md px-8 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Welcome, Citizen</h2>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                <User className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard View */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Active Cases" value="0" color="bg-blue-500" />
            <StatCard title="New Messages" value="0" color="bg-purple-500" />
            <StatCard title="Safety Alerts" value="Low" color="bg-green-500" />
          </div>

          <div className="glass-card !bg-white dark:!bg-white/5 p-8 rounded-2xl border border-slate-200 dark:border-white/10 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No active records found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Your dashboard is currently empty. Any official police interactions or registered cases will appear here.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function StatCard({ title, value, color }: { title: string, value: string, color: string }) {
  return (
    <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
