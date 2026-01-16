// Moog Modular Synthesizer - Central State Management

// Audio Context and global nodes (populated by audio-context.js)
export let audioCtx = null;
export let masterGain = null;
export let analyser = null;
export let delayNode = null;
export let delayFeedback = null;
export let delayMix = null;
export let reverbNode = null;
export let reverbMix = null;
export let noiseNode = null;
export let noiseGain = null;

// LFO nodes
export let lfo1Osc = null;
export let lfo1Gain = null;
export let lfo2Osc = null;
export let lfo2Gain = null;

// Setters for audio nodes (called by audio-context.js)
export function setAudioContext(ctx) { audioCtx = ctx; }
export function setMasterGain(gain) { masterGain = gain; }
export function setAnalyser(a) { analyser = a; }
export function setDelayNode(node) { delayNode = node; }
export function setDelayFeedback(fb) { delayFeedback = fb; }
export function setDelayMix(mix) { delayMix = mix; }
export function setReverbNode(node) { reverbNode = node; }
export function setReverbMix(mix) { reverbMix = mix; }
export function setNoiseNode(node) { noiseNode = node; }
export function setNoiseGain(gain) { noiseGain = gain; }
export function setLfo1Osc(osc) { lfo1Osc = osc; }
export function setLfo1Gain(gain) { lfo1Gain = gain; }
export function setLfo2Osc(osc) { lfo2Osc = osc; }
export function setLfo2Gain(gain) { lfo2Gain = gain; }

// Synth state
export const state = {
    vco1: { wave: 'sawtooth', octave: 0, detune: 0, pw: 50 },
    vco2: { wave: 'sawtooth', octave: 0, detune: 5, pw: 50 },
    vco3: { wave: 'square', octave: -1, detune: 0, pw: 50 },
    mixer: { vco1: 0.8, vco2: 0.6, vco3: 0.4, noise: 0 },
    filter: { cutoff: 2000, resonance: 30, envAmount: 50, kbdTrack: 50 },
    filterEnv: { attack: 10, decay: 300, sustain: 30, release: 500 },
    ampEnv: { attack: 10, decay: 200, sustain: 70, release: 300 },
    lfo1: { wave: 'triangle', rate: 5, amount: 0, dest: 'pitch' },
    lfo2: { wave: 'sine', rate: 1, amount: 0, dest: 'filter' },
    effects: { delayTime: 300, delayFeedback: 30, delayMix: 0, reverbMix: 15 },
    master: { volume: 0.7, glide: 0 },
    octaveShift: 0
};

// Active voices
export const voices = new Map();

// Last frequency for glide
export let lastFrequency = null;
export function setLastFrequency(freq) { lastFrequency = freq; }
