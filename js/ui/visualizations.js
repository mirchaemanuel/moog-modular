// Moog Modular Synthesizer - Visualizations (Oscilloscope & Envelope Display)

import { analyser } from '../state.js';

/**
 * Draw the oscilloscope waveform display
 */
export function drawOscilloscope() {
    const canvas = document.getElementById('scope');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    function draw() {
        requestAnimationFrame(draw);

        if (!analyser) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        ctx.fillStyle = '#001a00';
        ctx.fillRect(0, 0, width, height);

        // Grid
        ctx.strokeStyle = '#003300';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            ctx.beginPath();
            ctx.moveTo(0, height * i / 4);
            ctx.lineTo(width, height * i / 4);
            ctx.stroke();
        }
        for (let i = 0; i <= 4; i++) {
            ctx.beginPath();
            ctx.moveTo(width * i / 4, 0);
            ctx.lineTo(width * i / 4, height);
            ctx.stroke();
        }

        // Waveform
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 5;
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * height / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    draw();
}

/**
 * Draw ADSR envelope visualization
 * @param {string} canvasId - Canvas element ID
 * @param {number} attack - Attack time in ms
 * @param {number} decay - Decay time in ms
 * @param {number} sustain - Sustain level (0-100)
 * @param {number} release - Release time in ms
 */
export function drawEnvelope(canvasId, attack, decay, sustain, release) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, width, height);

    const totalTime = attack + decay + 500 + release;
    const aX = (attack / totalTime) * width;
    const dX = aX + (decay / totalTime) * width;
    const sX = dX + (500 / totalTime) * width;
    const rX = width;

    const sustainY = height - (sustain / 100) * (height - 10) - 5;

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height - 5);
    ctx.lineTo(aX, 5);
    ctx.lineTo(dX, sustainY);
    ctx.lineTo(sX, sustainY);
    ctx.lineTo(rX, height - 5);
    ctx.stroke();
}
