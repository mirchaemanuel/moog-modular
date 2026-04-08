# Patch Cables Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add visual patch cables — decorative catenary curves for the fixed signal flow, and draggable LFO cables synced with the destination dropdowns.

**Architecture:** A new `js/ui/patch-cables.js` module owns all cable rendering and interaction on the existing `<canvas id="patch-canvas">`. Patch point divs are added to the HTML modules. The dropdown and cable stay in bidirectional sync via exported functions. No audio engine changes.

**Tech Stack:** Vanilla JS, Canvas 2D, ResizeObserver

---

### Task 1: Add patch point HTML elements and CSS

**Files:**
- Modify: `index.html` (add patch-point divs inside modules)
- Modify: `css/styles.css` (add patch-point styles)

- [ ] **Step 1: Add patch point divs to index.html**

Add a `<div class="patch-section">` with patch points at the bottom of each relevant module. Each patch point has `data-type` (output/input), `data-module`, and `data-param`.

In `index.html`, after the last `</div>` of each module's knob-row content but before the closing `</div>` of the module itself, add:

**VCO 1** (after the PW knob-row closing `</div>`, before `</div>` of `.module.vco-module`):
```html
            <div class="patch-section">
                <div class="patch-point" data-type="input" data-module="vco1" data-param="pitch"></div>
                <div class="patch-point-label">MOD IN</div>
            </div>
```

**VCO 2** (same position):
```html
            <div class="patch-section">
                <div class="patch-point" data-type="input" data-module="vco2" data-param="pitch"></div>
                <div class="patch-point-label">MOD IN</div>
            </div>
```

**VCO 3** (same position):
```html
            <div class="patch-section">
                <div class="patch-point" data-type="input" data-module="vco3" data-param="pitch"></div>
                <div class="patch-point-label">MOD IN</div>
            </div>
```

**Filter** (after the Kbd Track knob-row, before closing `</div>` of `.module.filter-module`):
```html
            <div class="patch-section">
                <div class="patch-point" data-type="input" data-module="filter" data-param="filter"></div>
                <div class="patch-point-label">MOD IN</div>
            </div>
```

**Amp Envelope** (after the canvas, before closing `</div>` of the second `.module.adsr-module`):
```html
            <div class="patch-section">
                <div class="patch-point" data-type="input" data-module="amp" data-param="amp"></div>
                <div class="patch-point-label">MOD IN</div>
            </div>
```

**LFO 1** (after the destination slider-container, before closing `</div>` of first `.module.lfo-module`):
```html
            <div class="patch-section">
                <div class="patch-point" data-type="output" data-module="lfo1" data-param="lfo"></div>
                <div class="patch-point-label">OUT</div>
            </div>
```

**LFO 2** (same position in second `.module.lfo-module`):
```html
            <div class="patch-section">
                <div class="patch-point" data-type="output" data-module="lfo2" data-param="lfo"></div>
                <div class="patch-point-label">OUT</div>
            </div>
```

- [ ] **Step 2: Add patch point styles to CSS**

Add at the end of `css/styles.css` (before the `@media` block):

```css
/* Patch Points */
.patch-point {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #333, #111);
    border: 2px solid #666;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-block;
}

.patch-point[data-type="output"] {
    border-color: #888;
}

.patch-point[data-module="lfo1"],
.patch-point[data-module="lfo1"].connected {
    border-color: #00ffff;
}

.patch-point[data-module="lfo2"],
.patch-point[data-module="lfo2"].connected {
    border-color: #ff00ff;
}

.patch-point:hover {
    box-shadow: 0 0 10px rgba(255,215,0,0.5);
    transform: scale(1.2);
}

.patch-point.active {
    box-shadow: 0 0 15px rgba(255,215,0,0.8);
    transform: scale(1.3);
}

.patch-point.connected {
    background: radial-gradient(circle at 30% 30%, #ffd700, #996600);
}

.patch-point[data-type="input"].connected-lfo1 {
    background: radial-gradient(circle at 30% 30%, #00ffff, #006666);
    border-color: #00ffff;
    box-shadow: 0 0 6px rgba(0,255,255,0.4);
}

.patch-point[data-type="input"].connected-lfo2 {
    background: radial-gradient(circle at 30% 30%, #ff00ff, #660066);
    border-color: #ff00ff;
    box-shadow: 0 0 6px rgba(255,0,255,0.4);
}
```

And inside the existing `@media (max-width: 600px)` block add:

```css
    .patch-point {
        width: 20px;
        height: 20px;
    }

    .patch-point-label {
        font-size: 0.5em;
    }
```

- [ ] **Step 3: Verify patch points visible**

Open `http://localhost:8000` and confirm each module shows a small circle at the bottom. LFO circles should be cyan/magenta bordered. Input circles should be gray bordered.

- [ ] **Step 4: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: add patch point elements and styles to modules"
```

---

### Task 2: Create patch-cables.js — catenary rendering

**Files:**
- Create: `js/ui/patch-cables.js`

- [ ] **Step 1: Create patch-cables.js with catenary drawing and decorative cables**

Create `js/ui/patch-cables.js`:

```javascript
// Moog Modular Synthesizer - Patch Cables Visualization

const CABLE_COLORS = {
    audio: { color: '#ffa500', opacity: 0.4, width: 2 },
    lfo1:  { color: '#00ffff', opacity: 0.9, width: 3 },
    lfo2:  { color: '#ff00ff', opacity: 0.9, width: 3 }
};

// Fixed signal flow connections (module title CSS selectors)
const FIXED_ROUTES = [
    { from: '.vco-module:nth-child(1)', to: '.mixer-module' },
    { from: '.vco-module:nth-child(2)', to: '.mixer-module' },
    { from: '.vco-module:nth-child(3)', to: '.mixer-module' },
    { from: '.mixer-module', to: '.filter-module' },
    { from: '.filter-module', to: '.adsr-module:nth-child(6)' },
    { from: '.adsr-module:nth-child(7)', to: '.effects-module' },
    { from: '.effects-module', to: '.oscilloscope' }
];

// LFO connection state
const lfoConnections = {
    lfo1: null, // destination param: 'pitch'|'filter'|'amp' or null
    lfo2: null
};

let canvas = null;
let ctx = null;
let animFrameId = null;

/**
 * Get the center-bottom position of an element relative to the page
 */
function getElementAnchor(el, position = 'bottom') {
    const rect = el.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    if (position === 'bottom') {
        return { x: rect.left + rect.width / 2 + scrollX, y: rect.bottom + scrollY };
    }
    if (position === 'top') {
        return { x: rect.left + rect.width / 2 + scrollX, y: rect.top + scrollY };
    }
    return { x: rect.left + rect.width / 2 + scrollX, y: rect.top + rect.height / 2 + scrollY };
}

/**
 * Draw a catenary-like cable between two points
 * Uses a quadratic bezier with control point pulled down by gravity
 */
function drawCable(fromX, fromY, toX, toY, style) {
    const dx = Math.abs(toX - fromX);
    const dy = toY - fromY;
    // Sag amount: proportional to horizontal distance, minimum sag
    const sag = Math.max(30, dx * 0.3) + Math.max(0, -dy * 0.2);

    const midX = (fromX + toX) / 2;
    const midY = Math.max(fromY, toY) + sag;

    ctx.save();
    ctx.strokeStyle = style.color;
    ctx.globalAlpha = style.opacity;
    ctx.lineWidth = style.width;
    ctx.shadowColor = style.color;
    ctx.shadowBlur = style.width + 3;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.quadraticCurveTo(midX, midY, toX, toY);
    ctx.stroke();
    ctx.restore();
}

/**
 * Draw all decorative (fixed signal flow) cables
 */
function drawFixedCables() {
    const container = document.querySelector('.synth-container');
    if (!container) return;

    const modules = container.children;

    // Map module indices: VCO1=0, VCO2=1, VCO3=2, Mixer=3, Filter=4,
    // FilterEnv=5, AmpEnv=6, LFO1=7, LFO2=8, Effects=9, Master=10, Scope=11
    const pairs = [
        [0, 3], // VCO1 → Mixer
        [1, 3], // VCO2 → Mixer
        [2, 3], // VCO3 → Mixer
        [3, 4], // Mixer → Filter
        [4, 5], // Filter → Filter Envelope
        [6, 9], // Amp Envelope → Effects
        [9, 11] // Effects → Scope
    ];

    pairs.forEach(([fromIdx, toIdx]) => {
        const fromEl = modules[fromIdx];
        const toEl = modules[toIdx];
        if (!fromEl || !toEl) return;

        const from = getElementAnchor(fromEl, 'bottom');
        const to = getElementAnchor(toEl, 'top');
        drawCable(from.x, from.y, to.x, to.y, CABLE_COLORS.audio);
    });
}

/**
 * Draw LFO connection cables
 */
function drawLfoCables() {
    ['lfo1', 'lfo2'].forEach(lfoId => {
        const dest = lfoConnections[lfoId];
        if (!dest) return;

        const outputPoint = document.querySelector(`.patch-point[data-module="${lfoId}"][data-type="output"]`);
        if (!outputPoint) return;

        // Find the input patch point matching the destination
        let inputSelector;
        if (dest === 'pitch') {
            // Connect to all VCO inputs — draw cable to VCO1 for simplicity
            inputSelector = '.patch-point[data-module="vco1"][data-param="pitch"]';
        } else if (dest === 'filter') {
            inputSelector = '.patch-point[data-module="filter"][data-param="filter"]';
        } else if (dest === 'amp') {
            inputSelector = '.patch-point[data-module="amp"][data-param="amp"]';
        }

        const inputPoint = inputSelector ? document.querySelector(inputSelector) : null;
        if (!inputPoint) return;

        const from = getElementAnchor(outputPoint, 'center');
        const to = getElementAnchor(inputPoint, 'center');
        const style = CABLE_COLORS[lfoId];
        drawCable(from.x, from.y, to.x, to.y, style);
    });
}

/**
 * Resize canvas to match page size and redraw
 */
function resizeCanvas() {
    if (!canvas) return;
    canvas.width = document.documentElement.scrollWidth;
    canvas.height = document.documentElement.scrollHeight;
    drawAll();
}

/**
 * Clear and redraw all cables
 */
function drawAll() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFixedCables();
    drawLfoCables();
}

/**
 * Set an LFO connection and update visuals
 */
export function setConnection(lfoId, dest) {
    // Clear previous connected class on input points
    const prevDest = lfoConnections[lfoId];
    if (prevDest) {
        document.querySelectorAll(`.patch-point.connected-${lfoId}`).forEach(el => {
            el.classList.remove(`connected-${lfoId}`);
        });
    }

    lfoConnections[lfoId] = dest;

    // Mark output as connected
    const outputPoint = document.querySelector(`.patch-point[data-module="${lfoId}"][data-type="output"]`);
    if (outputPoint) {
        outputPoint.classList.toggle('connected', !!dest);
    }

    // Mark input as connected
    if (dest) {
        let inputPoints;
        if (dest === 'pitch') {
            inputPoints = document.querySelectorAll('.patch-point[data-param="pitch"]');
        } else if (dest === 'filter') {
            inputPoints = document.querySelectorAll('.patch-point[data-param="filter"]');
        } else if (dest === 'amp') {
            inputPoints = document.querySelectorAll('.patch-point[data-param="amp"]');
        }
        if (inputPoints) {
            inputPoints.forEach(el => el.classList.add(`connected-${lfoId}`));
        }
    }

    drawAll();
}

/**
 * Sync cable state FROM dropdown change (called by wave-selectors.js)
 */
export function syncFromDropdown(lfoNum, dest) {
    const lfoId = `lfo${lfoNum}`;
    // Map dropdown values to our param names
    const paramMap = { pitch: 'pitch', filter: 'filter', amp: 'amp', pw: null };
    const mapped = paramMap[dest];
    setConnection(lfoId, mapped);
}

/**
 * Sync cable state TO dropdown (called when cable is dragged)
 */
function syncToDropdown(lfoNum, dest) {
    const dropdown = document.getElementById(`lfo${lfoNum}-dest`);
    if (dropdown && dropdown.value !== dest) {
        dropdown.value = dest;
        dropdown.dispatchEvent(new Event('change'));
    }
}

// --- Interaction State ---
let dragState = null; // { lfoId, startX, startY } or null
let tapState = null;  // { lfoId } for mobile tap-tap

/**
 * Handle starting a cable drag/tap from an output patch point
 */
function handleOutputInteraction(patchPoint) {
    const lfoId = patchPoint.dataset.module;

    // If already connected, disconnect
    if (lfoConnections[lfoId]) {
        const prevDest = lfoConnections[lfoId];
        setConnection(lfoId, null);
        // Also sync dropdown back to current (it will still point to old dest, update state)
        syncToDropdown(lfoId === 'lfo1' ? 1 : 2, prevDest);
        return;
    }

    return lfoId; // signal to start drag/tap
}

/**
 * Handle completing a cable connection to an input patch point
 */
function handleInputConnection(lfoId, inputPoint) {
    const param = inputPoint.dataset.param;
    setConnection(lfoId, param);

    const lfoNum = lfoId === 'lfo1' ? 1 : 2;
    syncToDropdown(lfoNum, param);
}

/**
 * Draw a temporary cable from LFO output to cursor position
 */
function drawDragCable(mouseX, mouseY) {
    if (!dragState) return;
    const outputPoint = document.querySelector(`.patch-point[data-module="${dragState.lfoId}"][data-type="output"]`);
    if (!outputPoint) return;

    drawAll(); // redraw base cables first
    const from = getElementAnchor(outputPoint, 'center');
    const style = CABLE_COLORS[dragState.lfoId];
    drawCable(from.x, from.y, mouseX + window.scrollX, mouseY + window.scrollY, { ...style, opacity: 0.5 });
}

/**
 * Initialize all patch cable interactions
 */
export function initPatchCables() {
    canvas = document.getElementById('patch-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // Initial sizing
    resizeCanvas();

    // Resize on window changes
    const resizeObserver = new ResizeObserver(() => resizeCanvas());
    resizeObserver.observe(document.body);
    window.addEventListener('scroll', () => drawAll());

    // Sync initial LFO destinations from state
    const lfo1Dest = document.getElementById('lfo1-dest');
    const lfo2Dest = document.getElementById('lfo2-dest');
    if (lfo1Dest) syncFromDropdown(1, lfo1Dest.value);
    if (lfo2Dest) syncFromDropdown(2, lfo2Dest.value);

    // --- Desktop: Mouse drag ---
    document.addEventListener('mousedown', (e) => {
        const pp = e.target.closest('.patch-point[data-type="output"]');
        if (!pp) return;
        const lfoId = handleOutputInteraction(pp);
        if (!lfoId) return; // was a disconnect
        dragState = { lfoId };
        pp.classList.add('active');
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!dragState) return;
        drawDragCable(e.clientX, e.clientY);
    });

    document.addEventListener('mouseup', (e) => {
        if (!dragState) return;

        const pp = e.target.closest('.patch-point[data-type="input"]');
        if (pp) {
            handleInputConnection(dragState.lfoId, pp);
        }

        // Cleanup
        const outputPoint = document.querySelector(`.patch-point[data-module="${dragState.lfoId}"][data-type="output"]`);
        if (outputPoint) outputPoint.classList.remove('active');
        dragState = null;
        drawAll();
    });

    // --- Mobile: Tap-tap ---
    document.addEventListener('touchstart', (e) => {
        const pp = e.target.closest('.patch-point');
        if (!pp) {
            // Tap elsewhere cancels tap state
            if (tapState) {
                const prevOutput = document.querySelector(`.patch-point[data-module="${tapState.lfoId}"][data-type="output"]`);
                if (prevOutput) prevOutput.classList.remove('active');
                tapState = null;
            }
            return;
        }

        if (pp.dataset.type === 'output') {
            const lfoId = handleOutputInteraction(pp);
            if (!lfoId) return;
            tapState = { lfoId };
            pp.classList.add('active');
            e.preventDefault();
        } else if (pp.dataset.type === 'input' && tapState) {
            handleInputConnection(tapState.lfoId, pp);
            const prevOutput = document.querySelector(`.patch-point[data-module="${tapState.lfoId}"][data-type="output"]`);
            if (prevOutput) prevOutput.classList.remove('active');
            tapState = null;
            e.preventDefault();
        }
    }, { passive: false });
}
```

- [ ] **Step 2: Commit**

```bash
git add js/ui/patch-cables.js
git commit -m "feat: create patch-cables module with catenary rendering and interaction"
```

---

### Task 3: Wire up patch-cables in app.js and wave-selectors.js

**Files:**
- Modify: `js/app.js` (import and init)
- Modify: `js/ui/wave-selectors.js` (sync dropdown changes to cables)

- [ ] **Step 1: Add import and init call in app.js**

In `js/app.js`, add the import after the other UI imports:

```javascript
import { initPatchCables } from './ui/patch-cables.js';
```

Add the init call at the end of the `init()` function, after the `drawEnvelope` calls:

```javascript
    // Initialize patch cables
    initPatchCables();
```

- [ ] **Step 2: Add dropdown sync in wave-selectors.js**

In `js/ui/wave-selectors.js`, add the import at the top:

```javascript
import { syncFromDropdown } from './patch-cables.js';
```

Modify the two LFO destination change handlers to call sync. Replace:

```javascript
    const lfo1Dest = document.getElementById('lfo1-dest');
    if (lfo1Dest) {
        lfo1Dest.addEventListener('change', (e) => {
            state.lfo1.dest = e.target.value;
        });
    }

    const lfo2Dest = document.getElementById('lfo2-dest');
    if (lfo2Dest) {
        lfo2Dest.addEventListener('change', (e) => {
            state.lfo2.dest = e.target.value;
        });
    }
```

With:

```javascript
    const lfo1Dest = document.getElementById('lfo1-dest');
    if (lfo1Dest) {
        lfo1Dest.addEventListener('change', (e) => {
            state.lfo1.dest = e.target.value;
            syncFromDropdown(1, e.target.value);
        });
    }

    const lfo2Dest = document.getElementById('lfo2-dest');
    if (lfo2Dest) {
        lfo2Dest.addEventListener('change', (e) => {
            state.lfo2.dest = e.target.value;
            syncFromDropdown(2, e.target.value);
        });
    }
```

- [ ] **Step 3: Verify everything works**

1. Open `http://localhost:8000`, click any key to trigger audio init
2. Decorative orange cables should appear between modules
3. LFO1 patch point (cyan) should have a cable to VCO1 (default dest: pitch)
4. LFO2 patch point (magenta) should have a cable to Filter (default dest: filter)
5. Change LFO1 dropdown to "Filter" → cable should move to Filter module
6. Drag from LFO2 output to Amp Envelope input → cable connects, dropdown updates to "Amp"
7. Click LFO2 output again → cable disconnects
8. Resize window → cables reposition correctly

- [ ] **Step 4: Commit**

```bash
git add js/app.js js/ui/wave-selectors.js
git commit -m "feat: wire patch cables into app init and dropdown sync"
```

---

### Task 4: Polish and fix decorative cable routing

**Files:**
- Modify: `js/ui/patch-cables.js` (tune fixed cable positions)

- [ ] **Step 1: Test and adjust fixed cable routing**

The fixed cable indices (`pairs` array in `drawFixedCables`) depend on the DOM order of `.synth-container` children. Open the page and verify the cables connect the right modules. If any cable is misrouted, adjust the index pairs.

The expected DOM order of `.synth-container` children is:
- 0: VCO 1
- 1: VCO 2
- 2: VCO 3
- 3: Mixer
- 4: Ladder Filter
- 5: Filter Envelope
- 6: Amp Envelope
- 7: LFO 1
- 8: LFO 2
- 9: Effects
- 10: Master
- 11: Scope

Adjust any wrong indices. If pairs cross over each other visually in 2-column mobile layout, consider hiding decorative cables on mobile by wrapping `drawFixedCables()` in a width check:

```javascript
function drawFixedCables() {
    if (window.innerWidth <= 600) return; // skip on mobile — modules rearranged
    // ... rest of function
}
```

- [ ] **Step 2: Commit**

```bash
git add js/ui/patch-cables.js
git commit -m "fix: tune decorative cable routing and hide on mobile"
```

---

### Task 5: Final integration test and release

**Files:** none (testing + git only)

- [ ] **Step 1: Full test checklist**

Desktop:
- [ ] Decorative cables visible between correct modules
- [ ] LFO cables match dropdown initial state
- [ ] Drag LFO1 output → drop on Filter input → cable appears, dropdown updates
- [ ] Drag LFO2 output → drop on VCO1 input → cable appears, dropdown updates
- [ ] Click LFO output with existing cable → disconnects
- [ ] Change dropdown → cable moves
- [ ] Load preset → cables update
- [ ] Resize window → cables reposition
- [ ] Play notes → audio unaffected

Mobile (390px):
- [ ] Decorative cables hidden
- [ ] LFO cables visible between patch points
- [ ] Tap LFO output → tap input → connects
- [ ] Tap LFO output (connected) → disconnects

- [ ] **Step 2: Commit, branch, PR, merge, tag**

```bash
git checkout -b feature/patch-cables
git push -u origin feature/patch-cables
gh pr create --title "Add visual patch cables" --body "..."
gh pr merge --merge --admin
git checkout main && git pull origin main
git tag v0.7.0 && git push origin v0.7.0
```
