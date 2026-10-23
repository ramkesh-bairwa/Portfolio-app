// The wording of a wedding card. People fill this once in the card studio and every design shows it.
// Kept in localStorage so the editor builds the chosen card with the same details.

export const DETAILS_KEY = 'folio_shaadi_details_v1';

export const SAMPLE = {
  hi: {
    lang: 'hi',
    invoke: '॥ श्री गणेशाय नमः ॥',
    shloka: 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
    title: 'मंगल परिणय',
    programTitle: 'मांगलिक कार्यक्रम',
    groom: { pre: 'चि०', name: 'मोहित यादव', parents: 'सुपुत्र श्रीमती सुनीता देवी एवं श्री राजेश यादव', place: 'ग्राम मानपुरा, जिला राजगढ़ (म.प्र.)' },
    bride: { pre: 'आयु०', name: 'ज्योति यादव', parents: 'सुपुत्री श्रीमती रेखा देवी एवं श्री रामलाल यादव', place: 'ग्राम झाड़क्या, जिला राजगढ़ (म.प्र.)' },
    side: 'groom',
    date: 'शनिवार, 12 दिसम्बर 2026',
    shortDate: '12 . 12 . 2026',
    events: [
      { name: 'हल्दी', date: '10 दिसम्बर 2026, गुरुवार', time: 'सायं 4 बजे से' },
      { name: 'मातृपूजन', date: '11 दिसम्बर 2026, शुक्रवार', time: 'प्रातः 10 बजे से' },
      { name: 'शुभ विवाह', date: '12 दिसम्बर 2026, शनिवार', time: 'रात्रि 9 बजे' },
      { name: 'शुभ विदाई', date: '13 दिसम्बर 2026, रविवार', time: 'प्रातः 6 बजे' },
    ],
    venue: 'निज निवास, ग्राम मानपुरा गुजराती, तहसील नरसिंहगढ़, जिला राजगढ़ (म.प्र.)',
    baraat: 'बारात दिनांक 12 दिसम्बर को सायं 5 बजे निज निवास से प्रस्थान करेगी।',
    kidsTitle: 'बाल मनुहार',
    kids: 'हल्दी है, चन्दन है, रिश्तों का बन्धन है,\nमेरे चाचू की शादी में आपका हार्दिक अभिनन्दन है।',
    kidsNames: 'अमन, आयुष, कार्तिक, परी',
    darshan: 'देवेश यादव, अजय यादव, प्रशान्त यादव,\nयश यादव एवं समस्त यादव परिवार',
    swagat: 'रामकेश, विशाल, दुर्गेश, अनिल',
    vineet: 'राजेश कुमार यादव',
    vineetPlace: 'ग्राम मानपुरा, जिला राजगढ़ (म.प्र.)',
    phone: '98765 43210',
    family: 'यादव परिवार',
    reception: 'आशीर्वाद समारोह एवं स्वरुचि भोज',
    receptionWhen: '12 दिसम्बर 2026, सायं 7 बजे से',
    receptionWhere: 'होटल ग्रैंड पैलेस, ए.बी. रोड, राजगढ़',
    map: 'https://maps.google.com/?q=Rajgarh+Madhya+Pradesh',
  },
  en: {
    lang: 'en',
    invoke: '|| Shri Ganeshaya Namah ||',
    shloka: 'Vakratunda Mahakaya Suryakoti Samaprabha · Nirvighnam Kuru Me Deva Sarva-Karyeshu Sarvada',
    title: 'Shubh Vivah',
    programTitle: 'Wedding Festivities',
    groom: { pre: 'Chi.', name: 'Mohit Yadav', parents: 'S/o Smt. Sunita Devi & Shri Rajesh Yadav', place: 'Manpura, Rajgarh (M.P.)' },
    bride: { pre: 'Sau. Kan.', name: 'Jyoti Yadav', parents: 'D/o Smt. Rekha Devi & Shri Ramlal Yadav', place: 'Jhadkya, Rajgarh (M.P.)' },
    side: 'groom',
    date: 'Saturday, 12 December 2026',
    shortDate: '12 . 12 . 2026',
    events: [
      { name: 'Haldi', date: 'Thu, 10 Dec 2026', time: '4:00 PM onwards' },
      { name: 'Mehndi & Sangeet', date: 'Fri, 11 Dec 2026', time: '7:00 PM onwards' },
      { name: 'Wedding', date: 'Sat, 12 Dec 2026', time: 'Pheras at 9:00 PM' },
      { name: 'Vidaai', date: 'Sun, 13 Dec 2026', time: '6:00 AM' },
    ],
    venue: 'Our residence, Manpura Gujarati, Narsinghgarh, Rajgarh (M.P.)',
    baraat: 'The baraat leaves our residence at 5:00 PM on 12 December.',
    kidsTitle: 'Kids’ request',
    kids: 'Haldi, chandan and a bond so sweet —\ncome to our chachu’s wedding, it won’t be complete without you!',
    kidsNames: 'Aman, Ayush, Kartik, Pari',
    darshan: 'Devesh, Ajay, Prashant, Yash\n& the entire Yadav family',
    swagat: 'Ramkesh, Vishal, Durgesh, Anil',
    vineet: 'Rajesh Kumar Yadav',
    vineetPlace: 'Manpura, Rajgarh (M.P.)',
    phone: '+91 98765 43210',
    family: 'The Yadav Family',
    reception: 'Reception & Dinner',
    receptionWhen: 'Saturday, 12 December 2026 · 7:00 PM onwards',
    receptionWhere: 'Hotel Grand Palace, A.B. Road, Rajgarh',
    map: 'https://maps.google.com/?q=Rajgarh+Madhya+Pradesh',
  },
};

// Fixed words printed on the card in each language
export const WORDS = {
  hi: {
    dear: 'सम्मानित स्नेही स्वजन,', blessing: 'परमपिता परमेश्वर की असीम अनुकम्पा से', ourSon: 'हमारे सुपुत्र', ourDaughter: 'हमारी सुपुत्री',
    sang: 'संग', parinay: 'के शुभ पाणिग्रहण संस्कार', parinayShort: 'परिणय',
    outro: 'की पावन वेला पर पधार कर नवयुगल को अपने स्नेहिल आशीर्वाद से अभिसिंचित करने हेतु आप सपरिवार सादर आमंत्रित हैं। हमारे उत्सुक नयन आपके स्वागत हेतु प्रतीक्षारत रहेंगे।',
    darshan: 'दर्शनाभिलाषी', swagat: 'स्वागतकर्ता', vineet: 'विनीत', to: 'प्रतिष्ठार्थ,', sriman: 'श्रीमान / श्रीमती', from: 'प्रेषक :',
    invite: 'का स्नेहिल आमंत्रण', venue: 'विवाह स्थल', phone: 'मो०', note: 'विशेष आग्रह : कृपया इसी पत्रिका को व्यक्तिगत निमंत्रण मानकर पधारें।',
    scan: 'स्थान देखने के लिए स्कैन करें', date: 'दिनांक', vaivahik: 'वैवाहिक कार्यक्रम', shubh: 'शुभ विवाह',
  },
  en: {
    dear: 'Dear family & friends,', blessing: 'With the blessings of the Almighty,', ourSon: 'we invite you to the wedding of our son', ourDaughter: 'we invite you to the wedding of our daughter',
    sang: 'with', parinay: 'Wedding Ceremony', parinayShort: 'Parinay',
    outro: 'Your gracious presence and blessings for the couple will make the occasion truly special. We look forward to welcoming you with your family.',
    darshan: 'Eagerly awaiting', swagat: 'Welcome by', vineet: 'With regards', to: 'To,', sriman: 'Mr. / Mrs.', from: 'From :',
    invite: 'warmly invites you', venue: 'Venue', phone: 'Mob.', note: 'Kindly treat this card as a personal invitation.',
    scan: 'Scan for location', date: 'Date', vaivahik: 'Wedding Programme', shubh: 'Shubh Vivah',
  },
};

// Saved details merged over the sample, so new fields always have a value
export function loadDetails(lang = 'hi') {
  const base = SAMPLE[lang === 'en' ? 'en' : 'hi'];
  if (typeof window === 'undefined') return base;
  try {
    const saved = JSON.parse(localStorage.getItem(DETAILS_KEY) || 'null');
    if (!saved || saved.lang !== base.lang) return base;
    return { ...base, ...saved, groom: { ...base.groom, ...saved.groom }, bride: { ...base.bride, ...saved.bride }, events: Array.isArray(saved.events) && saved.events.length ? saved.events : base.events };
  } catch { return base; }
}

export function saveDetails(d) {
  try { localStorage.setItem(DETAILS_KEY, JSON.stringify(d)); } catch { /* storage unavailable */ }
}
