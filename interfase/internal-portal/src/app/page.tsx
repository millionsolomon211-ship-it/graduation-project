import Link from 'next/link';
import { Shield, Lock } from 'lucide-react';

export default function InternalLanding() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <div className="mb-8 flex flex-col items-center">
        <Shield className="w-16 h-16 text-blue-500 mb-4" />
        <h1 className="text-3xl font-black tracking-tighter uppercase">Police Operations Portal</h1>
        <p className="text-slate-500 font-mono text-sm tracking-widest mt-2">SECURE INTERNAL ACCESS ONLY</p>
      </div>

      <div className="w-full max-w-sm p-8 bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Officer Badge ID</label>
              <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors" placeholder="BADGE-0000" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Secure Passkey</label>
              <input type="password" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors" placeholder="••••••••" />
            </div>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all">
            <Lock className="w-4 h-4" /> Authenticate Access
          </button>

          <Link href="/dashboard" className="block text-center text-xs text-slate-500 hover:text-white transition-colors">
            Emergency Access / Support
          </Link>
        </div>
      </div>

      <div className="mt-12 text-[10px] text-slate-600 font-mono">
        LOG_TRACE_ID: 772-AD-992
      </div>
    </div>
  );
}
