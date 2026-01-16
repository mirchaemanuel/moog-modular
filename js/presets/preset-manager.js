// Moog Modular Synthesizer - Preset Manager

import { state, lfo1Osc, lfo2Osc } from '../state.js';
import { presets } from './built-in.js';
import { updateKnobRotation, updateKnobValue } from '../ui/knobs.js';
import { applyParameter, updateActiveWaveforms } from '../audio/parameters.js';

/**
 * Helper to set a knob value
 */
function setKnob(param, value) {
    const knob = document.querySelector(`[data-param="${param}"]`);
    if (knob) {
        knob.dataset.value = value;
        const min = parseFloat(knob.dataset.min);
        const max = parseFloat(knob.dataset.max);
        const isLog = knob.dataset.log === 'true';
        updateKnobRotation(knob, value, min, max, isLog);
        updateKnobValue(param, value);
        applyParameter(param, value);
    }
}

/**
 * Load a built-in preset by name
 */
export function loadPreset(name) {
    const preset = presets[name];
    if (!preset) return;

    // VCOs
    for (let i = 1; i <= 3; i++) {
        const vco = preset[`vco${i}`];
        setKnob(`vco${i}-octave`, vco.octave);
        setKnob(`vco${i}-detune`, vco.detune);

        // Set wave
        document.querySelectorAll(`.wave-btn[data-vco="${i}"]`).forEach(b => {
            b.classList.toggle('active', b.dataset.wave === vco.wave);
        });
        state[`vco${i}`].wave = vco.wave;
    }

    // Mixer
    setKnob('mix1', preset.mixer.vco1);
    setKnob('mix2', preset.mixer.vco2);
    setKnob('mix3', preset.mixer.vco3);
    setKnob('noise', preset.mixer.noise);

    // Filter
    setKnob('cutoff', preset.filter.cutoff);
    setKnob('resonance', preset.filter.resonance);
    setKnob('filter-env', preset.filter.envAmount);
    setKnob('filter-kbd', preset.filter.kbdTrack);

    // Envelopes
    setKnob('f-attack', preset.filterEnv.attack);
    setKnob('f-decay', preset.filterEnv.decay);
    setKnob('f-sustain', preset.filterEnv.sustain);
    setKnob('f-release', preset.filterEnv.release);

    setKnob('a-attack', preset.ampEnv.attack);
    setKnob('a-decay', preset.ampEnv.decay);
    setKnob('a-sustain', preset.ampEnv.sustain);
    setKnob('a-release', preset.ampEnv.release);

    // Effects
    setKnob('delay-time', preset.effects.delayTime);
    setKnob('delay-feedback', preset.effects.delayFeedback);
    setKnob('delay-mix', preset.effects.delayMix);
    setKnob('reverb-mix', preset.effects.reverbMix);

    // Glide
    setKnob('glide', preset.glide);
}

/**
 * Load preset data (generic, for user presets)
 */
export function loadPresetData(preset) {
    // VCOs
    for (let i = 1; i <= 3; i++) {
        const vco = preset[`vco${i}`];
        if (vco) {
            setKnob(`vco${i}-octave`, vco.octave);
            setKnob(`vco${i}-detune`, vco.detune);

            // Set wave
            document.querySelectorAll(`.wave-btn[data-vco="${i}"]`).forEach(b => {
                b.classList.toggle('active', b.dataset.wave === vco.wave);
            });
            state[`vco${i}`].wave = vco.wave;
        }
    }

    // Mixer
    if (preset.mixer) {
        setKnob('mix1', preset.mixer.vco1);
        setKnob('mix2', preset.mixer.vco2);
        setKnob('mix3', preset.mixer.vco3);
        setKnob('noise', preset.mixer.noise);
    }

    // Filter
    if (preset.filter) {
        setKnob('cutoff', preset.filter.cutoff);
        setKnob('resonance', preset.filter.resonance);
        setKnob('filter-env', preset.filter.envAmount);
        setKnob('filter-kbd', preset.filter.kbdTrack);
    }

    // Envelopes
    if (preset.filterEnv) {
        setKnob('f-attack', preset.filterEnv.attack);
        setKnob('f-decay', preset.filterEnv.decay);
        setKnob('f-sustain', preset.filterEnv.sustain);
        setKnob('f-release', preset.filterEnv.release);
    }

    if (preset.ampEnv) {
        setKnob('a-attack', preset.ampEnv.attack);
        setKnob('a-decay', preset.ampEnv.decay);
        setKnob('a-sustain', preset.ampEnv.sustain);
        setKnob('a-release', preset.ampEnv.release);
    }

    // Effects
    if (preset.effects) {
        setKnob('delay-time', preset.effects.delayTime);
        setKnob('delay-feedback', preset.effects.delayFeedback);
        setKnob('delay-mix', preset.effects.delayMix);
        setKnob('reverb-mix', preset.effects.reverbMix);
    }

    // Glide
    if (preset.glide !== undefined) {
        setKnob('glide', preset.glide);
    }

    // LFOs
    if (preset.lfo1) {
        setKnob('lfo1-rate', preset.lfo1.rate);
        setKnob('lfo1-amount', preset.lfo1.amount);
        document.querySelectorAll('.wave-btn[data-lfo="1"]').forEach(b => {
            b.classList.toggle('active', b.dataset.wave === preset.lfo1.wave);
        });
        state.lfo1.wave = preset.lfo1.wave;
        state.lfo1.dest = preset.lfo1.dest;
        const lfo1DestEl = document.getElementById('lfo1-dest');
        if (lfo1DestEl) lfo1DestEl.value = preset.lfo1.dest;
        if (lfo1Osc) lfo1Osc.type = preset.lfo1.wave;
    }

    if (preset.lfo2) {
        setKnob('lfo2-rate', preset.lfo2.rate);
        setKnob('lfo2-amount', preset.lfo2.amount);
        document.querySelectorAll('.wave-btn[data-lfo="2"]').forEach(b => {
            b.classList.toggle('active', b.dataset.wave === preset.lfo2.wave);
        });
        state.lfo2.wave = preset.lfo2.wave;
        state.lfo2.dest = preset.lfo2.dest;
        const lfo2DestEl = document.getElementById('lfo2-dest');
        if (lfo2DestEl) lfo2DestEl.value = preset.lfo2.dest;
        if (lfo2Osc) lfo2Osc.type = preset.lfo2.wave;
    }

    // Update waveforms on active voices
    updateActiveWaveforms();
}

// Make loadPreset available globally for onclick handlers
if (typeof window !== 'undefined') {
    window.loadPreset = loadPreset;
}
