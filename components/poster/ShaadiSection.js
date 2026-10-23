import NextLink from 'next/link';
import { Download, Languages, PenLine, Sparkles } from 'lucide-react';
import ShaadiStudio, { HeroCards } from './ShaadiStudio';
import { SHAADI_DESIGNS } from '@/lib/poster/shaadi';

// Wedding card studio as a section of the posters page: header with sample cards, then the studio
const STEPS = [
  ['1', 'विवरण भरें', 'वर-वधू, कार्यक्रम, परिवार — एक बार'],
  ['2', 'डिज़ाइन चुनें', 'हर कार्ड आपके नाम के साथ दिखेगा'],
  ['3', 'एडिट और डाउनलोड', 'हर शब्द बदलें, प्रिंट-रेडी PDF'],
];

export default function ShaadiSection() {
  return (
    <div className="bg-[#FBF6EE]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3B0A12] via-[#5A1020] to-[#7A1F1F] text-white">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#E8A33D]/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-40 left-10 h-96 w-96 rounded-full bg-[#C2410C]/25 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/40 bg-white/5 px-3 py-1 text-sm font-semibold text-[#F7D9A0]"><Sparkles size={14} /> शादी कार्ड स्टूडियो</p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.15] sm:text-5xl" style={{ fontFamily: "'Rozha One', serif" }}>आपकी शादी का कार्ड,<br /><span className="text-[#F2C46D]">आपके नाम के साथ।</span></h1>
            <p className="mt-4 max-w-xl text-lg text-white/75">
              {SHAADI_DESIGNS.length} डिज़ाइन — प्रिंटिंग-प्रेस वाली कुमकुम पत्रिका और फोटो वाले रंगीन कार्ड। एक पेज से चार पेज तक, हिंदी या English में।
            </p>
            <ol className="mt-7 grid gap-3 sm:grid-cols-3">
              {STEPS.map(([n, t, s]) => (
                <li key={n} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#E8A33D] text-sm font-extrabold text-[#2A0F0A]">{n}</span>
                  <p className="mt-2 font-bold">{t}</p>
                  <p className="text-xs text-white/60">{s}</p>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-wrap gap-5 text-sm text-white/70">
              <span className="flex items-center gap-2"><Languages size={16} className="text-[#F2C46D]" /> Hinglish से हिंदी टाइपिंग</span>
              <span className="flex items-center gap-2"><PenLine size={16} className="text-[#F2C46D]" /> हर शब्द, रंग और फोटो एडिट करें</span>
              <span className="flex items-center gap-2"><Download size={16} className="text-[#F2C46D]" /> सभी पेज एक PDF में</span>
            </div>
          </div>
          <HeroCards />
        </div>
      </section>
      <section id="studio" className="mx-auto max-w-[1500px] px-5 py-10">
        <ShaadiStudio />
        <p className="mt-14 text-center text-sm text-mute">और स्टाइल चाहिए? <NextLink href="/cards?legacy=1" className="font-semibold text-signal">पुराने रंगीन डिज़ाइन देखें →</NextLink></p>
      </section>
    </div>
  );
}
