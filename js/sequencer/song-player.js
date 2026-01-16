// Moog Modular Synthesizer - Song Player (Import & Playback)

import { voices } from '../state.js';
import { initAudio } from '../audio/audio-context.js';
import { noteOn, noteOff, releaseVoice } from '../audio/voice-manager.js';
import { loadPreset } from '../presets/preset-manager.js';
import { presets } from '../presets/built-in.js';
import { noteNameToMidi } from '../utils/note-converter.js';
import { stopDemo } from './demo-player.js';

// Imported song state
let importedSong = null;
let importedSongTimeouts = [];

/**
 * Parse song text format
 * Format: time:noteName:duration
 * Comments start with #
 */
export function parseSongText(text) {
    const lines = text.split('\n');
    const song = {
        preset: 'init',
        notes: []
    };

    lines.forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) {
            // Check for preset in comments
            const presetMatch = line.match(/^#\s*preset:\s*(\w+)/i);
            if (presetMatch) {
                song.preset = presetMatch[1];
            }
            return;
        }

        const parts = line.split(':');
        if (parts.length >= 3) {
            const time = parseInt(parts[0]);
            const noteName = parts[1];
            const duration = parseInt(parts[2]);
            const midi = noteNameToMidi(noteName);

            if (!isNaN(time) && midi !== null && !isNaN(duration)) {
                song.notes.push({ note: midi, time, duration });
            }
        }
    });

    return song;
}

/**
 * Play imported song
 */
export function playImportedSong() {
    if (!importedSong || importedSong.notes.length === 0) {
        alert('No song imported! Use IMPORT first.');
        return;
    }

    // Stop any playing demo first
    stopDemo();
    stopImportedSong();
    initAudio();

    // Load preset if specified
    if (importedSong.preset && presets[importedSong.preset]) {
        loadPreset(importedSong.preset);
    }

    importedSong.notes.forEach(event => {
        const noteOnTimeout = setTimeout(() => {
            noteOn(event.note);
            const keyEl = document.querySelector(`[data-midi="${event.note}"]`);
            if (keyEl) keyEl.classList.add('pressed');
        }, event.time);

        const noteOffTimeout = setTimeout(() => {
            noteOff(event.note);
            const keyEl = document.querySelector(`[data-midi="${event.note}"]`);
            if (keyEl) keyEl.classList.remove('pressed');
        }, event.time + event.duration);

        importedSongTimeouts.push(noteOnTimeout, noteOffTimeout);
    });

    // Update play button
    const playBtn = document.getElementById('play-song-btn');
    if (playBtn) {
        playBtn.textContent = '⏹️ STOP';
        playBtn.classList.add('playing');
    }

    // Auto-reset after song ends
    const maxTime = Math.max(...importedSong.notes.map(n => n.time + n.duration));
    setTimeout(() => {
        const playBtn = document.getElementById('play-song-btn');
        if (playBtn) {
            playBtn.textContent = '▶️ PLAY';
            playBtn.classList.remove('playing');
        }
    }, maxTime + 100);
}

/**
 * Stop imported song playback
 */
export function stopImportedSong() {
    importedSongTimeouts.forEach(t => clearTimeout(t));
    importedSongTimeouts = [];

    // Release all notes
    voices.forEach((voice, note) => {
        releaseVoice(voice);
        const keyEl = document.querySelector(`[data-midi="${note}"]`);
        if (keyEl) keyEl.classList.remove('pressed');
    });
    voices.clear();

    const playBtn = document.getElementById('play-song-btn');
    if (playBtn) {
        playBtn.textContent = '▶️ PLAY';
        playBtn.classList.remove('playing');
    }
}

/**
 * Initialize song player UI
 */
export function initSongPlayer() {
    const importBtn = document.getElementById('import-song-btn');
    const playBtn = document.getElementById('play-song-btn');

    if (importBtn) {
        // Create persistent hidden file input for better browser compatibility
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const text = evt.target.result;
                    importedSong = parseSongText(text);
                    if (importedSong && importedSong.notes.length > 0) {
                        alert(`Song imported: ${importedSong.notes.length} notes, preset: ${importedSong.preset || 'default'}`);
                    } else {
                        alert('Invalid song file or no notes found.');
                    }
                };
                reader.readAsText(file);
            }
            // Reset input so same file can be selected again
            fileInput.value = '';
        });

        importBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }

    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (playBtn.classList.contains('playing')) {
                stopImportedSong();
            } else {
                playImportedSong();
            }
        });
    }
}
