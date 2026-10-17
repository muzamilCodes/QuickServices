import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'QuickServices - Verified Home Services in Kashmir';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0b192c 0%, #1e293b 100%)',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
        }}
      >
        {/* Top Header Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #0f62c9, #ff8a3d)',
              fontSize: '32px',
              fontWeight: 900,
              boxShadow: '0 8px 24px rgba(15, 98, 201, 0.4)',
            }}
          >
            Q
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-1px' }}>
              Quick<span style={{ color: '#60a5fa' }}>Services</span>
            </span>
            <span style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '3px' }}>
              Kashmir On-Demand Home Services
            </span>
          </div>
        </div>

        {/* Center Main Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '950px' }}>
          <h1
            style={{
              fontSize: '56px',
              fontWeight: 900,
              lineHeight: 1.15,
              margin: 0,
              background: 'linear-gradient(to right, #ffffff, #cbd5e1)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Verified Home Services & Instant Doorstep Repairs
          </h1>
          <p style={{ fontSize: '24px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
            Plumbing • Electrical • Appliance Repair • Deep Cleaning • 30-Min Fast Dispatch
          </p>
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            paddingTop: '32px',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 700, color: '#34d399' }}>
            <span>✓</span> 100% Verified Specialists
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 700, color: '#60a5fa' }}>
            <span>⚡</span> Real-time Live GPS Radar
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 700, color: '#fb923c' }}>
            <span>🛡️</span> Secure OTP Confirmation
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
