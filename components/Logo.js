import NextLink from 'next/link';

export default function Logo({ href = '/', light = false }) {
  return (
    <NextLink href={href} className={`flex items-center gap-2 font-display text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-signal text-white">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M6 4h12M6 4v16M6 12h8" />
        </svg>
      </span>
      folio
    </NextLink>
  );
}
