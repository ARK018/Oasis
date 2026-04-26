'use client';

import { usePathname, useRouter } from 'next/navigation';
import { C } from '@/lib/theme';
import { Icon } from './icons';
import { StorageBar } from './storage-bar';
import { useStore } from '@/lib/store';

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { usedMB } = useStore();

  const isSubjectsActive = pathname === '/' || pathname.startsWith('/subjects');
  const isLibraryActive = pathname === '/library';

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: C.nav, borderBottom: `1px solid ${C.border}`, height: 54, display: 'flex', alignItems: 'center', padding: '0 24px' }}>
      <div onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', userSelect: 'none', flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #D97757 0%, #C0623E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #D9775530' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="2"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        </div>
        <span style={{ fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: '-0.3px' }}>CrackIt</span>
      </div>

      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 2 }}>
        {[
          { label: 'Subjects', icon: 'book' as const, href: '/', active: isSubjectsActive },
          { label: 'Library', icon: 'folder' as const, href: '/library', active: isLibraryActive },
        ].map(({ label, icon, href, active }) => (
          <button key={href} onClick={() => router.push(href)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 7, border: 'none', background: active ? C.orangeDim : 'transparent', color: active ? C.orangeText : C.textSec, fontSize: 13, fontWeight: active ? 600 : 500, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = C.bg; e.currentTarget.style.color = C.text; }}}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.textSec; }}}
          >
            <Icon name={icon} size={14} color={active ? C.orange : C.textSec} />
            {label}
          </button>
        ))}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <StorageBar usedMB={usedMB} />
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #D97757, #B85E3C)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px #D9775530', flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>AS</span>
        </div>
      </div>
    </nav>
  );
}
