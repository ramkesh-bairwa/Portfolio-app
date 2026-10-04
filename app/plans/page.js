import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import Plans from '@/components/home/Plans';

export const metadata = { title: 'Plans — Folio', description: 'Start free. Go Premium to publish portfolios and download resumes and posters.' };

const FAQ = [
  ['Is Folio free?', 'Yes. You can build, edit and preview portfolios, resumes and posters for free, and use every free template.'],
  ['What does Premium unlock?', 'Publishing your portfolio to a live link, downloading resume PDFs and posters, and all premium templates — including the 50 Top Ranking resume designs.'],
  ['How do I get Premium?', 'Press “Ask for premium” on this page or in your dashboard. An admin reviews the request and turns on premium for your account.'],
  ['Will I lose my work if I stay on Free?', 'No. Everything you make is saved to your dashboard, and you can upgrade any time.'],
];

export default function PlansPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-5xl px-5 pb-16 pt-14">
          <div className="mb-10 text-center">
            <p className="chip bg-sun/25 text-ink">Plans</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">Start free. Go Premium when you’re ready.</h1>
            <p className="mx-auto mt-3 max-w-xl text-mute">Build and preview everything for free. Premium unlocks publishing, downloads and the premium templates.</p>
          </div>
          <Plans />
        </section>
        <section className="border-t border-line bg-white">
          <div className="mx-auto max-w-3xl px-5 py-14">
            <h2 className="mb-6 text-2xl font-extrabold tracking-tight">Questions</h2>
            <div className="divide-y divide-line rounded-2xl border border-line bg-white">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group px-5 py-4">
                  <summary className="cursor-pointer list-none font-semibold marker:hidden">{q}</summary>
                  <p className="mt-2 text-mute">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
