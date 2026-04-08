// Moog Modular Synthesizer - External Audio Input
// Routes microphone through a dedicated ladder filter into the master chain

import { audioCtx, state, masterGain } from '../state.js';
import { initAudio } from './audio-context.js';

let micStream = null;
let micSource = null;
let extGain = null;
let extFilter = null;
let isActive = false;

/**
 * Start microphone input
 * Chain: Mic → ExtGain → ExtFilter (reads state.filter) → masterGain → Effects
 */
export async function startMic() {
    initAudio();

    if (isActive) return;

    try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micSource = audioCtx.createMediaStreamSource(micStream);

        // Dedicated gain for external input level
        extGain = audioCtx.createGain();
        extGain.gain.value = state.extIn / 100;

        // Dedicated filter that mirrors the synth's ladder filter
        extFilter = audioCtx.createBiquadFilter();
        extFilter.type = 'lowpass';
        extFilter.frequency.value = state.filter.cutoff;
        extFilter.Q.value = state.filter.resonance / 5;

        // Connect: mic → gain → filter → master
        micSource.connect(extGain);
        extGain.connect(extFilter);
        extFilter.connect(masterGain);

        isActive = true;
    } catch (err) {
        console.error('Microphone access denied:', err);
    }
}

/**
 * Stop microphone input
 */
export function stopMic() {
    if (!isActive) return;

    if (micSource) {
        try { micSource.disconnect(); } catch(e) {}
        micSource = null;
    }
    if (extGain) {
        try { extGain.disconnect(); } catch(e) {}
        extGain = null;
    }
    if (extFilter) {
        try { extFilter.disconnect(); } catch(e) {}
        extFilter = null;
    }
    if (micStream) {
        micStream.getTracks().forEach(t => t.stop());
        micStream = null;
    }

    isActive = false;
}

/**
 * Toggle microphone on/off
 */
export function toggleMic() {
    if (isActive) {
        stopMic();
    } else {
        startMic();
    }
    return isActive;
}

/**
 * Update external input gain (called when ext-in knob changes)
 */
export function setExtGainLevel(value) {
    state.extIn = value;
    if (extGain) {
        extGain.gain.value = value / 100;
    }
}

/**
 * Update external input filter in real-time (called from parameters.js)
 */
export function updateExtFilter() {
    if (!extFilter || !audioCtx) return;
    const now = audioCtx.currentTime;
    extFilter.frequency.setTargetAtTime(state.filter.cutoff, now, 0.02);
    extFilter.Q.setTargetAtTime(state.filter.resonance / 5, now, 0.02);
}

/**
 * Check if mic is active
 */
export function isMicActive() {
    return isActive;
}
