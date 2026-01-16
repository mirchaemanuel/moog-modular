// Moog Modular Synthesizer - Main Application Entry Point

// State
import { state, voices } from './state.js';

// Audio
import { initAudio } from './audio/audio-context.js';
import { noteOn, noteOff } from './audio/voice-manager.js';

// UI
import { initKnobs } from './ui/knobs.js';
import { createKeyboard } from './ui/keyboard.js';
import { drawEnvelope } from './ui/visualizations.js';
import { initWaveSelectors } from './ui/wave-selectors.js';

// Presets
import { loadPreset } from './presets/preset-manager.js';
import { initPresetManager } from './presets/user-presets.js';

// Sequencer
import { initDemoButtons } from './sequencer/demo-player.js';
import { initSongPlayer } from './sequencer/song-player.js';

// Recorder
import { initRecording } from './recorder/audio-recorder.js';

/**
 * Initialize the application
 */
function init() {
    // Create keyboard
    createKeyboard();

    // Initialize knobs
    initKnobs();

    // Initialize wave selectors
    initWaveSelectors();

    // Initialize demo buttons
    initDemoButtons();

    // Initialize recording
    initRecording();

    // Initialize preset manager
    initPresetManager();

    // Initialize song player
    initSongPlayer();

    // Draw initial envelopes
    drawEnvelope('filter-env-display', state.filterEnv.attack, state.filterEnv.decay, state.filterEnv.sustain, state.filterEnv.release);
    drawEnvelope('amp-env-display', state.ampEnv.attack, state.ampEnv.decay, state.ampEnv.sustain, state.ampEnv.release);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Export public API for global access
export {
    state,
    voices,
    initAudio,
    noteOn,
    noteOff,
    loadPreset
};
