import "@fontsource/fredoka/600.css";
import "./style.css";
import { getSettings, update, reset, subscribe, type Settings } from "./store";
import { drawCalendar } from "./calendar";
import { renderCards } from "./cards";

const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const canvas = $<HTMLCanvasElement>("#calendar");
const cardsOut = $("#cards");

// ---------- Tabs (hash routing) ----------
type Tab = "kalender" | "kort";
const currentTab = (): Tab => (location.hash === "#kort" ? "kort" : "kalender");

function showTab() {
  const tab = currentTab();
  document.body.dataset.tab = tab;
  document.querySelectorAll<HTMLAnchorElement>("[data-tab-link]").forEach(a =>
    a.classList.toggle("active", a.dataset.tabLink === tab));
  setPageSize(getSettings());
}
window.addEventListener("hashchange", showTab);

function setPageSize(s: Settings) {
  const size = currentTab() === "kalender"
    ? `A3 ${s.calendar.orientation}`
    : `${s.cards.paper} portrait`;
  $("#page-size").textContent = `@page { size: ${size}; margin: 0; }`;
}

// ---------- Two-way binding: data-bind="calendar.title" etc. ----------
function getPath(obj: any, path: string) { return path.split(".").reduce((o, k) => o[k], obj); }
function setPath(obj: any, path: string, value: unknown) {
  const keys = path.split("."); const last = keys.pop()!;
  keys.reduce((o, k) => o[k], obj)[last] = value;
}

const bound = document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[data-bind]");
function fillInputs(s: Settings) {
  bound.forEach(el => {
    if (el === document.activeElement) return; // don't fight the user's typing
    const v = getPath(s, el.dataset.bind!);
    if (el instanceof HTMLInputElement && el.type === "checkbox") el.checked = v;
    else if (el.value !== String(v)) el.value = String(v);
  });
  // day rows
  s.days.forEach((d, i) => {
    const name = $<HTMLInputElement>(`#day-name-${i}`), color = $<HTMLInputElement>(`#day-color-${i}`);
    if (name.value !== d.name) name.value = d.name;
    if (color.value !== d.color) color.value = d.color;
  });
}
bound.forEach(el => el.addEventListener("input", () => {
  const path = el.dataset.bind!;
  const value = el instanceof HTMLInputElement && el.type === "checkbox" ? el.checked
    : el instanceof HTMLInputElement && el.type === "number" ? Number(el.value)
    : el.value;
  update(s => setPath(s, path, value));
}));

// Day name + colour rows (shared by both tabs)
$("#days").innerHTML = getSettings().days.map((_, i) =>
  `<div class="day"><input type="text" id="day-name-${i}"><input type="color" id="day-color-${i}"></div>`).join("");
getSettings().days.forEach((_, i) => {
  $(`#day-name-${i}`).addEventListener("input", e => update(s => { s.days[i].name = (e.target as HTMLInputElement).value; }));
  $(`#day-color-${i}`).addEventListener("input", e => update(s => { s.days[i].color = (e.target as HTMLInputElement).value; }));
});

// ---------- Render ----------
function render(s: Settings) {
  drawCalendar(canvas, s);
  $("#total").textContent = String(renderCards(cardsOut, s));
  setPageSize(s);
}
subscribe(render);
subscribe(fillInputs);

// ---------- Actions ----------
$("#download").addEventListener("click", () => {
  const a = document.createElement("a");
  a.download = "veckokalender-A3.png";
  a.href = canvas.toDataURL("image/png");
  a.click();
});
document.querySelectorAll(".print").forEach(b => b.addEventListener("click", () => window.print()));
$("#reset").addEventListener("click", () => {
  if (confirm("Återställa alla inställningar och kortlistan till standard?")) reset();
});

// ---------- Boot ----------
showTab();
fillInputs(getSettings());
render(getSettings());
// canvas text needs the web font loaded before it can use it
document.fonts.load("600 100px Fredoka").then(() => render(getSettings()));
