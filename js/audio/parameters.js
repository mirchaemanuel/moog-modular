// Moog Modular Synthesizer - Real-time Parameter Updates

import {
    audioCtx, state, voices,
    masterGain, noiseGain,
    delayNode, delayFeedback, delayMix, reverbMix,
    lfo1Osc, lfo1Gain, lfo2Osc, lfo2Gain
} from '../state.js';
import { drawEnvelope } from '../ui/visualizations.js';

/**
 * Update all active voices in real-time (frequency, filter, gains)
 */
export function updateActiveVoices() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    voices.forEach((voice, note) => {
        // Update oscillator frequencies and detune
        const baseFreq = 440 * Math.pow(2, (note - 69) / 12);

        for (let i = 0; i < 3; i++) {
            const vcoState = state[`vco${i + 1}`];
            const oscFreq = baseFreq * Math.pow(2, vcoState.octave) * Math.pow(2, vcoState.detune / 1200);
            voice.oscs[i].frequency.setTargetAtTime(oscFreq, now, 0.01);
            voice.gains[i].gain.setTargetAtTime(state.mixer[`vco${i + 1}`] * 0.3, now, 0.01);
        }

        // Update filter in real-time
        voice.filter.frequency.setTargetAtTime(state.filter.cutoff, now, 0.02);
        voice.filter.Q.setTargetAtTime(state.filter.resonance / 5, now, 0.02);
    });
}

/**
 * Update envelope sustain levels in real-time
 */
export function updateActiveEnvelopes() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    voices.forEach((voice) => {
        // Update amp envelope sustain level
        const ampSustain = state.ampEnv.sustain / 100;
        voice.vca.gain.cancelScheduledValues(now);
        voice.vca.gain.setTargetAtTime(ampSustain, now, 0.03);

        // Update filter envelope sustain level
        const filterEnvAmount = (state.filter.envAmount / 100) * state.filter.cutoff;
        const filterStart = Math.max(state.filter.cutoff - filterEnvAmount, 20);
        const filterPeak = Math.min(state.filter.cutoff + filterEnvAmount * 0.5, 20000);
        const filterSustain = filterStart + (filterPeak - filterStart) * (state.filterEnv.sustain / 100);

        voice.filter.frequency.cancelScheduledValues(now);
        voice.filter.frequency.setTargetAtTime(Math.max(filterSustain, 20), now, 0.03);
    });
}

/**
 * Update waveforms on active voices in real-time
 */
export function updateActiveWaveforms() {
    voices.forEach((voice) => {
        for (let i = 0; i < 3; i++) {
            const vcoState = state[`vco${i + 1}`];
            voice.oscs[i].type = vcoState.wave;
        }
    });
}

/**
 * Apply a parameter change
 */
export function applyParameter(param, value) {
    switch(param) {
        case 'vco1-octave':
            state.vco1.octave = value;
            updateActiveVoices();
            break;
        case 'vco1-detune':
            state.vco1.detune = value;
            updateActiveVoices();
            break;
        case 'vco1-pw': state.vco1.pw = value; break;
        case 'vco2-octave':
            state.vco2.octave = value;
            updateActiveVoices();
            break;
        case 'vco2-detune':
            state.vco2.detune = value;
            updateActiveVoices();
            break;
        case 'vco2-pw': state.vco2.pw = value; break;
        case 'vco3-octave':
            state.vco3.octave = value;
            updateActiveVoices();
            break;
        case 'vco3-detune':
            state.vco3.detune = value;
            updateActiveVoices();
            break;
        case 'vco3-pw': state.vco3.pw = value; break;
        case 'mix1':
            state.mixer.vco1 = value / 100;
            updateActiveVoices();
            break;
        case 'mix2':
            state.mixer.vco2 = value / 100;
            updateActiveVoices();
            break;
        case 'mix3':
            state.mixer.vco3 = value / 100;
            updateActiveVoices();
            break;
        case 'noise':
            state.mixer.noise = value / 100;
            if (noiseGain) noiseGain.gain.value = value / 100 * 0.3;
            break;
        case 'cutoff':
            state.filter.cutoff = value;
            updateActiveVoices();
            break;
        case 'resonance':
            state.filter.resonance = value;
            updateActiveVoices();
            break;
        case 'filter-env': state.filter.envAmount = value; break;
        case 'filter-kbd': state.filter.kbdTrack = value; break;
        case 'f-attack':
            state.filterEnv.attack = value;
            drawEnvelope('filter-env-display', state.filterEnv.attack, state.filterEnv.decay, state.filterEnv.sustain, state.filterEnv.release);
            break;
        case 'f-decay':
            state.filterEnv.decay = value;
            drawEnvelope('filter-env-display', state.filterEnv.attack, state.filterEnv.decay, state.filterEnv.sustain, state.filterEnv.release);
            updateActiveEnvelopes();
            break;
        case 'f-sustain':
            state.filterEnv.sustain = value;
            drawEnvelope('filter-env-display', state.filterEnv.attack, state.filterEnv.decay, state.filterEnv.sustain, state.filterEnv.release);
            updateActiveEnvelopes();
            break;
        case 'f-release':
            state.filterEnv.release = value;
            drawEnvelope('filter-env-display', state.filterEnv.attack, state.filterEnv.decay, state.filterEnv.sustain, state.filterEnv.release);
            break;
        case 'a-attack':
            state.ampEnv.attack = value;
            drawEnvelope('amp-env-display', state.ampEnv.attack, state.ampEnv.decay, state.ampEnv.sustain, state.ampEnv.release);
            break;
        case 'a-decay':
            state.ampEnv.decay = value;
            drawEnvelope('amp-env-display', state.ampEnv.attack, state.ampEnv.decay, state.ampEnv.sustain, state.ampEnv.release);
            updateActiveEnvelopes();
            break;
        case 'a-sustain':
            state.ampEnv.sustain = value;
            drawEnvelope('amp-env-display', state.ampEnv.attack, state.ampEnv.decay, state.ampEnv.sustain, state.ampEnv.release);
            updateActiveEnvelopes();
            break;
        case 'a-release':
            state.ampEnv.release = value;
            drawEnvelope('amp-env-display', state.ampEnv.attack, state.ampEnv.decay, state.ampEnv.sustain, state.ampEnv.release);
            break;
        case 'lfo1-rate':
            state.lfo1.rate = value;
            if (lfo1Osc) lfo1Osc.frequency.value = value;
            break;
        case 'lfo1-amount':
            state.lfo1.amount = value;
            if (lfo1Gain) lfo1Gain.gain.value = value;
            break;
        case 'lfo2-rate':
            state.lfo2.rate = value;
            if (lfo2Osc) lfo2Osc.frequency.value = value;
            break;
        case 'lfo2-amount':
            state.lfo2.amount = value;
            if (lfo2Gain) lfo2Gain.gain.value = value;
            break;
        case 'delay-time':
            state.effects.delayTime = value;
            if (delayNode) delayNode.delayTime.value = value / 1000;
            break;
        case 'delay-feedback':
            state.effects.delayFeedback = value;
            if (delayFeedback) delayFeedback.gain.value = value / 100;
            break;
        case 'delay-mix':
            state.effects.delayMix = value;
            if (delayMix) delayMix.gain.value = value / 100;
            break;
        case 'reverb-mix':
            state.effects.reverbMix = value;
            if (reverbMix) reverbMix.gain.value = value / 100;
            break;
        case 'glide': state.master.glide = value; break;
        case 'master-vol':
            state.master.volume = value / 100;
            if (masterGain) masterGain.gain.value = value / 100;
            break;
    }
}
