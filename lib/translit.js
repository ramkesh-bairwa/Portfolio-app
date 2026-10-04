// Simple Hinglish → Devanagari converter, used when the online service can't be reached.
const VOWELS = [['aa', 'आ', 'ा'], ['ai', 'ऐ', 'ै'], ['au', 'औ', 'ौ'], ['ee', 'ई', 'ी'], ['ii', 'ई', 'ी'], ['oo', 'ऊ', 'ू'], ['uu', 'ऊ', 'ू'], ['ri', 'ऋ', 'ृ'], ['a', 'अ', ''], ['i', 'इ', 'ि'], ['u', 'उ', 'ु'], ['e', 'ए', 'े'], ['o', 'ओ', 'ो']];
const CONS = [
  ['ksh', 'क्ष'], ['chh', 'छ'], ['shh', 'ष'], ['gy', 'ज्ञ'], ['tr', 'त्र'], ['kh', 'ख'], ['gh', 'घ'], ['ch', 'च'], ['jh', 'झ'], ['th', 'थ'], ['dh', 'ध'],
  ['ph', 'फ'], ['bh', 'भ'], ['sh', 'श'], ['k', 'क'], ['g', 'ग'], ['c', 'क'], ['j', 'ज'], ['t', 'त'], ['d', 'द'], ['n', 'न'], ['p', 'प'], ['f', 'फ'],
  ['b', 'ब'], ['m', 'म'], ['y', 'य'], ['r', 'र'], ['l', 'ल'], ['v', 'व'], ['w', 'व'], ['s', 'स'], ['h', 'ह'], ['z', 'ज़'], ['x', 'क्स'], ['q', 'क'],
];
const VIRAMA = '्';

export function hinglishToHindi(word) {
  const w = String(word).toLowerCase();
  let out = '';
  let i = 0;
  let afterCons = false;
  let prev = '';
  while (i < w.length) {
    const c = CONS.find(([k]) => w.startsWith(k, i));
    if (c) {
      // Join consonants only where Hindi usually does: before r/y/v, doubled letters, and after s / n (pr, ty, kk, st, nd)
      if (afterCons && (/^[ryvw]/.test(c[0]) || c[0] === prev || ['s', 'sh', 'n'].includes(prev))) out += VIRAMA;
      out += c[1];
      i += c[0].length;
      prev = c[0];
      afterCons = true;
      continue;
    }
    const v = VOWELS.find(([k]) => w.startsWith(k, i));
    if (v) {
      // a word-final "a" / "i" after a consonant is usually the long vowel in Hinglish (aapka → आपका, pani → पानी)
      const last = i + v[0].length === w.length && afterCons && w.length > 2;
      out += afterCons ? (last && v[0] === 'a' ? 'ा' : last && v[0] === 'i' ? 'ी' : v[2]) : v[1];
      i += v[0].length;
      afterCons = false;
      prev = '';
      continue;
    }
    out += w[i];
    i++;
    afterCons = false;
  }
  return out;
}
