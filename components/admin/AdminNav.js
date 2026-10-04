'use client';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Crown, Globe, LayoutDashboard, LayoutTemplate, LogOut, Settings, Users, ExternalLink } from 'lucide-react';
import Logo from '../Logo';

const LINKS = [
  ['/admin', 'Overview', LayoutDashboard],
  ['/admin/users', 'Users', Users],
  ['/admin/portfolios', 'Portfolios', Globe],
  ['/admin/requests', 'Premium requests', Crown],
  ['/admin/templates', 'Templates', LayoutTemplate],
  ['/admin/settings', 'Settings', Settings],
];

export default function AdminNav({ name }) {
  const path = usePathname();
  const router = useRouter();
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }
  return (
    <aside className="border-b border-white/10 bg-ink text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-b-0">
      <div className="flex items-center justify-between px-5 py-4 lg:py-6">
        <Logo href="/admin" light />
        <span className="chip bg-white/10 text-white/80">Admin</span>
      </div>
      <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible">
        {LINKS.map(([href, label, Icon]) => {
          const active = href === '/admin' ? path === '/admin' : path.startsWith(href);
          return (
            <NextLink key={href} href={href} className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold ${active ? 'bg-white text-ink' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <Icon size={17} /> {label}
            </NextLink>
          );
        })}
        <NextLink href="/" className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white">
          <ExternalLink size={17} /> View site
        </NextLink>
      </nav>
      <div className="hidden items-center justify-between border-t border-white/10 px-5 py-4 text-sm lg:flex">
        <span className="truncate text-white/70">{name}</span>
        <button onClick={logout} className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Log out"><LogOut size={16} /></button>
      </div>
    </aside>
  );
}
