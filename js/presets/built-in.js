// Moog Modular Synthesizer - Built-in Presets

export const presets = {
    init: {
        vco1: { wave: 'sawtooth', octave: 0, detune: 0 },
        vco2: { wave: 'sawtooth', octave: 0, detune: 5 },
        vco3: { wave: 'square', octave: -1, detune: 0 },
        mixer: { vco1: 80, vco2: 60, vco3: 40, noise: 0 },
        filter: { cutoff: 2000, resonance: 30, envAmount: 50, kbdTrack: 50 },
        filterEnv: { attack: 10, decay: 300, sustain: 30, release: 500 },
        ampEnv: { attack: 10, decay: 200, sustain: 70, release: 300 },
        effects: { delayTime: 300, delayFeedback: 30, delayMix: 0, reverbMix: 15 },
        glide: 0
    },
    bass: {
        vco1: { wave: 'sawtooth', octave: -1, detune: 0 },
        vco2: { wave: 'square', octave: -1, detune: 7 },
        vco3: { wave: 'sine', octave: -2, detune: 0 },
        mixer: { vco1: 100, vco2: 70, vco3: 60, noise: 0 },
        filter: { cutoff: 400, resonance: 40, envAmount: 70, kbdTrack: 30 },
        filterEnv: { attack: 5, decay: 200, sustain: 20, release: 200 },
        ampEnv: { attack: 5, decay: 100, sustain: 80, release: 150 },
        effects: { delayTime: 300, delayFeedback: 20, delayMix: 0, reverbMix: 5 },
        glide: 50
    },
    lead: {
        vco1: { wave: 'sawtooth', octave: 0, detune: 0 },
        vco2: { wave: 'sawtooth', octave: 0, detune: 10 },
        vco3: { wave: 'square', octave: 1, detune: 0 },
        mixer: { vco1: 100, vco2: 80, vco3: 30, noise: 0 },
        filter: { cutoff: 3000, resonance: 50, envAmount: 60, kbdTrack: 70 },
        filterEnv: { attack: 10, decay: 400, sustain: 40, release: 400 },
        ampEnv: { attack: 10, decay: 200, sustain: 80, release: 300 },
        effects: { delayTime: 350, delayFeedback: 40, delayMix: 25, reverbMix: 20 },
        glide: 30
    },
    pad: {
        vco1: { wave: 'sawtooth', octave: 0, detune: -5 },
        vco2: { wave: 'sawtooth', octave: 0, detune: 5 },
        vco3: { wave: 'triangle', octave: -1, detune: 0 },
        mixer: { vco1: 70, vco2: 70, vco3: 50, noise: 5 },
        filter: { cutoff: 1500, resonance: 20, envAmount: 30, kbdTrack: 40 },
        filterEnv: { attack: 500, decay: 1000, sustain: 60, release: 2000 },
        ampEnv: { attack: 800, decay: 500, sustain: 70, release: 1500 },
        effects: { delayTime: 400, delayFeedback: 50, delayMix: 30, reverbMix: 50 },
        glide: 100
    },
    brass: {
        vco1: { wave: 'sawtooth', octave: 0, detune: 0 },
        vco2: { wave: 'sawtooth', octave: 0, detune: 3 },
        vco3: { wave: 'square', octave: 0, detune: -3 },
        mixer: { vco1: 80, vco2: 80, vco3: 60, noise: 0 },
        filter: { cutoff: 800, resonance: 30, envAmount: 80, kbdTrack: 60 },
        filterEnv: { attack: 50, decay: 300, sustain: 50, release: 300 },
        ampEnv: { attack: 30, decay: 100, sustain: 85, release: 200 },
        effects: { delayTime: 300, delayFeedback: 20, delayMix: 10, reverbMix: 25 },
        glide: 0
    },
    strings: {
        vco1: { wave: 'sawtooth', octave: 0, detune: -8 },
        vco2: { wave: 'sawtooth', octave: 0, detune: 8 },
        vco3: { wave: 'sawtooth', octave: -1, detune: 0 },
        mixer: { vco1: 60, vco2: 60, vco3: 40, noise: 3 },
        filter: { cutoff: 2500, resonance: 15, envAmount: 20, kbdTrack: 50 },
        filterEnv: { attack: 300, decay: 500, sustain: 70, release: 1000 },
        ampEnv: { attack: 400, decay: 300, sustain: 75, release: 800 },
        effects: { delayTime: 300, delayFeedback: 30, delayMix: 15, reverbMix: 40 },
        glide: 50
    },
    weird: {
        vco1: { wave: 'square', octave: 0, detune: -50 },
        vco2: { wave: 'sawtooth', octave: 1, detune: 50 },
        vco3: { wave: 'triangle', octave: -2, detune: 25 },
        mixer: { vco1: 80, vco2: 60, vco3: 100, noise: 20 },
        filter: { cutoff: 5000, resonance: 80, envAmount: 90, kbdTrack: 100 },
        filterEnv: { attack: 100, decay: 800, sustain: 10, release: 2000 },
        ampEnv: { attack: 50, decay: 400, sustain: 50, release: 1000 },
        effects: { delayTime: 666, delayFeedback: 70, delayMix: 50, reverbMix: 60 },
        glide: 200
    }
};
