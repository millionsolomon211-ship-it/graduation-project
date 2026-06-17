import Link from 'next/link';
import { Shield, ArrowRight, CheckCircle, Lock, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-[#020617] text-white overflow-hidden">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-accent" />
          <span className="font-bold text-xl tracking-tight">Citizen Portal</span>
        </div>
        <div className="flex items-center gap-8">
          <Link href="/login" className="text-sm font-medium hover:text-accent transition-colors">Sign In</Link>
          <Link href="/signup" className="px-5 py-2 bg-primary hover:bg-primary-light rounded-full text-sm font-semibold transition-all">
            Register
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 blur-[150px] rounded-full -z-10"></div>
        
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-accent mb-8">
            <Globe className="w-3.5 h-3.5" />
            Official Platform for Citizen Services
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-[1.1]">
            Secure Identity. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400">Trusted Protection.</span>
          </h1>
          
          <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Access police services, report cases, and manage your electronic citizen ID through our secure, next-generation infrastructure.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-light rounded-xl font-bold flex items-center justify-center gap-2 group transition-all">
              Create Secure Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all">
              Access My Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          <Feature icon={<Lock className="w-6 h-6 text-accent" />} title="Encrypted Vault" desc="Your data is protected by state-of-the-art encryption and federated auth." />
          <Feature icon={<CheckCircle className="w-6 h-6 text-accent" />} title="Verified Identity" desc="Secure verification process ensuring only authorized individuals gain access." />
          <Feature icon={<Shield className="w-6 h-6 text-accent" />} title="24/7 Monitoring" desc="Active security monitoring to ensure the integrity of citizen records." />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-slate-500 text-sm">© 2026 Federal Police Service. All rights reserved.</p>
          <div className="flex gap-8 text-sm text-slate-500">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
