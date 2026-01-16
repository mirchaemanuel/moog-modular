// Moog Modular Synthesizer - Audio Recording (WebM Export)

import { audioCtx, analyser } from '../state.js';
import { initAudio } from '../audio/audio-context.js';
import { startSongRecording, stopSongRecording, generateSongText } from './song-recorder.js';

// Audio recording state
let mediaRecorder = null;
let recordedChunks = [];
let mediaStreamDest = null;

/**
 * Start audio recording
 */
export function startRecording() {
    initAudio();

    // Start song recording (notes)
    startSongRecording();

    // Start audio recording
    if (!mediaStreamDest) {
        mediaStreamDest = audioCtx.createMediaStreamDestination();
        analyser.connect(mediaStreamDest);
    }

    recordedChunks = [];
    const timestamp = Date.now();

    const options = { mimeType: 'audio/webm' };
    try {
        mediaRecorder = new MediaRecorder(mediaStreamDest.stream, options);
    } catch (e) {
        // Fallback if webm not supported
        mediaRecorder = new MediaRecorder(mediaStreamDest.stream);
    }

    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
            recordedChunks.push(e.data);
        }
    };

    mediaRecorder.onstop = () => {
        // Download audio file
        const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audioLink = document.createElement('a');
        audioLink.href = audioUrl;
        audioLink.download = `moog-song-${timestamp}.webm`;
        document.body.appendChild(audioLink);
        audioLink.click();
        document.body.removeChild(audioLink);
        URL.revokeObjectURL(audioUrl);

        // Download song text file
        const songText = generateSongText();
        const textBlob = new Blob([songText], { type: 'text/plain' });
        const textUrl = URL.createObjectURL(textBlob);
        const textLink = document.createElement('a');
        textLink.href = textUrl;
        textLink.download = `moog-song-${timestamp}.txt`;
        document.body.appendChild(textLink);
        textLink.click();
        document.body.removeChild(textLink);
        URL.revokeObjectURL(textUrl);
    };

    mediaRecorder.start();

    const recBtn = document.getElementById('rec-btn');
    if (recBtn) {
        recBtn.classList.add('recording');
        recBtn.textContent = '⏹️ STOP';
    }
}

/**
 * Stop audio recording
 */
export function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        // Stop song recording first
        stopSongRecording();

        // Stop audio recording (triggers download of both files)
        mediaRecorder.stop();

        const recBtn = document.getElementById('rec-btn');
        if (recBtn) {
            recBtn.classList.remove('recording');
            recBtn.textContent = '🔴 REC';
        }
    }
}

/**
 * Initialize recording button
 */
export function initRecording() {
    const recBtn = document.getElementById('rec-btn');

    if (recBtn) {
        recBtn.addEventListener('click', () => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                stopRecording();
            } else {
                startRecording();
            }
        });
    }
}
