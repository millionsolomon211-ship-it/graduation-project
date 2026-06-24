"use client";

import RotatingBackground from '@/components/RotatingBackground';
import VerifyEmailPending from '@/components/auth/VerifyEmailPending';

export default function VerifyEmailPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      backgroundColor: '#08101f',
    }}>
      <RotatingBackground />
      <VerifyEmailPending />
    </div>
  );
}
