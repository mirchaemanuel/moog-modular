# Patch Cables Visivi — Design Spec

## Obiettivo

Aggiungere patch cables visivi al sintetizzatore: cavi decorativi per il signal flow fisso e cavi draggabili per le destinazioni LFO. L'audio engine non viene modificato.

## Cavi decorativi (signal flow fisso)

Cavi sempre visibili sul `<canvas id="patch-canvas">` (gia presente come overlay full-screen con `pointer-events: none`). Mostrano il routing audio fisso:

- VCO1 → Mixer
- VCO2 → Mixer
- VCO3 → Mixer
- Noise → Mixer
- Mixer → Filter
- Filter → VCA (Amp Envelope)
- VCA → Effects
- Effects → Scope/Output

Aspetto: catenarie giallo/arancio semi-trasparenti, spessore 2-3px, glow leggero. Si ricalcolano al resize della finestra leggendo la posizione dei moduli nel DOM.

## Cavi LFO draggabili (semi-funzionali)

### Patch points

Ogni LFO ha un **patch point di output** (cerchietto colorato sotto il modulo). Le destinazioni hanno **patch points di input** su:

- VCO1, VCO2, VCO3 — modulazione pitch
- Filter — modulazione cutoff
- VCA (Amp Envelope) — modulazione ampiezza

I patch points sono `<div class="patch-point">` con attributi `data-type="output|input"`, `data-module="lfo1|vco1|filter|..."`, `data-param="pitch|filter|amp"`.

### Interazione desktop (drag)

1. Mousedown su patch point output LFO → inizia drag
2. Cavo catenaria segue il cursore dal punto di partenza
3. Mouseup su patch point input valido → connessione stabilita
4. Mouseup altrove → cavo annullato
5. Click su un cavo esistente → rimuove la connessione

### Interazione mobile (tap-tap)

1. Tap su patch point output LFO → si illumina (stato "attivo")
2. Tap su patch point input valido → connessione stabilita
3. Tap altrove → annulla selezione
4. Tap su cavo esistente → rimuove la connessione

### Sincronizzazione con dropdown

- Connessione via cavo → aggiorna il dropdown LFO alla destinazione corrispondente
- Cambio dropdown → aggiorna/sposta il cavo visivo
- Bidirezionale, sempre in sync

## Aspetto visivo

### Catenaria

Curva parametrica che simula un cavo con gravita: `y = a * cosh((x - x0) / a)` tra due punti, con pendenza proporzionale alla distanza tra i punti. Approssimazione con curva Bezier quadratica il cui punto di controllo e spostato verso il basso.

### Colori

| Tipo | Colore | Uso |
|------|--------|-----|
| Audio (fisso) | `#ffa500` giallo/arancio, opacity 0.4 | Signal flow decorativo |
| LFO 1 | `#00ffff` ciano | Cavi modulazione LFO1 |
| LFO 2 | `#ff00ff` magenta | Cavi modulazione LFO2 |

### Stile

- Spessore: 3px per cavi LFO, 2px per cavi decorativi
- Glow: `shadowBlur` 4-6px, stesso colore del cavo
- Patch points: cerchio 16px, bordo colorato 2px, sfondo scuro, glow al hover/attivo

## Architettura

### Nuovo file: `js/ui/patch-cables.js`

Responsabilita:
- Rendering di tutti i cavi (decorativi + LFO) sul canvas
- Calcolo posizioni patch points dal DOM
- Gestione drag (desktop) e tap-tap (mobile)
- Hit detection per click/tap su cavi esistenti
- Stato delle connessioni LFO (`{ lfo1: 'pitch', lfo2: 'filter' }`)
- ResizeObserver per ricalcolare posizioni al resize
- Funzione `syncFromDropdown(lfoNum, dest)` chiamata quando il dropdown cambia
- Funzione `syncToDropdown(lfoNum, dest)` che aggiorna il dropdown quando un cavo viene connesso

### Modifiche a file esistenti

**`index.html`**: aggiungere `<div class="patch-point">` con attributi data dentro i moduli VCO, Mixer, Filter, Amp Envelope, LFO1, LFO2, Effects, Master.

**`js/ui/wave-selectors.js`**: al cambio dropdown LFO destinazione, chiamare `syncFromDropdown()` di patch-cables.

**`js/app.js`**: importare e chiamare `initPatchCables()` nel init.

**`css/styles.css`**: stili per `.patch-point`, `.patch-point:hover`, `.patch-point.active`, `.patch-point.connected`.

### Cosa NON cambia

- Audio engine (`voice-manager.js`, `audio-context.js`, `parameters.js`) resta identico
- Il signal flow fisso non e modificabile dall'utente
- I cavi LFO cambiano solo il valore della destinazione (equivalente al dropdown)
- I preset continuano a funzionare come prima (salvano/caricano `lfo.dest`)

## Flusso dati

```
[Drag cavo LFO1 → Filter]
  → patch-cables.js: setConnection('lfo1', 'filter')
  → patch-cables.js: syncToDropdown(1, 'filter')
    → dropdown LFO1 .value = 'filter'
    → dispatch 'change' event
      → wave-selectors.js: state.lfo1.dest = 'filter'

[Dropdown LFO1 cambiato a 'amp']
  → wave-selectors.js: state.lfo1.dest = 'amp'
  → wave-selectors.js: syncFromDropdown(1, 'amp')
    → patch-cables.js: setConnection('lfo1', 'amp')
    → ridisegna cavo
```

## Edge cases

- **Resize finestra**: ResizeObserver ricalcola tutte le posizioni e ridisegna
- **Mobile 2-colonne**: le posizioni cambiano, i cavi si adattano
- **Caricamento preset**: `loadPresetData` cambia i dropdown → i cavi si aggiornano via sync
- **Canvas overlay**: `pointer-events: none` sul canvas, i patch points sono div normali sopra il canvas (z-index piu alto)
- **Hit detection cavi**: per rimozione cavo, si calcola distanza punto-curva dal click. Il canvas ha `pointer-events: none`, quindi la hit detection va fatta sui patch points e su un layer separato o via coordinate.

## Approccio alternativo per rimozione cavo

Invece di hit detection sulla curva (complessa), la rimozione avviene tramite: click/tap sul patch point output dell'LFO quando un cavo e gia connesso → rimuove la connessione. Piu semplice e intuitivo.
