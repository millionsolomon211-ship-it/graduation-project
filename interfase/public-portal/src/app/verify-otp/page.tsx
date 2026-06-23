"use client";

import RotatingBackground from '@/components/RotatingBackground';
import VerifyOtpForm from '@/components/auth/VerifyOtpForm';

export default function VerifyOtpPage() {
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
      <VerifyOtpForm />
    </div>
  );
}
