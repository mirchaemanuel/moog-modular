// Moog Modular Synthesizer - Voice Management

import {
    audioCtx, state, voices, masterGain, noiseGain,
    lfo1Gain, lfo2Gain, lastFrequency, setLastFrequency
} from '../state.js';
import { initAudio } from './audio-context.js';
import { recordNoteOn, recordNoteOff } from '../recorder/song-recorder.js';

// Audio constants
const OSC_GAIN_SCALE = 0.3;
const CENTS_PER_SEMITONE = 1200;
const C4_FREQUENCY = 261.63;
const RESONANCE_SCALE = 5;

/**
 * Connect an LFO to a voice's modulation destination
 */
function connectLfo(voice, lfoState, lfoGainNode) {
    if (lfoState.amount <= 0) return;

    const amount = lfoState.amount;
    if (lfoState.dest === 'pitch') {
        voice.oscs.forEach(osc => {
            const gain = audioCtx.createGain();
            gain.gain.value = amount * 2;
            lfoGainNode.connect(gain);
            gain.connect(osc.detune);
            voice.lfoConnections.push(gain);
        });
    } else if (lfoState.dest === 'filter') {
        const gain = audioCtx.createGain();
        gain.gain.value = amount * 20;
        lfoGainNode.connect(gain);
        gain.connect(voice.filter.detune);
        voice.lfoConnections.push(gain);
    } else if (lfoState.dest === 'amp') {
        const gain = audioCtx.createGain();
        gain.gain.value = amount / 200;
        lfoGainNode.connect(gain);
        gain.connect(voice.vca.gain);
        voice.lfoConnections.push(gain);
    }
}

/**
 * Create a voice with oscillators, filter, and envelopes
 */
export function createVoice(frequency, velocity = 1) {
    const voice = {
        oscs: [],
        gains: [],
        filter: null,
        vca: null,
        filterEnvTarget: null,
        lfoConnections: []
    };

    // Create oscillators
    for (let i = 1; i <= 3; i++) {
        const vcoState = state[`vco${i}`];
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = vcoState.wave;
        const oscFreq = frequency * Math.pow(2, vcoState.octave) * Math.pow(2, vcoState.detune / CENTS_PER_SEMITONE);

        if (state.master.glide > 0 && lastFrequency) {
            osc.frequency.setValueAtTime(lastFrequency * Math.pow(2, vcoState.octave), audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(oscFreq, audioCtx.currentTime + state.master.glide / 1000);
        } else {
            osc.frequency.value = oscFreq;
        }

        gain.gain.value = (state.mixer[`vco${i}`] / 100) * OSC_GAIN_SCALE;

        osc.connect(gain);
        voice.oscs.push(osc);
        voice.gains.push(gain);
    }

    // Filter with keyboard tracking
    voice.filter = audioCtx.createBiquadFilter();
    voice.filter.type = 'lowpass';

    const kbdTrackAmount = state.filter.kbdTrack / 100;
    const baseCutoff = state.filter.cutoff;
    const freqRatio = frequency / C4_FREQUENCY;
    const kbdCutoffMod = Math.pow(freqRatio, kbdTrackAmount);
    voice.filterEnvTarget = Math.min(baseCutoff * kbdCutoffMod, 20000);

    voice.filter.frequency.value = voice.filterEnvTarget;
    voice.filter.Q.value = state.filter.resonance / RESONANCE_SCALE;

    // VCA
    voice.vca = audioCtx.createGain();
    voice.vca.gain.value = 0;

    // Connect oscillators to filter
    voice.gains.forEach(g => g.connect(voice.filter));

    // Connect noise (per-voice gain to compensate for shared noise node)
    voice.noiseVoiceGain = audioCtx.createGain();
    voice.noiseVoiceGain.gain.value = (state.mixer.noise / 100) * OSC_GAIN_SCALE;
    noiseGain.connect(voice.noiseVoiceGain);
    voice.noiseVoiceGain.connect(voice.filter);

    // Connect filter to VCA
    voice.filter.connect(voice.vca);
    voice.vca.connect(masterGain);

    // Apply envelopes
    const now = audioCtx.currentTime;

    // Filter envelope
    const filterEnvAmount = (state.filter.envAmount / 100) * voice.filterEnvTarget;
    const filterStart = Math.max(voice.filterEnvTarget - filterEnvAmount, 20);
    const filterPeak = Math.min(voice.filterEnvTarget + filterEnvAmount * 0.5, 20000);
    const filterSustain = filterStart + (filterPeak - filterStart) * (state.filterEnv.sustain / 100);

    voice.filter.frequency.setValueAtTime(filterStart, now);
    voice.filter.frequency.linearRampToValueAtTime(filterPeak, now + state.filterEnv.attack / 1000);
    voice.filter.frequency.linearRampToValueAtTime(filterSustain, now + (state.filterEnv.attack + state.filterEnv.decay) / 1000);

    // Amp envelope
    const peakVol = velocity;
    const sustainVol = peakVol * (state.ampEnv.sustain / 100);

    voice.vca.gain.setValueAtTime(0, now);
    voice.vca.gain.linearRampToValueAtTime(peakVol, now + state.ampEnv.attack / 1000);
    voice.vca.gain.linearRampToValueAtTime(sustainVol, now + (state.ampEnv.attack + state.ampEnv.decay) / 1000);

    // Start oscillators
    voice.oscs.forEach(osc => osc.start());

    // Connect LFOs to voice destinations
    connectLfo(voice, state.lfo1, lfo1Gain);
    connectLfo(voice, state.lfo2, lfo2Gain);

    setLastFrequency(frequency);
    return voice;
}

/**
 * Fully disconnect and clean up all audio nodes in a voice
 */
function cleanupVoice(voice) {
    voice.oscs.forEach(osc => {
        try { osc.stop(); } catch(e) {}
        try { osc.disconnect(); } catch(e) {}
    });
    voice.gains.forEach(g => {
        try { g.disconnect(); } catch(e) {}
    });
    voice.lfoConnections.forEach(node => {
        try { node.disconnect(); } catch(e) {}
    });
    if (voice.noiseVoiceGain) {
        try { noiseGain.disconnect(voice.noiseVoiceGain); } catch(e) {}
        try { voice.noiseVoiceGain.disconnect(); } catch(e) {}
    }
    try { voice.filter.disconnect(); } catch(e) {}
    try { voice.vca.disconnect(); } catch(e) {}
    voice.oscs = [];
    voice.gains = [];
    voice.lfoConnections = [];
}

/**
 * Release a voice with envelope release
 */
export function releaseVoice(voice) {
    const now = audioCtx.currentTime;
    const releaseTime = state.ampEnv.release / 1000;
    const filterReleaseTime = state.filterEnv.release / 1000;

    voice.vca.gain.cancelScheduledValues(now);
    voice.vca.gain.setValueAtTime(voice.vca.gain.value, now);
    voice.vca.gain.linearRampToValueAtTime(0, now + releaseTime);

    voice.filter.frequency.cancelScheduledValues(now);
    voice.filter.frequency.setValueAtTime(voice.filter.frequency.value, now);
    voice.filter.frequency.linearRampToValueAtTime(20, now + filterReleaseTime);

    const cleanupDelay = Math.max(releaseTime, filterReleaseTime) * 1000 + 100;
    voice._cleanupTimer = setTimeout(() => {
        cleanupVoice(voice);
    }, cleanupDelay);
}

/**
 * Trigger a note on
 */
export function noteOn(note, velocity = 1) {
    initAudio();

    // If same note is still releasing, force-cleanup the old voice immediately
    if (voices.has(note)) {
        const oldVoice = voices.get(note);
        if (oldVoice._cleanupTimer) {
            clearTimeout(oldVoice._cleanupTimer);
        }
        cleanupVoice(oldVoice);
        voices.delete(note);
    }

    // Record note if recording
    recordNoteOn(note);

    const frequency = 440 * Math.pow(2, (note - 69) / 12);
    const voice = createVoice(frequency, velocity);
    voices.set(note, voice);

    // Update LEDs and start oscilloscope
    document.getElementById('vco1-led')?.classList.add('on');
    document.getElementById('vco2-led')?.classList.add('on');
    document.getElementById('vco3-led')?.classList.add('on');
    document.getElementById('master-led')?.classList.add('on');
}

/**
 * Trigger a note off
 */
export function noteOff(note) {
    // Record note off if recording
    recordNoteOff(note);

    const voice = voices.get(note);
    if (voice) {
        releaseVoice(voice);
        voices.delete(note);
    }

    if (voices.size === 0) {
        document.getElementById('vco1-led')?.classList.remove('on');
        document.getElementById('vco2-led')?.classList.remove('on');
        document.getElementById('vco3-led')?.classList.remove('on');
        document.getElementById('master-led')?.classList.remove('on');
    }
}
