import type { Settings } from "./store";

const PAPER = { A4: [210, 297], A3: [297, 420] } as const;
const MARGIN = 8, GAP = 3; // mm

export interface Card { icon: string; word: string; blank?: boolean }

/** One line per card: "<emoji> <word>", optional trailing "x5" for copies. */
export function parseCards(list: string): Card[] {
  return list.split("\n").map(l => l.trim()).filter(Boolean).flatMap(line => {
    let n = 1;
    const m = line.match(/\s+[x×](\d+)$/i);
    if (m) { n = Math.min(50, +m[1]); line = line.slice(0, m.index); }
    const i = line.indexOf(" ");
    const card = i < 0 ? { icon: line, word: "" } : { icon: line.slice(0, i), word: line.slice(i + 1).trim() };
    return Array.from({ length: n }, () => card);
  });
}

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

export function renderCards(out: HTMLElement, s: Settings): number {
  const { paper, blanks } = s.cards;
  const [pw, ph] = PAPER[paper];
  const size = Math.min(80, Math.max(25, s.cards.size || 45));

  const cols = Math.floor((pw - 2 * MARGIN + GAP) / (size + GAP));
  const rows = Math.floor((ph - 2 * MARGIN + GAP) / (size + GAP));
  const perPage = Math.max(1, cols * rows);

  const cards = parseCards(s.cards.list);
  const total = cards.length;
  if (blanks) {
    const rem = (perPage - (cards.length % perPage)) % perPage;
    for (let i = 0; i < rem; i++) cards.push({ icon: "", word: "", blank: true });
  }

  out.style.setProperty("--card", `${size}mm`);
  out.style.setProperty("--card-font", s.font);
  let html = "";
  for (let p = 0; p < Math.max(1, cards.length); p += perPage) {
    html += `<div class="sheet" style="width:${pw}mm;height:${ph}mm">` +
      cards.slice(p, p + perPage).map(c =>
        `<div class="card${c.blank ? " blank" : ""}"><div class="icon">${esc(c.icon) || "·"}</div><div class="word">${esc(c.word)}</div></div>`
      ).join("") + `</div>`;
  }
  out.innerHTML = html;
  return total;
}
