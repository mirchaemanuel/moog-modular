// Moog Modular Synthesizer - Song Recording (Notes to Text)

import { midiToNoteName } from '../utils/note-converter.js';

// Song recording state
let isRecordingSong = false;
let songRecordingStart = 0;
let recordedNotes = [];
let activeNoteStarts = new Map(); // Track when each note started
let currentSongPreset = 'init';

/**
 * Start song recording
 */
export function startSongRecording() {
    isRecordingSong = true;
    songRecordingStart = Date.now();
    recordedNotes = [];
    activeNoteStarts.clear();
    // Remember current preset (find which one is closest to current state)
    currentSongPreset = 'init';
}

/**
 * Stop song recording
 */
export function stopSongRecording() {
    isRecordingSong = false;
    // Close any notes that are still playing
    activeNoteStarts.forEach((startTime, note) => {
        const duration = Date.now() - startTime;
        const time = startTime - songRecordingStart;
        recordedNotes.push({ note, time, duration });
    });
    activeNoteStarts.clear();
}

/**
 * Record a note on event
 */
export function recordNoteOn(note) {
    if (!isRecordingSong) return;
    activeNoteStarts.set(note, Date.now());
}

/**
 * Record a note off event
 */
export function recordNoteOff(note) {
    if (!isRecordingSong) return;
    const startTime = activeNoteStarts.get(note);
    if (startTime) {
        const duration = Date.now() - startTime;
        const time = startTime - songRecordingStart;
        recordedNotes.push({ note, time, duration });
        activeNoteStarts.delete(note);
    }
}

/**
 * Generate song text from recorded notes
 */
export function generateSongText() {
    // Sort notes by time
    const sorted = [...recordedNotes].sort((a, b) => a.time - b.time);

    const lines = [
        '# Moog Modular Song',
        `# preset: ${currentSongPreset}`,
        `# date: ${new Date().toISOString().split('T')[0]}`,
        `# notes: ${sorted.length}`,
        ''
    ];

    sorted.forEach(n => {
        lines.push(`${n.time}:${midiToNoteName(n.note)}:${n.duration}`);
    });

    return lines.join('\n');
}

/**
 * Check if currently recording
 */
export function isRecording() {
    return isRecordingSong;
}

/**
 * Set the current preset name for recording
 */
export function setRecordingPreset(presetName) {
    currentSongPreset = presetName;
}
