// Moog Modular Synthesizer - Voice Management

import {
    audioCtx, state, voices, masterGain, noiseGain,
    lfo1Gain, lfo2Gain, lastFrequency, setLastFrequency
} from '../state.js';
import { initAudio } from './audio-context.js';
import { recordNoteOn, recordNoteOff } from '../recorder/song-recorder.js';

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
        const oscFreq = frequency * Math.pow(2, vcoState.octave) * Math.pow(2, vcoState.detune / 1200);

        if (state.master.glide > 0 && lastFrequency) {
            osc.frequency.setValueAtTime(lastFrequency * Math.pow(2, vcoState.octave), audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(oscFreq, audioCtx.currentTime + state.master.glide / 1000);
        } else {
            osc.frequency.value = oscFreq;
        }

        gain.gain.value = state.mixer[`vco${i}`] * 0.3;

        osc.connect(gain);
        voice.oscs.push(osc);
        voice.gains.push(gain);
    }

    // Filter with keyboard tracking
    voice.filter = audioCtx.createBiquadFilter();
    voice.filter.type = 'lowpass';

    const kbdTrackAmount = state.filter.kbdTrack / 100;
    const baseCutoff = state.filter.cutoff;
    const freqRatio = frequency / 261.63; // C4 reference
    const kbdCutoffMod = Math.pow(freqRatio, kbdTrackAmount);
    voice.filterEnvTarget = Math.min(baseCutoff * kbdCutoffMod, 20000);

    voice.filter.frequency.value = voice.filterEnvTarget;
    voice.filter.Q.value = state.filter.resonance / 5;

    // VCA
    voice.vca = audioCtx.createGain();
    voice.vca.gain.value = 0;

    // Connect oscillators to filter
    voice.gains.forEach(g => g.connect(voice.filter));

    // Connect noise
    noiseGain.connect(voice.filter);

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

    // Connect LFOs to destinations
    // LFO 1 connections
    if (state.lfo1.amount > 0) {
        const lfo1Amount = state.lfo1.amount;
        if (state.lfo1.dest === 'pitch') {
            voice.oscs.forEach(osc => {
                const lfo1ToPitch = audioCtx.createGain();
                lfo1ToPitch.gain.value = lfo1Amount * 2; // cents
                lfo1Gain.connect(lfo1ToPitch);
                lfo1ToPitch.connect(osc.detune);
                voice.lfoConnections.push(lfo1ToPitch);
            });
        } else if (state.lfo1.dest === 'filter') {
            const lfo1ToFilter = audioCtx.createGain();
            lfo1ToFilter.gain.value = lfo1Amount * 20; // Hz variation
            lfo1Gain.connect(lfo1ToFilter);
            lfo1ToFilter.connect(voice.filter.detune);
            voice.lfoConnections.push(lfo1ToFilter);
        } else if (state.lfo1.dest === 'amp') {
            const lfo1ToAmp = audioCtx.createGain();
            lfo1ToAmp.gain.value = lfo1Amount / 200;
            lfo1Gain.connect(lfo1ToAmp);
            lfo1ToAmp.connect(voice.vca.gain);
            voice.lfoConnections.push(lfo1ToAmp);
        }
    }

    // LFO 2 connections
    if (state.lfo2.amount > 0) {
        const lfo2Amount = state.lfo2.amount;
        if (state.lfo2.dest === 'pitch') {
            voice.oscs.forEach(osc => {
                const lfo2ToPitch = audioCtx.createGain();
                lfo2ToPitch.gain.value = lfo2Amount * 2;
                lfo2Gain.connect(lfo2ToPitch);
                lfo2ToPitch.connect(osc.detune);
                voice.lfoConnections.push(lfo2ToPitch);
            });
        } else if (state.lfo2.dest === 'filter') {
            const lfo2ToFilter = audioCtx.createGain();
            lfo2ToFilter.gain.value = lfo2Amount * 20;
            lfo2Gain.connect(lfo2ToFilter);
            lfo2ToFilter.connect(voice.filter.detune);
            voice.lfoConnections.push(lfo2ToFilter);
        } else if (state.lfo2.dest === 'amp') {
            const lfo2ToAmp = audioCtx.createGain();
            lfo2ToAmp.gain.value = lfo2Amount / 200;
            lfo2Gain.connect(lfo2ToAmp);
            lfo2ToAmp.connect(voice.vca.gain);
            voice.lfoConnections.push(lfo2ToAmp);
        }
    }

    setLastFrequency(frequency);
    return voice;
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

    setTimeout(() => {
        voice.oscs.forEach(osc => {
            try { osc.stop(); } catch(e) {}
        });
    }, Math.max(releaseTime, filterReleaseTime) * 1000 + 100);
}

/**
 * Trigger a note on
 */
export function noteOn(note, velocity = 1) {
    initAudio();

    if (voices.has(note)) return;

    // Record note if recording
    recordNoteOn(note);

    const frequency = 440 * Math.pow(2, (note - 69) / 12);
    const voice = createVoice(frequency, velocity);
    voices.set(note, voice);

    // Update LEDs
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
