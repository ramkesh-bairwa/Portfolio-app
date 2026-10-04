import NextLink from 'next/link';
import Logo from './Logo';

export default function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-10">
        <Logo light />
        <nav className="flex flex-wrap gap-5 text-sm text-white/70" aria-label="Footer">
          <NextLink href="/portfolios" className="hover:text-white">Portfolios</NextLink>
          <NextLink href="/resume" className="hover:text-white">Resumes</NextLink>
          <NextLink href="/posters" className="hover:text-white">Posters</NextLink>
          <NextLink href="/plans" className="hover:text-white">Plans</NextLink>
        </nav>
        <p className="text-sm text-white/50">© {new Date().getFullYear()} Folio</p>
      </div>
    </footer>
  );
}
