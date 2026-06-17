import { Shield, Users, FileSearch, ShieldAlert, BarChart3, Settings } from 'lucide-react';

export default function InternalDashboard() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <nav className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <Shield className="w-8 h-8 text-blue-400" />
          <span className="font-bold tracking-tight">Ops Center</span>
        </div>
        
        <div className="flex-1 p-4 space-y-2">
          <NavItem icon={<BarChart3 />} label="Analytics" active />
          <NavItem icon={<Users />} label="Citizen Database" />
          <NavItem icon={<FileSearch />} label="Case Management" />
          <NavItem icon={<ShieldAlert />} label="Security Vault" />
        </div>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
          SYSTEM CLASSIFIED: LEVEL 4
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 flex flex-col bg-slate-50">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <h1 className="text-xl font-bold text-slate-800 uppercase tracking-widest">Command Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">ID: 9942-X</span>
            <div className="w-8 h-8 rounded-full bg-slate-200"></div>
          </div>
        </header>

        <section className="p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={<Users />} label="Total Citizens" value="12,402" />
          <StatCard icon={<FileSearch />} label="Pending Cases" value="48" />
          <StatCard icon={<ShieldAlert />} label="Threat Level" value="SAFE" color="text-green-600" />
          <StatCard icon={<BarChart3 />} label="System Load" value="12%" />
        </section>

        <section className="px-8 flex-1">
          <div className="bg-white rounded-xl border border-slate-200 h-full p-8 flex flex-col items-center justify-center text-slate-400">
             <div className="mb-4 p-4 rounded-full bg-slate-50">
               <Settings className="w-12 h-12 animate-spin-slow" />
             </div>
             <p className="font-medium tracking-tight">Accessing Secure Records...</p>
             <p className="text-sm">Restricted to Level 3 Clearance and above.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${active ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
      <span className="w-5 h-5">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function StatCard({ icon, label, value, color = "text-slate-900" }: { icon: any, label: string, value: string, color?: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="text-slate-400 mb-2 flex items-center gap-2">
        <span className="w-4 h-4">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
    </div>
  );
}
