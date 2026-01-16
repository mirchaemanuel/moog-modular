// Moog Modular Synthesizer - Demo Player

import { audioCtx, voices } from '../state.js';
import { initAudio } from '../audio/audio-context.js';
import { noteOn, noteOff, releaseVoice } from '../audio/voice-manager.js';
import { loadPreset } from '../presets/preset-manager.js';
import { demos } from './demo-patterns.js';
import { parseSongText, stopImportedSong } from './song-player.js';

// Demo playback state
let demoInterval = null;
let demoTimeouts = [];
let currentDemo = null;

/**
 * Play a demo by name
 */
export function playDemo(name) {
    // Stop any playing imported song first
    stopImportedSong();
    stopDemo();

    const demo = demos[name];
    if (!demo) return;

    initAudio();
    currentDemo = name;

    // Load preset
    loadPreset(demo.preset);

    // Update UI
    document.querySelectorAll('.demo-btn').forEach(btn => {
        btn.classList.remove('playing');
        if (btn.dataset.demo === name) {
            btn.classList.add('playing');
        }
    });

    // If demo has external file, load and play it
    if (demo.file) {
        fetch(demo.file)
            .then(response => response.text())
            .then(text => {
                if (currentDemo !== name) return;
                const song = parseSongText(text);
                if (song && song.notes.length > 0) {
                    playDemoFromNotes(name, song.notes, demo.loop, demo.loopLength);
                }
            })
            .catch(err => console.error('Failed to load demo file:', err));
        return;
    }

    // Schedule notes from inline pattern
    function schedulePattern() {
        demo.pattern.forEach(event => {
            const noteOnTimeout = setTimeout(() => {
                if (currentDemo !== name) return;
                noteOn(event.note);
                // Visual feedback on keyboard
                const keyEl = document.querySelector(`[data-midi="${event.note}"]`);
                if (keyEl) keyEl.classList.add('pressed');
            }, event.time);

            const noteOffTimeout = setTimeout(() => {
                if (currentDemo !== name) return;
                noteOff(event.note);
                const keyEl = document.querySelector(`[data-midi="${event.note}"]`);
                if (keyEl) keyEl.classList.remove('pressed');
            }, event.time + event.duration);

            demoTimeouts.push(noteOnTimeout, noteOffTimeout);
        });

        if (demo.loop) {
            demoInterval = setTimeout(() => {
                if (currentDemo === name) {
                    schedulePattern();
                }
            }, demo.loopLength);
        }
    }

    schedulePattern();
}

/**
 * Play demo from parsed notes array
 */
export function playDemoFromNotes(name, notes, loop, loopLength) {
    function scheduleNotes() {
        notes.forEach(event => {
            const noteOnTimeout = setTimeout(() => {
                if (currentDemo !== name) return;
                noteOn(event.note);
                const keyEl = document.querySelector(`[data-midi="${event.note}"]`);
                if (keyEl) keyEl.classList.add('pressed');
            }, event.time);

            const noteOffTimeout = setTimeout(() => {
                if (currentDemo !== name) return;
                noteOff(event.note);
                const keyEl = document.querySelector(`[data-midi="${event.note}"]`);
                if (keyEl) keyEl.classList.remove('pressed');
            }, event.time + event.duration);

            demoTimeouts.push(noteOnTimeout, noteOffTimeout);
        });

        if (loop && loopLength) {
            demoInterval = setTimeout(() => {
                if (currentDemo === name) {
                    scheduleNotes();
                }
            }, loopLength);
        } else {
            // Auto-stop after song ends
            const maxTime = Math.max(...notes.map(n => n.time + n.duration));
            demoInterval = setTimeout(() => {
                if (currentDemo === name) {
                    stopDemo();
                }
            }, maxTime + 500);
        }
    }

    scheduleNotes();
}

/**
 * Stop current demo playback
 */
export function stopDemo() {
    // Clear all timeouts
    demoTimeouts.forEach(t => clearTimeout(t));
    demoTimeouts = [];

    if (demoInterval) {
        clearTimeout(demoInterval);
        demoInterval = null;
    }

    // Release all notes
    voices.forEach((voice, note) => {
        releaseVoice(voice);
        const keyEl = document.querySelector(`[data-midi="${note}"]`);
        if (keyEl) keyEl.classList.remove('pressed');
    });
    voices.clear();

    // Update UI
    document.querySelectorAll('.demo-btn').forEach(btn => {
        btn.classList.remove('playing');
    });

    // Turn off LEDs
    document.getElementById('vco1-led')?.classList.remove('on');
    document.getElementById('vco2-led')?.classList.remove('on');
    document.getElementById('vco3-led')?.classList.remove('on');
    document.getElementById('master-led')?.classList.remove('on');

    currentDemo = null;
}

/**
 * Initialize demo buttons
 */
export function initDemoButtons() {
    document.querySelectorAll('.demo-btn[data-demo]').forEach(btn => {
        btn.addEventListener('click', () => {
            const demoName = btn.dataset.demo;
            if (currentDemo === demoName) {
                stopDemo();
            } else {
                playDemo(demoName);
            }
        });
    });

    const stopBtn = document.getElementById('stop-demo');
    if (stopBtn) {
        stopBtn.addEventListener('click', stopDemo);
    }
}

/**
 * Get current demo name (for external access)
 */
export function getCurrentDemo() {
    return currentDemo;
}
