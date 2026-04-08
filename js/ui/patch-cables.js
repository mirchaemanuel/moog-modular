// Moog Modular Synthesizer - Patch Cables Visualization

const CABLE_COLORS = {
    audio: { color: '#ffa500', opacity: 0.4, width: 2 },
    lfo1:  { color: '#00ffff', opacity: 0.9, width: 3 },
    lfo2:  { color: '#ff00ff', opacity: 0.9, width: 3 }
};

const lfoConnections = {
    lfo1: null,
    lfo2: null
};

let canvas = null;
let ctx = null;

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

function drawCable(fromX, fromY, toX, toY, style) {
    const dx = Math.abs(toX - fromX);
    const dy = toY - fromY;
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

function drawFixedCables() {
    if (window.innerWidth <= 600) return;
    const container = document.querySelector('.synth-container');
    if (!container) return;
    const modules = container.children;

    const pairs = [
        [0, 3], [1, 3], [2, 3],  // VCOs → Mixer
        [3, 4],                    // Mixer → Filter
        [4, 5],                    // Filter → FilterEnv
        [6, 9],                    // AmpEnv → Effects
        [9, 11]                    // Effects → Scope
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

function drawLfoCables() {
    ['lfo1', 'lfo2'].forEach(lfoId => {
        const dest = lfoConnections[lfoId];
        if (!dest) return;

        const outputPoint = document.querySelector(`.patch-point[data-module="${lfoId}"][data-type="output"]`);
        if (!outputPoint) return;

        let inputSelector;
        if (dest === 'pitch') {
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
        drawCable(from.x, from.y, to.x, to.y, CABLE_COLORS[lfoId]);
    });
}

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = document.documentElement.scrollWidth;
    canvas.height = document.documentElement.scrollHeight;
    drawAll();
}

function drawAll() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFixedCables();
    drawLfoCables();
}

export function setConnection(lfoId, dest) {
    const prevDest = lfoConnections[lfoId];
    if (prevDest) {
        document.querySelectorAll(`.patch-point.connected-${lfoId}`).forEach(el => {
            el.classList.remove(`connected-${lfoId}`);
        });
    }

    lfoConnections[lfoId] = dest;

    const outputPoint = document.querySelector(`.patch-point[data-module="${lfoId}"][data-type="output"]`);
    if (outputPoint) {
        outputPoint.classList.toggle('connected', !!dest);
    }

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

export function syncFromDropdown(lfoNum, dest) {
    const lfoId = `lfo${lfoNum}`;
    const paramMap = { pitch: 'pitch', filter: 'filter', amp: 'amp', pw: null };
    setConnection(lfoId, paramMap[dest]);
}

function syncToDropdown(lfoNum, dest) {
    const dropdown = document.getElementById(`lfo${lfoNum}-dest`);
    if (dropdown && dropdown.value !== dest) {
        dropdown.value = dest;
        dropdown.dispatchEvent(new Event('change'));
    }
}

// Interaction state
let dragState = null;
let tapState = null;

function handleOutputInteraction(patchPoint) {
    const lfoId = patchPoint.dataset.module;
    if (lfoConnections[lfoId]) {
        setConnection(lfoId, null);
        syncToDropdown(lfoId === 'lfo1' ? 1 : 2, lfoConnections[lfoId] || 'pitch');
        return null;
    }
    return lfoId;
}

function handleInputConnection(lfoId, inputPoint) {
    const param = inputPoint.dataset.param;
    setConnection(lfoId, param);
    syncToDropdown(lfoId === 'lfo1' ? 1 : 2, param);
}

function drawDragCable(mouseX, mouseY) {
    if (!dragState) return;
    const outputPoint = document.querySelector(`.patch-point[data-module="${dragState.lfoId}"][data-type="output"]`);
    if (!outputPoint) return;
    drawAll();
    const from = getElementAnchor(outputPoint, 'center');
    drawCable(from.x, from.y, mouseX + window.scrollX, mouseY + window.scrollY, { ...CABLE_COLORS[dragState.lfoId], opacity: 0.5 });
}

export function initPatchCables() {
    canvas = document.getElementById('patch-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    resizeCanvas();

    const resizeObserver = new ResizeObserver(() => resizeCanvas());
    resizeObserver.observe(document.body);
    window.addEventListener('scroll', () => drawAll());

    // Sync initial LFO destinations
    const lfo1Dest = document.getElementById('lfo1-dest');
    const lfo2Dest = document.getElementById('lfo2-dest');
    if (lfo1Dest) syncFromDropdown(1, lfo1Dest.value);
    if (lfo2Dest) syncFromDropdown(2, lfo2Dest.value);

    // Desktop: mouse drag
    document.addEventListener('mousedown', (e) => {
        const pp = e.target.closest('.patch-point[data-type="output"]');
        if (!pp) return;
        const lfoId = handleOutputInteraction(pp);
        if (!lfoId) return;
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
        if (pp) handleInputConnection(dragState.lfoId, pp);
        const outputPoint = document.querySelector(`.patch-point[data-module="${dragState.lfoId}"][data-type="output"]`);
        if (outputPoint) outputPoint.classList.remove('active');
        dragState = null;
        drawAll();
    });

    // Mobile: tap-tap
    document.addEventListener('touchstart', (e) => {
        const pp = e.target.closest('.patch-point');
        if (!pp) {
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
