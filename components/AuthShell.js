import { BadgeCheck, FileText, Image as ImageIcon, LayoutTemplate } from 'lucide-react';
import Logo from './Logo';

const POINTS = [
  [LayoutTemplate, 'bg-signal', 'Portfolio website', 'Publish to your own link in one click'],
  [FileText, 'bg-mint', 'ATS-friendly resume', 'Live score and a clean PDF download'],
  [ImageIcon, 'bg-coral', 'Posters and posts', 'For print, Instagram and WhatsApp'],
];

export default function AuthShell({ title, subtitle, children }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <div className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-signal/50 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-coral/30 blur-3xl" aria-hidden="true" />
        <div className="relative"><Logo light /></div>
        <div className="relative">
          <p className="max-w-md font-display text-4xl font-bold leading-tight">
            Your work deserves a better link than a PDF and Docs
          </p>
          <ul className="mt-10 max-w-md space-y-3">
            {POINTS.map(([Icon, bg, head, text]) => (
              <li key={head} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${bg} text-white`}><Icon size={20} /></span>
                <span>
                  <span className="block font-semibold">{head}</span>
                  <span className="text-sm text-white/60">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative flex items-center gap-2 text-sm text-white/60"><BadgeCheck size={16} className="text-sun" /> Free to start · no card needed</p>
      </div>
      <div className="relative flex items-center justify-center bg-[radial-gradient(50%_40%_at_100%_0%,#ECEAFF_0%,transparent_70%)] p-5 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <div className="rounded-3xl border border-line bg-white p-6 shadow-xl shadow-ink/5 sm:p-8">
            <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-2 text-mute">{subtitle}</p>}
            <div className="mt-7">{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
