// Moog Modular Synthesizer - Note Conversion Utilities

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Convert MIDI note number to note name
 * @param {number} midi - MIDI note number (0-127)
 * @returns {string} Note name (e.g., "C4", "F#3")
 */
export function midiToNoteName(midi) {
    const octave = Math.floor(midi / 12) - 1;
    const noteIndex = midi % 12;
    return NOTE_NAMES[noteIndex] + octave;
}

/**
 * Convert note name to MIDI note number
 * @param {string} noteName - Note name (e.g., "C4", "F#3")
 * @returns {number|null} MIDI note number or null if invalid
 */
export function noteNameToMidi(noteName) {
    const match = noteName.match(/^([A-G]#?)(-?\d+)$/);
    if (!match) return null;
    const note = match[1];
    const octave = parseInt(match[2]);
    const noteIndex = NOTE_NAMES.indexOf(note);
    if (noteIndex === -1) return null;
    return (octave + 1) * 12 + noteIndex;
}

/**
 * Convert note name to frequency in Hz
 * @param {string} noteName - Note name (e.g., "C4", "A4")
 * @returns {number|null} Frequency in Hz or null if invalid
 */
export function noteNameToFreq(noteName) {
    const midi = noteNameToMidi(noteName);
    if (midi === null) return null;
    return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Convert MIDI note number to frequency in Hz
 * @param {number} midi - MIDI note number
 * @returns {number} Frequency in Hz
 */
export function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
}

export { NOTE_NAMES };
