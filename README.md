# Veckokalender

A printable A3 weekly calendar and matching activity cards, made for a 4-year-old.
Built with Vite and TypeScript, with no framework.

- **Kalender**: seven colour-coded day columns. Download as a 300 dpi PNG or print as an A3 PDF.
- **Kort**: emoji activity cards to cut out, with a count per line (`🪥 Borsta tänder x14`).
- **Gemensamt**: the font and the day names and colours are shared by both tabs, and settings are saved in the browser.

## Develop

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

1. Push this folder as the root of a GitHub repo, on the `main` branch.
2. In the repo, go to **Settings → Pages → Source** and pick **GitHub Actions**.
3. Each push to `main` then builds and deploys via `.github/workflows/deploy.yml`.

Asset paths are relative (`base: "./"`), so it works at `https://<user>.github.io/<repo>/` with no config.

## Printing tips

Set the scale to 100% and turn off headers and footers in the print dialog.
