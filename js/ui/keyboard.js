// Moog Modular Synthesizer - Piano Keyboard

import { state } from '../state.js';
import { noteOn, noteOff } from '../audio/voice-manager.js';

// Keyboard mapping constants
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_NOTES = [1, 3, 6, 8, 10]; // Indices of black keys in octave
const WHITE_KEY_WIDTH = 28;
const BASE_NOTE = 60; // C4

// Base keyboard mapping (relative offsets from base note)
const KEY_OFFSETS = {
    'a': 0, 'w': 1, 's': 2, 'e': 3, 'd': 4, 'f': 5, 't': 6,
    'g': 7, 'y': 8, 'h': 9, 'u': 10, 'j': 11, 'k': 12, 'o': 13, 'l': 14
};

/**
 * Update keyboard labels based on octave shift
 */
export function updateKeyboardLabels() {
    // Remove all existing key labels
    document.querySelectorAll('.key-label').forEach(label => {
        if (!label.closest('.octave-marker')) {
            label.remove();
        }
    });

    // Add labels at current octave position
    const currentBase = BASE_NOTE + (state.octaveShift * 12);
    Object.entries(KEY_OFFSETS).forEach(([keyChar, offset]) => {
        const midi = currentBase + offset;
        const keyEl = document.querySelector(`[data-midi="${midi}"]`);
        if (keyEl) {
            const label = document.createElement('span');
            label.className = 'key-label';
            label.textContent = keyChar.toUpperCase();
            keyEl.appendChild(label);
        }
    });
}

/**
 * Calculate MIDI note from key press
 */
function getMidiFromKey(key) {
    if (KEY_OFFSETS[key] !== undefined) {
        return BASE_NOTE + (state.octaveShift * 12) + KEY_OFFSETS[key];
    }
    return null;
}

/**
 * Create the piano keyboard
 */
export function createKeyboard() {
    const keyboard = document.getElementById('keyboard');
    if (!keyboard) return;

    let whiteKeyIndex = 0;

    // Generate notes from C2 (36) to C6 (84)
    for (let midi = 36; midi <= 84; midi++) {
        const noteIndex = midi % 12;
        const octave = Math.floor(midi / 12) - 1;
        const noteName = NOTE_NAMES[noteIndex];
        const isBlack = BLACK_NOTES.includes(noteIndex);

        const key = document.createElement('div');
        key.dataset.midi = midi;

        if (isBlack) {
            key.className = 'black-key';
            key.style.left = `${whiteKeyIndex * WHITE_KEY_WIDTH - 9}px`;
        } else {
            key.className = 'white-key';

            // Add octave marker on C notes
            if (noteName === 'C') {
                const marker = document.createElement('span');
                marker.className = 'octave-marker';
                marker.textContent = `C${octave}`;
                key.appendChild(marker);
            }

            whiteKeyIndex++;
        }

        // Mouse events
        key.addEventListener('mousedown', (e) => {
            e.preventDefault();
            noteOn(midi);
            key.classList.add('pressed');
        });

        key.addEventListener('mouseup', () => {
            noteOff(midi);
            key.classList.remove('pressed');
        });

        key.addEventListener('mouseleave', () => {
            noteOff(midi);
            key.classList.remove('pressed');
        });

        keyboard.appendChild(key);
    }

    // Initial label setup
    updateKeyboardLabels();

    // Keyboard key press handler
    document.addEventListener('keydown', (e) => {
        if (e.repeat) return;
        const key = e.key.toLowerCase();

        if (key === 'z') {
            state.octaveShift = Math.max(state.octaveShift - 1, -2);
            updateKeyboardLabels();
            return;
        }
        if (key === 'x') {
            state.octaveShift = Math.min(state.octaveShift + 1, 2);
            updateKeyboardLabels();
            return;
        }

        const midi = getMidiFromKey(key);
        if (midi !== null && midi >= 36 && midi <= 84) {
            noteOn(midi);
            const keyEl = document.querySelector(`[data-midi="${midi}"]`);
            if (keyEl) keyEl.classList.add('pressed');
        }
    });

    // Keyboard key release handler
    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        const midi = getMidiFromKey(key);
        if (midi !== null && midi >= 36 && midi <= 84) {
            noteOff(midi);
            const keyEl = document.querySelector(`[data-midi="${midi}"]`);
            if (keyEl) keyEl.classList.remove('pressed');
        }
    });
}
