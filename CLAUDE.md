# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Web-based Moog Modular Synthesizer emulation - a single-file vanilla JavaScript application using the Web Audio API. No build tools, no dependencies, no package manager.

## Development Commands

```bash
# Serve locally (any static server works)
python3 -m http.server 8000
# or
npx serve .

# Open in browser
open http://localhost:8000
```

There are no build, lint, or test commands - this is a pure HTML/CSS/JS project.

## Architecture

### Single-File Structure (`index.html`)

The entire application lives in one 2,000+ line HTML file:
- **Lines 42-565**: CSS (synthesizer styling, responsive design)
- **Lines 567-967**: HTML markup (modules, keyboard, presets)
- **Lines 969-2003**: JavaScript (audio engine, UI interaction)

### Audio Signal Flow

```
VCO1/VCO2/VCO3 + Noise → Mixer → Ladder Filter → VCA → Delay/Reverb → Analyser → Output
                              ↑                    ↑
                         Filter Envelope      Amp Envelope
                              ↑                    ↑
                            LFO1/LFO2 (modulation destinations)
```

### Core State Object

All synthesizer parameters are stored in a central `state` object (line ~989):
- `vco1/vco2/vco3`: wave, octave, detune, pulse width
- `mixer`: VCO levels, noise level
- `filter`: cutoff, resonance, envelope amount, keyboard tracking
- `filterEnv/ampEnv`: ADSR values
- `lfo1/lfo2`: wave, rate, amount, destination
- `effects`: delay time/feedback/mix, reverb mix
- `master`: volume, glide (portamento)

### Voice Management

- Polyphonic via Map-based voice pool
- Each note creates a complete signal chain (oscillators → filter → VCA → effects)
- Real-time parameter updates apply to active voices while playing
- Voice release triggered on noteOff with envelope release time

### Key Functions

- `initAudio()`: Creates AudioContext, sets up master effects chain
- `createVoice(freq)`: Spawns oscillators, filter, envelopes for a note
- `releaseVoice(note)`: Triggers release envelope, schedules voice cleanup
- `noteOn(note)/noteOff(note)`: Entry points from keyboard interaction
- `updateVoice(voice)`: Applies current state to an active voice
- `loadPreset(presetName)`: Loads preset values into state and updates UI

### Audio Initialization

Web Audio context is lazy-initialized on first `noteOn()` call (user interaction required by browsers).

## Working with This Codebase

- When modifying audio parameters, update both the `state` object AND call `updateVoice()` for active voices
- Knob values use different scaling: `logarithmic` for frequency-based params, `linear` for others
- LFO modulation is applied via gain nodes connected to audio parameters
- Envelope sustain is a level (0-1), other ADSR values are times in seconds
- Presets are defined in the `presets` object (line ~1850) with all state parameters
