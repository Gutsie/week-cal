// Shared settings for both tabs, persisted in localStorage.

export interface Day { name: string; color: string }

export interface Settings {
  font: string;
  days: Day[];
  calendar: {
    title: string;
    orientation: "landscape" | "portrait";
    fade: boolean;
    weekend: boolean;
  };
  cards: {
    list: string;
    paper: "A4" | "A3";
    size: number; // mm
    blanks: boolean;
  };
}

export const DEFAULTS: Settings = {
  font: "Fredoka",
  days: [
    // rainbow order: red, orange, yellow, green, blue, indigo, violet
    { name: "Måndag", color: "#ff6b6b" },
    { name: "Tisdag", color: "#ffa94d" },
    { name: "Onsdag", color: "#ffe066" },
    { name: "Torsdag", color: "#69db7c" },
    { name: "Fredag", color: "#4dabf7" },
    { name: "Lördag", color: "#748ffc" },
    { name: "Söndag", color: "#da77f2" },
  ],
  calendar: { title: "Min vecka", orientation: "landscape", fade: true, weekend: true },
  cards: {
    list: `🏫 Förskola x5
🛁 Bad x3
🪥 Borsta tänder x14
🛝 Lekpark x2
🌲 Skogen
🎉 Kalas
📚 Bibliotek
🛒 Handla
🍬 Lördagsgodis
🍕 Pizza
🎨 Måla
🎵 Musik
🩺 Doktorn
🦷 Tandläkare
🛋️ Mysa x2`,
    paper: "A4",
    size: 45,
    blanks: false,
  },
};

const KEY = "week-calendar:v1";
type Listener = (s: Settings) => void;
const listeners = new Set<Listener>();

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULTS);
    const saved = JSON.parse(raw) as Partial<Settings>;
    // shallow-merge each section so new settings get their defaults
    return {
      ...structuredClone(DEFAULTS),
      ...saved,
      calendar: { ...DEFAULTS.calendar, ...saved.calendar },
      cards: { ...DEFAULTS.cards, ...saved.cards },
      days: saved.days?.length === 7 ? saved.days : structuredClone(DEFAULTS.days),
    };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

let state = load();

export const getSettings = () => state;

export function update(fn: (s: Settings) => void) {
  fn(state);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode etc. */ }
  listeners.forEach(l => l(state));
}

export function reset() {
  update(s => Object.assign(s, structuredClone(DEFAULTS)));
}

export function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}
