// Moog Modular Synthesizer - User Presets (localStorage)

import { state } from '../state.js';
import { loadPresetData } from './preset-manager.js';

const USER_PRESETS_KEY = 'moog-modular-user-presets';

/**
 * Get user presets from localStorage
 */
export function getUserPresets() {
    const stored = localStorage.getItem(USER_PRESETS_KEY);
    return stored ? JSON.parse(stored) : {};
}

/**
 * Save user presets to localStorage
 */
export function saveUserPresets(presets) {
    localStorage.setItem(USER_PRESETS_KEY, JSON.stringify(presets));
}

/**
 * Get current synth state as a preset object
 */
export function getCurrentStateAsPreset() {
    return {
        vco1: { wave: state.vco1.wave, octave: state.vco1.octave, detune: state.vco1.detune },
        vco2: { wave: state.vco2.wave, octave: state.vco2.octave, detune: state.vco2.detune },
        vco3: { wave: state.vco3.wave, octave: state.vco3.octave, detune: state.vco3.detune },
        mixer: {
            vco1: Math.round(state.mixer.vco1 * 100),
            vco2: Math.round(state.mixer.vco2 * 100),
            vco3: Math.round(state.mixer.vco3 * 100),
            noise: Math.round(state.mixer.noise * 100)
        },
        filter: {
            cutoff: state.filter.cutoff,
            resonance: state.filter.resonance,
            envAmount: state.filter.envAmount,
            kbdTrack: state.filter.kbdTrack
        },
        filterEnv: { ...state.filterEnv },
        ampEnv: { ...state.ampEnv },
        effects: { ...state.effects },
        glide: state.master.glide,
        lfo1: { ...state.lfo1 },
        lfo2: { ...state.lfo2 }
    };
}

/**
 * Update the preset dropdown with user presets
 */
export function updatePresetDropdown() {
    const select = document.getElementById('user-presets');
    if (!select) return;

    const userPresets = getUserPresets();

    // Clear existing options except the first one
    select.innerHTML = '<option value="">-- Select --</option>';

    // Add user presets
    Object.keys(userPresets).sort().forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

/**
 * Initialize preset manager UI
 */
export function initPresetManager() {
    updatePresetDropdown();

    // Load button
    const loadBtn = document.getElementById('load-preset-btn');
    if (loadBtn) {
        loadBtn.addEventListener('click', () => {
            const select = document.getElementById('user-presets');
            const presetName = select.value;

            if (!presetName) {
                alert('Select a preset first!');
                return;
            }

            const userPresets = getUserPresets();
            if (userPresets[presetName]) {
                loadPresetData(userPresets[presetName]);
            }
        });
    }

    // Save button
    const saveBtn = document.getElementById('save-preset-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const name = prompt('Enter preset name:');
            if (!name || !name.trim()) return;

            const cleanName = name.trim();
            const userPresets = getUserPresets();

            if (userPresets[cleanName]) {
                if (!confirm(`Overwrite "${cleanName}"?`)) return;
            }

            userPresets[cleanName] = getCurrentStateAsPreset();
            saveUserPresets(userPresets);
            updatePresetDropdown();

            // Select the newly saved preset
            const select = document.getElementById('user-presets');
            if (select) select.value = cleanName;
            alert(`Preset "${cleanName}" saved!`);
        });
    }

    // Delete button
    const deleteBtn = document.getElementById('delete-preset-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            const select = document.getElementById('user-presets');
            const presetName = select.value;

            if (!presetName) {
                alert('Select a preset first!');
                return;
            }

            if (!confirm(`Delete "${presetName}"?`)) return;

            const userPresets = getUserPresets();
            delete userPresets[presetName];
            saveUserPresets(userPresets);
            updatePresetDropdown();
        });
    }
}
