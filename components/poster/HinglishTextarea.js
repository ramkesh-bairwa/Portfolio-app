'use client';
// Textarea that turns Hinglish into Hindi as you type: "janmdin " → "जन्मदिन ".
// After each conversion a small bar offers other spellings and the original English word; Backspace right away undoes it.
import { createContext, forwardRef, useContext, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

// { on, toggle }: on = Hindi typing, off = English
export const HindiTypingContext = createContext({ on: false, toggle: null });

// English ⟷ हिंदी switch. mousedown is cancelled so the text box keeps focus while you flip it.
export function TypingSwitch({ on, toggle, compact = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Hindi typing"
      title="Hindi typing on/off (Ctrl/⌘ + Shift + H)"
      onMouseDown={(e) => e.preventDefault()}
      onClick={toggle}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-1.5 py-1 text-xs font-semibold ${on ? 'border-signal/40 bg-signal-soft' : 'border-line bg-white'}`}
    >
      <span className={on ? 'text-mute' : 'text-ink'}>{compact ? 'EN' : 'English'}</span>
      <span className={`relative h-4 w-7 rounded-full transition-colors ${on ? 'bg-signal' : 'bg-line'}`}>
        <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all ${on ? 'left-3.5' : 'left-0.5'}`} />
      </span>
      <span className={on ? 'text-ink' : 'text-mute'}>हिंदी</span>
    </button>
  );
}

const cache = new Map();
export async function suggestHindi(word) {
  const key = word.toLowerCase();
  if (cache.has(key)) return cache.get(key);
  const p = fetch(`/api/transliterate?text=${encodeURIComponent(key)}`).then((r) => r.json()).then((j) => j.suggestions || []).catch(() => []);
  cache.set(key, p);
  return p;
}

const BREAK = /^[\s.,!?;:।)\]"'-]$/;

const HinglishTextarea = forwardRef(function HinglishTextarea({ value, onChange, onKeyDown, onBlur, onFocus, enabled: forced, barClassName = '', ...rest }, outerRef) {
  const ctx = useContext(HindiTypingContext);
  const enabled = forced ?? ctx.on;
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);
  const valueRef = useRef(value);
  const [last, setLast] = useState(null); // { start, end, original, options }
  valueRef.current = value;
  useImperativeHandle(outerRef, () => ref.current);
  useEffect(() => { if (!enabled) setLast(null); }, [enabled]);

  // Put the caret back right after React writes the new text (before the next key press is handled)
  const pendingCaret = useRef(null);
  useLayoutEffect(() => {
    const c = pendingCaret.current;
    pendingCaret.current = null;
    if (c != null && ref.current && document.activeElement === ref.current) ref.current.setSelectionRange(c, c);
  }, [value]);
  const put = (next, caret) => {
    pendingCaret.current = caret;
    onChange(next);
  };
  // the live text box is the truth: keys typed while a lookup was running are already in it
  const live = () => (ref.current ? ref.current.value : valueRef.current);

  // Convert the English word that ends at `end`
  async function convertBefore(end) {
    const text = live();
    const m = /[A-Za-z]+$/.exec(text.slice(0, end));
    if (!m) return;
    const start = end - m[0].length;
    const word = m[0];
    const options = await suggestHindi(word);
    if (!options.length) return;
    const now = live();
    if (now.slice(start, start + word.length) !== word || /[A-Za-z]/.test(now[start + word.length] || '')) return; // text changed meanwhile
    const caretWas = ref.current && document.activeElement === ref.current ? ref.current.selectionStart : now.length;
    const next = now.slice(0, start) + options[0] + now.slice(start + word.length);
    const shift = options[0].length - word.length;
    put(next, caretWas >= start + word.length ? caretWas + shift : caretWas);
    setLast({ start, end: start + options[0].length, original: word, options });
  }

  function choose(text) {
    if (!last) return;
    const now = live();
    const next = now.slice(0, last.start) + text + now.slice(last.end);
    put(next, last.start + text.length + (BREAK.test(now[last.end] || '') ? 1 : 0));
    setLast({ ...last, end: last.start + text.length });
    ref.current?.focus();
  }

  function handleKeyDown(e) {
    onKeyDown?.(e);
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'h' && ctx.toggle) {
      e.preventDefault();
      ctx.toggle();
      return;
    }
    if (!enabled || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    const el = e.currentTarget;
    // Backspace straight after a conversion gives the English word back
    const now = live();
    if (e.key === 'Backspace' && last && el.selectionStart === el.selectionEnd && (el.selectionStart === last.end || el.selectionStart === last.end + 1) && last.options.includes(now.slice(last.start, last.end))) {
      e.preventDefault();
      const cut = el.selectionStart; // drops the space typed after the word, like Google's Hindi keyboard
      put(now.slice(0, last.start) + last.original + now.slice(cut), last.start + last.original.length);
      setLast(null);
      return;
    }
    if (e.key === 'Escape' && last) { setLast(null); return; }
    if (e.key === 'Enter' || (e.key.length === 1 && BREAK.test(e.key))) {
      convertBefore(el.selectionStart);
    } else if (e.key.length === 1) setLast(null);
  }

  function handleBlur(e) {
    setFocused(false);
    if (enabled && /[A-Za-z]$/.test(valueRef.current)) convertBefore(valueRef.current.length);
    onBlur?.(e);
  }

  return (
    <>
      <textarea ref={ref} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={handleKeyDown} onBlur={handleBlur} onFocus={(e) => { setFocused(true); onFocus?.(e); }} lang={enabled ? 'hi' : undefined} {...rest} />
      {focused && ctx.toggle && (
        <div className={`flex flex-wrap items-center gap-1 rounded-lg border border-line bg-white p-1 text-sm shadow-lg ${barClassName}`} onMouseDown={(e) => e.preventDefault()} role="listbox" aria-label="Typing language and other spellings">
          <TypingSwitch on={enabled} toggle={ctx.toggle} compact />
          {enabled && last && <span className="mx-0.5 h-5 w-px bg-line" />}
          {enabled && last && last.options.map((o) => (
            <button key={o} type="button" role="option" aria-selected={valueRef.current.slice(last.start, last.end) === o} onClick={() => choose(o)} className={`rounded-md px-2 py-0.5 ${valueRef.current.slice(last.start, last.end) === o ? 'bg-signal-soft font-semibold' : 'hover:bg-paper'}`}>{o}</button>
          ))}
          {enabled && last && <button type="button" onClick={() => { choose(last.original); setLast(null); }} className="rounded-md px-2 py-0.5 text-mute hover:bg-paper" title="Keep the English word">{last.original}</button>}
          {!(enabled && last) && <span className="px-1 text-xs text-mute">{enabled ? 'Type in English letters, press space → हिंदी' : 'Typing in English'}</span>}
        </div>
      )}
    </>
  );
});

export default HinglishTextarea;
