import { C } from '@/lib/theme';

export function Spinner({ message }: { message: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', background: C.orangeDim, borderRadius: 8, border: `1px solid #D9775730` }}>
      <div style={{ width: 13, height: 13, border: `2px solid ${C.orange}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: C.orangeText, fontWeight: 500 }}>{message}</span>
    </div>
  );
}
