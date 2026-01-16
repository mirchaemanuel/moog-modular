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
 * Initialize all knobs with drag interaction
 */
export function initKnobs() {
    const knobs = document.querySelectorAll('.knob');

    knobs.forEach(knob => {
        const param = knob.dataset.param;
        const min = parseFloat(knob.dataset.min);
        const max = parseFloat(knob.dataset.max);
        let value = parseFloat(knob.dataset.value);
        const isLog = knob.dataset.log === 'true';

        updateKnobRotation(knob, value, min, max, isLog);
        updateKnobValue(param, value);

        let isDragging = false;
        let startY = 0;
        let startValue = 0;

        knob.addEventListener('mousedown', (e) => {
            isDragging = true;
            startY = e.clientY;
            startValue = value;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaY = startY - e.clientY;
            const range = max - min;
            const sensitivity = isLog ? 0.5 : 1;

            if (isLog) {
                const logMin = Math.log(min);
                const logMax = Math.log(max);
                const logStart = Math.log(startValue);
                const logRange = logMax - logMin;
                const newLogValue = logStart + (deltaY / 200) * logRange * sensitivity;
                value = Math.exp(Math.max(logMin, Math.min(logMax, newLogValue)));
            } else {
                value = startValue + (deltaY / 200) * range * sensitivity;
                value = Math.max(min, Math.min(max, value));
            }

            // Round for certain parameters
            if (param.includes('octave')) {
                value = Math.round(value);
            }

            knob.dataset.value = value;
            updateKnobRotation(knob, value, min, max, isLog);
            updateKnobValue(param, value);
            applyParameter(param, value);
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    });
}
