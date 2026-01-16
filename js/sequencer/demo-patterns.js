// Moog Modular Synthesizer - Demo Pattern Definitions

export const demos = {
    chase: {
        preset: 'lead',
        bpm: 130,
        loop: true,
        pattern: [
            // E minor arpeggio - classic Chase style
            { note: 64, time: 0, duration: 100 },      // E4
            { note: 67, time: 115, duration: 100 },    // G4
            { note: 71, time: 230, duration: 100 },    // B4
            { note: 76, time: 345, duration: 100 },    // E5
            { note: 71, time: 460, duration: 100 },    // B4
            { note: 67, time: 575, duration: 100 },    // G4
            { note: 64, time: 690, duration: 100 },    // E4
            { note: 67, time: 805, duration: 100 },    // G4
            { note: 71, time: 920, duration: 100 },    // B4
            { note: 76, time: 1035, duration: 100 },   // E5
            { note: 71, time: 1150, duration: 100 },   // B4
            { note: 67, time: 1265, duration: 100 },   // G4
            { note: 64, time: 1380, duration: 100 },   // E4
            { note: 67, time: 1495, duration: 100 },   // G4
            { note: 71, time: 1610, duration: 100 },   // B4
            { note: 76, time: 1725, duration: 100 },   // E5
        ],
        loopLength: 1840
    },
    space: {
        preset: 'pad',
        bpm: 70,
        loop: true,
        pattern: [
            // Dm chord
            { note: 62, time: 0, duration: 2500 },     // D4
            { note: 65, time: 50, duration: 2450 },    // F4
            { note: 69, time: 100, duration: 2400 },   // A4
            // Am chord
            { note: 57, time: 3000, duration: 2500 },  // A3
            { note: 60, time: 3050, duration: 2450 },  // C4
            { note: 64, time: 3100, duration: 2400 },  // E4
            // C chord
            { note: 60, time: 6000, duration: 2500 },  // C4
            { note: 64, time: 6050, duration: 2450 },  // E4
            { note: 67, time: 6100, duration: 2400 },  // G4
            // G chord
            { note: 55, time: 9000, duration: 2500 },  // G3
            { note: 59, time: 9050, duration: 2450 },  // B3
            { note: 62, time: 9100, duration: 2400 },  // D4
        ],
        loopLength: 12000
    },
    italo: {
        preset: 'bass',
        bpm: 120,
        loop: true,
        pattern: [
            // Bass octave pulse in E
            { note: 40, time: 0, duration: 150 },      // E2
            { note: 52, time: 250, duration: 150 },    // E3
            { note: 40, time: 500, duration: 150 },    // E2
            { note: 52, time: 750, duration: 150 },    // E3
            { note: 40, time: 1000, duration: 150 },   // E2
            { note: 52, time: 1250, duration: 150 },   // E3
            { note: 40, time: 1500, duration: 150 },   // E2
            { note: 52, time: 1750, duration: 150 },   // E3
            // Melodic sequence
            { note: 64, time: 2000, duration: 200 },   // E4
            { note: 67, time: 2250, duration: 200 },   // G4
            { note: 69, time: 2500, duration: 200 },   // A4
            { note: 71, time: 2750, duration: 200 },   // B4
            { note: 69, time: 3000, duration: 200 },   // A4
            { note: 67, time: 3250, duration: 200 },   // G4
            { note: 64, time: 3500, duration: 200 },   // E4
            { note: 62, time: 3750, duration: 200 },   // D4
        ],
        loopLength: 4000
    },
    blade: {
        preset: 'strings',
        bpm: 60,
        loop: true,
        pattern: [
            // Cm7 chord
            { note: 48, time: 0, duration: 3800 },     // C3
            { note: 55, time: 100, duration: 3700 },   // G3
            { note: 58, time: 200, duration: 3600 },   // Bb3
            { note: 63, time: 300, duration: 3500 },   // Eb4
            // Fm7 chord
            { note: 53, time: 4000, duration: 3800 },  // F3
            { note: 60, time: 4100, duration: 3700 },  // C4
            { note: 63, time: 4200, duration: 3600 },  // Eb4
            { note: 68, time: 4300, duration: 3500 },  // Ab4
            // Abmaj7 chord
            { note: 56, time: 8000, duration: 3800 },  // Ab3
            { note: 60, time: 8100, duration: 3700 },  // C4
            { note: 63, time: 8200, duration: 3600 },  // Eb4
            { note: 67, time: 8300, duration: 3500 },  // G4
            // Gm chord
            { note: 55, time: 12000, duration: 3800 }, // G3
            { note: 58, time: 12100, duration: 3700 }, // Bb3
            { note: 62, time: 12200, duration: 3600 }, // D4
            { note: 67, time: 12300, duration: 3500 }, // G4
        ],
        loopLength: 16000
    },
    bluemonday: {
        preset: 'bass',
        bpm: 130,
        loop: true,
        pattern: [
            // Blue Monday - New Order bass line
            { note: 41, time: 0, duration: 100 },      // F2
            { note: 41, time: 230, duration: 100 },    // F2
            { note: 41, time: 460, duration: 100 },    // F2
            { note: 48, time: 690, duration: 100 },    // C3
            { note: 46, time: 920, duration: 100 },    // Bb2
            { note: 41, time: 1150, duration: 100 },   // F2
            { note: 41, time: 1380, duration: 100 },   // F2
            { note: 41, time: 1610, duration: 100 },   // F2
            { note: 41, time: 1840, duration: 100 },   // F2
            { note: 41, time: 2070, duration: 100 },   // F2
            { note: 48, time: 2300, duration: 100 },   // C3
            { note: 46, time: 2530, duration: 100 },   // Bb2
            { note: 43, time: 2760, duration: 100 },   // G2
            { note: 41, time: 2990, duration: 100 },   // F2
            { note: 43, time: 3220, duration: 100 },   // G2
            { note: 44, time: 3450, duration: 100 },   // Ab2
        ],
        loopLength: 3680
    },
    stranger: {
        preset: 'pad',
        bpm: 80,
        loop: true,
        pattern: [
            // Stranger Things style - dark synth arpeggio
            { note: 48, time: 0, duration: 200 },      // C3
            { note: 55, time: 375, duration: 200 },    // G3
            { note: 60, time: 750, duration: 200 },    // C4
            { note: 63, time: 1125, duration: 200 },   // Eb4
            { note: 60, time: 1500, duration: 200 },   // C4
            { note: 55, time: 1875, duration: 200 },   // G3
            { note: 48, time: 2250, duration: 200 },   // C3
            { note: 55, time: 2625, duration: 200 },   // G3
            // Second part - Am
            { note: 45, time: 3000, duration: 200 },   // A2
            { note: 52, time: 3375, duration: 200 },   // E3
            { note: 57, time: 3750, duration: 200 },   // A3
            { note: 60, time: 4125, duration: 200 },   // C4
            { note: 57, time: 4500, duration: 200 },   // A3
            { note: 52, time: 4875, duration: 200 },   // E3
            { note: 45, time: 5250, duration: 200 },   // A2
            { note: 52, time: 5625, duration: 200 },   // E3
        ],
        loopLength: 6000
    },
    daftpunk: {
        preset: 'lead',
        bpm: 113,
        loop: false,
        file: 'songs/daft_punk.txt'  // Load full song from file
    },
    beethoven: {
        preset: 'lead',
        bpm: 108,
        loop: false,
        file: 'songs/beethoven_fifth_complex.txt'  // Load full song from file
    }
};
