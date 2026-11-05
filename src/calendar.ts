import type { Settings } from "./store";
import { inkFor, shade } from "./color";

// A3 = 297 x 420 mm @ 300 dpi
const A3 = { short: 3508, long: 4961 };

export function drawCalendar(c: HTMLCanvasElement, s: Settings) {
  const ctx = c.getContext("2d")!;
  const land = s.calendar.orientation === "landscape";
  const W = land ? A3.long : A3.short, H = land ? A3.short : A3.long;
  c.width = W; c.height = H;
  const font = s.font;
  const u = W / 100; // layout unit

  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);

  const margin = 1.5 * u, gap = 0.8 * u; // 1.5u ≈ 6 mm, safe for most printers' unprintable edge
  let top = margin;

  const title = s.calendar.title.trim();
  if (title) {
    const th = land ? 4.2 * u : 5.5 * u;
    ctx.fillStyle = "#1d1d1d"; ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
    ctx.font = `600 ${th * 0.8}px ${font}`;
    ctx.fillText(title, margin, top + th * 0.8);
    top += th + 1.2 * u;
  }

  const wkGap = s.calendar.weekend ? 2.4 * u : 0; // extra space before Saturday
  const colW = (W - 2 * margin - 6 * gap - wkGap) / 7;
  const colH = H - top - margin;
  const headH = land ? 6 * u : 7.5 * u;
  const radius = 1.2 * u;

  // one shared label size: shrink until the longest label fits
  let fs = Math.min(4 * u, headH * 0.6);
  ctx.font = `600 ${fs}px ${font}`;
  const widest = () => Math.max(...s.days.map(d => ctx.measureText(d.name).width));
  while (widest() > colW * 0.78 && fs > 0.8 * u) { fs *= 0.95; ctx.font = `600 ${fs}px ${font}`; }

  s.days.forEach(({ name, color }, i) => {
    const x = margin + i * (colW + gap) + (i >= 5 ? wkGap : 0);

    if (i === 5 && wkGap) { // dotted divider between weekdays and weekend
      const dx = x - (gap + wkGap) / 2, r = 0.22 * u, step = 1.1 * u;
      ctx.fillStyle = "#c4c4c4";
      for (let y = top + r; y < top + colH; y += step) { ctx.beginPath(); ctx.arc(dx, y, r, 0, Math.PI * 2); ctx.fill(); }
    }

    ctx.beginPath(); ctx.roundRect(x, top, colW, colH, radius);
    if (s.calendar.fade) {
      // solid header colour, then a short fade into a pale tint
      const g = ctx.createLinearGradient(0, top, 0, top + colH);
      const h = headH / colH;
      g.addColorStop(0, color);
      g.addColorStop(h, color);
      g.addColorStop(h + (1 - h) * 0.12, shade(color, 0.65));
      g.addColorStop(1, shade(color, 0.72));
      ctx.fillStyle = g; ctx.fill();
    } else {
      ctx.fillStyle = shade(color, 0.65); ctx.fill();
      ctx.save(); ctx.clip();
      ctx.fillStyle = color; ctx.fillRect(x, top, colW, headH);
      ctx.restore();
    }

    ctx.fillStyle = inkFor(color); ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `600 ${fs}px ${font}`;
    ctx.fillText(name, x + colW / 2, top + headH / 2);
    ctx.textBaseline = "alphabetic";
  });
}
