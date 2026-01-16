// Moog Modular Synthesizer - Wave Selector Buttons

import { state, lfo1Osc, lfo2Osc } from '../state.js';
import { updateActiveWaveforms } from '../audio/parameters.js';

/**
 * Initialize wave selector buttons for VCOs and LFOs
 */
export function initWaveSelectors() {
    // VCO wave selectors
    document.querySelectorAll('.wave-btn[data-vco]').forEach(btn => {
        btn.addEventListener('click', () => {
            const vco = btn.dataset.vco;
            const wave = btn.dataset.wave;

            document.querySelectorAll(`.wave-btn[data-vco="${vco}"]`).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            state[`vco${vco}`].wave = wave;
            updateActiveWaveforms();
        });
    });

    // LFO wave selectors
    document.querySelectorAll('.wave-btn[data-lfo]').forEach(btn => {
        btn.addEventListener('click', () => {
            const lfo = btn.dataset.lfo;
            const wave = btn.dataset.wave;

            document.querySelectorAll(`.wave-btn[data-lfo="${lfo}"]`).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            state[`lfo${lfo}`].wave = wave;

            // Update LFO oscillator waveform in real-time
            if (lfo === '1' && lfo1Osc) lfo1Osc.type = wave;
            if (lfo === '2' && lfo2Osc) lfo2Osc.type = wave;
        });
    });

    // LFO destination selectors
    const lfo1Dest = document.getElementById('lfo1-dest');
    if (lfo1Dest) {
        lfo1Dest.addEventListener('change', (e) => {
            state.lfo1.dest = e.target.value;
        });
    }

    const lfo2Dest = document.getElementById('lfo2-dest');
    if (lfo2Dest) {
        lfo2Dest.addEventListener('change', (e) => {
            state.lfo2.dest = e.target.value;
        });
    }
}
