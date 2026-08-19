---
name: verify-map
description: Avvia TerraScoperta e verifica visivamente la mappa — attiva un layer satellitare o i contorni dei ghiacciai, muovi lo slider anno, zooma su un'area e cattura uno screenshot. Usare quando una modifica riguarda la mappa, un overlay, il pannello layer o lo slider temporale, e serve vedere il risultato invece di limitarsi a compilare.
---

# Verificare la mappa a occhio

`tsc` e i test non dicono se un tile arriva davvero, se un contorno è visibile
sopra il satellite o se un pannello è leggibile. Per quello serve aprire l'app.

## 1. Dev server

```bash
npm run dev
```

**La porta non è fissa.** Vite ripiega su 5174, 5175… se la 5173 è occupata, e
capita spesso perché un server di una sessione precedente resta acceso. Leggi
sempre la riga `Local:` dall'output invece di dare per scontato 5173:

```bash
npm run dev > /tmp/vite.log 2>&1 &
sleep 6 && grep -o "http://localhost:[0-9]*" /tmp/vite.log | head -1
```

Il backend (`npm run server`) serve solo per canadair, hotspot FIRMS, webcam
vulcani e proxy tile Sentinel. Layer mare e ghiacciai vanno diretti al
provider, quindi per verificarli il backend non è necessario.

## 2. Pilotare il browser

**Prima scelta: Playwright MCP** (configurato in questo progetto, scope local).
Usa quello se i suoi strumenti sono disponibili nella sessione.

**Se non lo sono** (i server MCP si caricano all'avvio: appena configurato non
c'è finché non riavvii) e l'estensione Claude-in-Chrome non è connessa, il
ripiego è Chrome headless via CDP, che qui funziona:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --use-gl=swiftshader --enable-unsafe-swiftshader \
  --window-size=1400,900 --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-cdp about:blank &
```

`--use-gl=swiftshader` non è opzionale: la mappa è MapLibre/WebGL e senza
rendering software lo screenshot esce vuoto. Poi si parla CDP con il WebSocket
nativo di Node (nessuna dipendenza): `Page.navigate`, `Runtime.evaluate`,
`Page.captureScreenshot`.

Ricordati di chiudere: `pkill -f "remote-debugging-port=9222"`.

## 3. I selettori che servono

| elemento | selettore | note |
|---|---|---|
| layer satellitare | `#layer-select` | valori: `none`, `s2-true-color`, `s3-lst`, `sst-med`, … |
| contorni ghiacciai | `#glacier-select` | `none`, `compare`, `historic`, `recent` |
| slider anno | `#layer-year` | presente solo nei tab Calore e Acqua |
| data puntuale | `#layer-date` | negli altri tab, al posto dello slider |
| tab modulo | `button` con testo "Acqua", "Vulcani", … | |

## 4. Cambiare una `<select>` o uno slider in React

Assegnare `.value` non basta: React ascolta il proprio evento sintetico e
ignora l'assegnazione diretta. Va usato il setter nativo del prototipo e poi
dispatchato l'evento:

```js
const s = document.querySelector('#layer-select');
const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
setter.call(s, 'sst-med');
s.dispatchEvent(new Event('change', { bubbles: true }));
```

Per lo slider vale lo stesso con `HTMLInputElement` e gli eventi `input` **e**
`change` (lo slider anno è debounced: senza `change` il commit non parte).

## 5. Zoomare su un'area

Non c'è un'API esposta per spostare la mappa. Il modo che funziona è la rotella
via CDP sul punto d'interesse — MapLibre zooma centrando sul cursore, quindi
ripetendo sullo stesso pixel si converge lì:

```js
await send("Input.dispatchMouseEvent", { type: "mouseWheel", x: 140, y: 180, deltaX: 0, deltaY: -240 });
```

Circa 9-10 giri per passare dalla vista nazionale al dettaglio di un gruppo
alpino. Un `sleep` di ~1,1 s tra uno e l'altro, altrimenti i tile non stanno
dietro.

## 6. Attese

I tile esterni sono lenti e vanno attesi **prima** dello screenshot, o si
cattura una mappa mezza vuota e sembra un bug:

- caricamento iniziale della pagina: ~9 s
- cambio layer o epoca: ~9-12 s
- Sentinel Hub è il più lento (ricalcola ogni tile), Copernicus Marine e GLIMS
  rispondono più in fretta

## 7. Guarda lo screenshot

Uno screenshot non guardato non è una verifica. Cose che si scoprono solo
guardando, capitate davvero:

- una scritta senza spazio (`1982–2026dai dati`), invisibile al compilatore
- una legenda che dichiarava ciano mentre il layer rendeva verde
- due epoche di contorni indistinguibili perché disegnate nello stesso colore
- a scala nazionale i ghiacciai sono pochi pixel: serve zoomare o non si
  conclude nulla
