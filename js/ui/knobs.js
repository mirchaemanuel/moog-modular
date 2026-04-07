// Moog Modular Synthesizer - Knob Interaction

import { applyParameter } from '../audio/parameters.js';

/**
 * Update knob rotation based on value
 */
export function updateKnobRotation(knob, value, min, max, isLog) {
    let normalizedValue;
    if (isLog) {
        normalizedValue = (Math.log(value) - Math.log(min)) / (Math.log(max) - Math.log(min));
    } else {
        normalizedValue = (value - min) / (max - min);
    }
    const rotation = -135 + normalizedValue * 270;
    knob.style.transform = `rotate(${rotation}deg)`;
}

/**
 * Update knob value display
 */
export function updateKnobValue(param, value) {
    const valEl = document.getElementById(`${param}-val`);
    if (!valEl) return;

    switch(param) {
        case 'cutoff':
            valEl.textContent = value >= 1000 ? `${(value/1000).toFixed(1)}kHz` : `${Math.round(value)}Hz`;
            break;
        case 'f-attack':
        case 'f-decay':
        case 'f-release':
        case 'a-attack':
        case 'a-decay':
        case 'a-release':
        case 'delay-time':
        case 'glide':
            valEl.textContent = `${Math.round(value)}ms`;
            break;
        case 'f-sustain':
        case 'a-sustain':
        case 'delay-feedback':
        case 'delay-mix':
        case 'reverb-mix':
            valEl.textContent = `${Math.round(value)}%`;
            break;
        case 'lfo1-rate':
        case 'lfo2-rate':
            valEl.textContent = `${value.toFixed(1)} Hz`;
            break;
        default:
            valEl.textContent = Math.round(value);
    }
}

/**
 * Compute new knob value from drag delta
 */
function computeKnobValue(startValue, deltaY, min, max, isLog) {
    const sensitivity = isLog ? 0.5 : 1;
    if (isLog) {
        const logMin = Math.log(min);
        const logMax = Math.log(max);
        const logStart = Math.log(startValue);
        const logRange = logMax - logMin;
        const newLogValue = logStart + (deltaY / 200) * logRange * sensitivity;
        return Math.exp(Math.max(logMin, Math.min(logMax, newLogValue)));
    } else {
        const range = max - min;
        return Math.max(min, Math.min(max, startValue + (deltaY / 200) * range * sensitivity));
    }
}

/**
 * Initialize all knobs with drag interaction (single delegated handler + touch support)
 */
export function initKnobs() {
    let activeKnob = null;
    let startY = 0;
    let startValue = 0;

    // Set initial rotation and display for all knobs
    document.querySelectorAll('.knob').forEach(knob => {
        const param = knob.dataset.param;
        const min = parseFloat(knob.dataset.min);
        const max = parseFloat(knob.dataset.max);
        const value = parseFloat(knob.dataset.value);
        const isLog = knob.dataset.log === 'true';

        updateKnobRotation(knob, value, min, max, isLog);
        updateKnobValue(param, value);
    });

    function onDragStart(knob, clientY) {
        activeKnob = knob;
        startY = clientY;
        startValue = parseFloat(knob.dataset.value);
    }

    function onDragMove(clientY) {
        if (!activeKnob) return;
        const knob = activeKnob;
        const param = knob.dataset.param;
        const min = parseFloat(knob.dataset.min);
        const max = parseFloat(knob.dataset.max);
        const isLog = knob.dataset.log === 'true';

        const deltaY = startY - clientY;
        let value = computeKnobValue(startValue, deltaY, min, max, isLog);

        if (param.includes('octave')) {
            value = Math.round(value);
        }

        knob.dataset.value = value;
        updateKnobRotation(knob, value, min, max, isLog);
        updateKnobValue(param, value);
        applyParameter(param, value);
    }

    function onDragEnd() {
        activeKnob = null;
    }

    // Mouse events — single delegated handler
    document.addEventListener('mousedown', (e) => {
        const knob = e.target.closest('.knob');
        if (knob) {
            onDragStart(knob, e.clientY);
            e.preventDefault();
        }
    });
    document.addEventListener('mousemove', (e) => onDragMove(e.clientY));
    document.addEventListener('mouseup', onDragEnd);

    // Touch events
    document.addEventListener('touchstart', (e) => {
        const knob = e.target.closest('.knob');
        if (knob) {
            onDragStart(knob, e.touches[0].clientY);
            e.preventDefault();
        }
    }, { passive: false });
    document.addEventListener('touchmove', (e) => {
        if (activeKnob) {
            onDragMove(e.touches[0].clientY);
            e.preventDefault();
        }
    }, { passive: false });
    document.addEventListener('touchend', onDragEnd);
}
