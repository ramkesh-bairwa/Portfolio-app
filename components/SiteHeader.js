'use client';
import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Crown, LogOut, Menu, X } from 'lucide-react';
import Logo from './Logo';

const LINKS = [
  ['/portfolios', 'Portfolios'],
  ['/resume', 'Resumes'],
  ['/posters', 'Posters'],
  ['/plans', 'Plans'],
];

export default function SiteHeader() {
  const [user, setUser] = useState(undefined);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const path = usePathname() || '/';
  const active = (href) => path === href || path.startsWith(href + '/');
  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setUser(d.user)).catch(() => setUser(null));
  }, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2">
          {LINKS.map(([href, label]) => (
            <NextLink key={href} href={href} aria-current={active(href) ? 'page' : undefined} className={`btn-ghost hidden md:inline-flex ${active(href) ? 'bg-ink/5 text-ink' : ''}`}>{label}</NextLink>
          ))}
          <button className="btn-ghost px-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? <X size={18} /> : <Menu size={18} />}</button>
          {user === undefined ? null : user ? (
            <>
              {user.role === 'admin' && <NextLink href="/admin" className="btn-ghost">Admin</NextLink>}
              <NextLink href="/dashboard" className="btn-ghost">Dashboard</NextLink>
              {user.canPublish && <span className="chip hidden bg-sun/20 text-ink sm:inline-flex"><Crown size={12} /> Premium</span>}
              <button onClick={logout} className="btn-ghost" aria-label="Log out"><LogOut size={16} /></button>
            </>
          ) : (
            <>
              <NextLink href="/login" className="btn-ghost">Log in</NextLink>
              <NextLink href="/register" className="btn-primary">Sign up free</NextLink>
            </>
          )}
        </nav>
      </div>
      {open && (
        <nav className="border-t border-line bg-paper px-5 py-3 md:hidden" aria-label="Main">
          {LINKS.map(([href, label]) => (
            <NextLink key={href} href={href} onClick={() => setOpen(false)} aria-current={active(href) ? 'page' : undefined} className={`block rounded-lg px-3 py-2.5 font-semibold ${active(href) ? 'bg-ink/5 text-ink' : 'text-mute'}`}>{label}</NextLink>
          ))}
        </nav>
      )}
    </header>
  );
}
