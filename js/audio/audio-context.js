// Moog Modular Synthesizer - Audio Context & Effects Setup

import {
    audioCtx, state,
    setAudioContext, setMasterGain, setAnalyser,
    setDelayNode, setDelayFeedback, setDelayMix,
    setReverbNode, setReverbMix,
    setNoiseNode, setNoiseGain,
    setLfo1Osc, setLfo1Gain, setLfo2Osc, setLfo2Gain
} from '../state.js';
import { drawOscilloscope } from '../ui/visualizations.js';

/**
 * Create white noise generator
 */
function createNoiseGenerator(ctx) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    whiteNoise.start();

    return whiteNoise;
}

/**
 * Create synthetic reverb impulse response
 */
function createReverbImpulse(ctx, reverbNode) {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * 2;
    const impulse = ctx.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
        }
    }

    reverbNode.buffer = impulse;
}

/**
 * Initialize the audio context and all effects
 */
export function initAudio() {
    if (audioCtx) return;

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(ctx);

    // Master gain
    const masterGainNode = ctx.createGain();
    masterGainNode.gain.value = state.master.volume;
    setMasterGain(masterGainNode);

    // Analyser for oscilloscope
    const analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 2048;
    setAnalyser(analyserNode);

    // Delay effect
    const delay = ctx.createDelay(2);
    delay.delayTime.value = state.effects.delayTime / 1000;
    setDelayNode(delay);

    const delayFb = ctx.createGain();
    delayFb.gain.value = state.effects.delayFeedback / 100;
    setDelayFeedback(delayFb);

    const delayMixNode = ctx.createGain();
    delayMixNode.gain.value = state.effects.delayMix / 100;
    setDelayMix(delayMixNode);

    const delayDry = ctx.createGain();
    delayDry.gain.value = 1;

    // Reverb (convolution)
    const reverb = ctx.createConvolver();
    setReverbNode(reverb);

    const reverbMixNode = ctx.createGain();
    reverbMixNode.gain.value = state.effects.reverbMix / 100;
    setReverbMix(reverbMixNode);

    const reverbDry = ctx.createGain();
    reverbDry.gain.value = 1;

    // Create impulse response for reverb
    createReverbImpulse(ctx, reverb);

    // Noise generator
    const noise = createNoiseGenerator(ctx);
    const noiseGainNode = ctx.createGain();
    noiseGainNode.gain.value = 0;
    noise.connect(noiseGainNode);
    setNoiseNode(noise);
    setNoiseGain(noiseGainNode);

    // Routing
    masterGainNode.connect(delayDry);
    masterGainNode.connect(delay);
    delay.connect(delayFb);
    delayFb.connect(delay);
    delay.connect(delayMixNode);

    delayDry.connect(reverbDry);
    delayMixNode.connect(reverbDry);
    delayDry.connect(reverb);
    delayMixNode.connect(reverb);

    reverb.connect(reverbMixNode);
    reverbDry.connect(analyserNode);
    reverbMixNode.connect(analyserNode);

    analyserNode.connect(ctx.destination);

    // Create LFOs
    const lfo1OscNode = ctx.createOscillator();
    lfo1OscNode.type = state.lfo1.wave;
    lfo1OscNode.frequency.value = state.lfo1.rate;
    const lfo1GainNode = ctx.createGain();
    lfo1GainNode.gain.value = state.lfo1.amount;
    lfo1OscNode.connect(lfo1GainNode);
    lfo1OscNode.start();
    setLfo1Osc(lfo1OscNode);
    setLfo1Gain(lfo1GainNode);

    const lfo2OscNode = ctx.createOscillator();
    lfo2OscNode.type = state.lfo2.wave;
    lfo2OscNode.frequency.value = state.lfo2.rate;
    const lfo2GainNode = ctx.createGain();
    lfo2GainNode.gain.value = state.lfo2.amount;
    lfo2OscNode.connect(lfo2GainNode);
    lfo2OscNode.start();
    setLfo2Osc(lfo2OscNode);
    setLfo2Gain(lfo2GainNode);

    // Start oscilloscope
    drawOscilloscope();
}
