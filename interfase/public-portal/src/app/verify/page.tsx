"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function VerifyPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // Simulate verification logic
    const timer = setTimeout(() => {
      setStatus('success'); // In a real app, you'd call the API gateway here
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-10 glass-card rounded-3xl z-10 mx-4 text-center"
      >
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
            {status === 'loading' && <Loader2 className="w-10 h-10 text-accent animate-spin" />}
            {status === 'success' && <CheckCircle className="w-10 h-10 text-green-500" />}
            {status === 'error' && <XCircle className="w-10 h-10 text-red-500" />}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          {status === 'loading' && 'Verifying Your Email'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </h1>
        
        <p className="text-slate-400 mb-8">
          {status === 'loading' && 'We are synchronizing your credentials with our secure vault...'}
          {status === 'success' && 'Your account is now fully active. You can proceed to your dashboard.'}
          {status === 'error' && 'The verification link might be expired or invalid. Please request a new one.'}
        </p>

        {status === 'success' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Link href="/login" className="btn-primary inline-block w-full">
              Proceed to Login
            </Link>
          </motion.div>
        )}

        {status === 'error' && (
          <Link href="/signup" className="text-accent underline">
            Back to Registry
          </Link>
        )}
      </motion.div>
    </div>
  );
}
