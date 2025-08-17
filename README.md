# Snake PWA

Replica del gioco Snake come web app PWA ottimizzata per dispositivi mobile. Stack: Vite + TypeScript + vite-plugin-pwa. Deploy pronto per Netlify.

## Requisiti
- Node 18+
- npm 9+

## Sviluppo
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy su Netlify
- Imposta il repository su Netlify
- Build command: `npm run build`
- Publish directory: `dist`

La PWA registra il Service Worker in modalità `autoUpdate` e supporta offline.
