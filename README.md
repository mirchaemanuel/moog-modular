# Moog Modular Synthesizer

A web-based Moog-style modular synthesizer built with the Web Audio API.

![Moog Modular Synthesizer](screenshot.png)

## About

This project is a nostalgic journey back to the 80s. Remember when our Amstrad CPC464 felt like a portal to infinite possibilities? That feeling of wonder while exploring technology hasn't faded.

Built entirely with vanilla JavaScript and the Web Audio API, this synthesizer recreates the classic Moog modular architecture - no frameworks, no dependencies, just pure audio synthesis in the browser.

This is a "vibe coding" project, developed in collaboration with Claude Code, demonstrating how AI can assist in creative programming while maintaining the joy of building something from scratch.

**Read the full story:** [Web Audio API: Building a Moog-Style Modular Synthesizer in JavaScript](https://a80.it/blog/web-audio-api-building-a-moog-style-modular-synthesizer-in-javascript)

## Features

- **3 VCOs** with sawtooth, square, triangle, and sine waveforms
- **Classic Moog ladder filter** with resonance and keyboard tracking
- **Dual ADSR envelopes** for filter and amplitude
- **2 LFOs** with multiple modulation destinations
- **Effects**: delay and reverb
- **Real-time oscilloscope** visualization
- **Preset system** with classic synth sounds
- **Demo songs** including Daft Punk, Beethoven 5th, Chase, and more
- **Recording** with export to WebM
- **User presets** saved to local storage
- **Playable keyboard** via mouse or computer keys

## Getting Started

Simply serve the project with any static HTTP server:

```bash
python3 -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000` in your browser.

---

## Architecture

### Audio Signal Flow

The synthesizer follows classic Moog modular architecture:

```mermaid
flowchart LR
    subgraph Oscillators
        VCO1[VCO 1]
        VCO2[VCO 2]
        VCO3[VCO 3]
        NOISE[Noise]
    end

    subgraph Modulation
        LFO1[LFO 1]
        LFO2[LFO 2]
    end

    subgraph Envelopes
        FENV[Filter Envelope]
        AENV[Amp Envelope]
    end

    subgraph Effects
        DELAY[Delay]
        REVERB[Reverb]
    end

    VCO1 --> MIXER
    VCO2 --> MIXER
    VCO3 --> MIXER
    NOISE --> MIXER

    MIXER --> FILTER[Ladder Filter]
    FILTER --> VCA[VCA]
    VCA --> DELAY
    DELAY --> REVERB
    REVERB --> SCOPE[Scope]
    SCOPE --> OUTPUT[Output]

    FENV -.-> FILTER
    AENV -.-> VCA
    LFO1 -.-> |Pitch/Filter/Amp| VCO1
    LFO1 -.-> |Pitch/Filter/Amp| VCO2
    LFO1 -.-> |Pitch/Filter/Amp| VCO3
    LFO2 -.-> |Pitch/Filter/Amp| FILTER
```

---

### State Management

The `state.js` module is the central hub for all synthesizer parameters:

```mermaid
classDiagram
    class State {
        +vco1: VCOState
        +vco2: VCOState
        +vco3: VCOState
        +mixer: MixerState
        +filter: FilterState
        +filterEnv: EnvelopeState
        +ampEnv: EnvelopeState
        +lfo1: LFOState
        +lfo2: LFOState
        +effects: EffectsState
        +master: MasterState
    }

    class VCOState {
        +wave: string
        +octave: number
        +detune: number
        +pw: number
    }

    class MixerState {
        +vco1: number
        +vco2: number
        +vco3: number
        +noise: number
    }

    class FilterState {
        +cutoff: number
        +resonance: number
        +envAmount: number
        +kbdTrack: number
    }

    class EnvelopeState {
        +attack: number
        +decay: number
        +sustain: number
        +release: number
    }

    class LFOState {
        +wave: string
        +rate: number
        +amount: number
        +dest: string
    }

    class EffectsState {
        +delayTime: number
        +delayFeedback: number
        +delayMix: number
        +reverbMix: number
    }

    class MasterState {
        +volume: number
        +glide: number
    }

    State *-- VCOState : vco1, vco2, vco3
    State *-- MixerState
    State *-- FilterState
    State *-- EnvelopeState : filterEnv, ampEnv
    State *-- LFOState : lfo1, lfo2
    State *-- EffectsState
    State *-- MasterState
```

---

### Voice Architecture

Each note creates a complete voice with its own signal chain:

```mermaid
flowchart LR
    subgraph Voice["Voice (per note)"]
        direction TB
        subgraph OSCs["Oscillators"]
            O1[OSC 1]
            O2[OSC 2]
            O3[OSC 3]
        end
        subgraph Gains["Gain Nodes"]
            G1[Gain 1]
            G2[Gain 2]
            G3[Gain 3]
        end
        VF[Voice Filter]
        VVCA[Voice VCA]
    end

    subgraph Global["Global Nodes"]
        NG[Noise Gain]
        MG[Master Gain]
        DL[Delay]
        RV[Reverb]
        AN[Analyser]
        OUT[Destination]
    end

    subgraph Modulation
        L1[LFO 1]
        L2[LFO 2]
    end

    O1 --> G1 --> VF
    O2 --> G2 --> VF
    O3 --> G3 --> VF
    NG --> VF
    VF --> VVCA --> MG
    MG --> DL --> RV --> AN --> OUT

    L1 -.->|detune/filter/gain| Voice
    L2 -.->|detune/filter/gain| Voice
```

---

### User Interaction Flow

How user actions flow through the system:

```mermaid
sequenceDiagram
    participant User
    participant Keyboard
    participant VoiceManager
    participant AudioContext
    participant State

    User->>Keyboard: Press key (mouse/keyboard)
    Keyboard->>AudioContext: initAudio() (if first interaction)
    AudioContext-->>Keyboard: AudioContext ready
    Keyboard->>VoiceManager: noteOn(midiNote)
    VoiceManager->>State: Read current parameters
    State-->>VoiceManager: VCO, Filter, Envelope settings
    VoiceManager->>VoiceManager: createVoice(frequency)
    Note over VoiceManager: Create OSCs, Filter, VCA<br/>Apply envelopes<br/>Connect LFOs
    VoiceManager->>VoiceManager: Store voice in Map
    VoiceManager-->>Keyboard: Voice playing

    User->>Keyboard: Release key
    Keyboard->>VoiceManager: noteOff(midiNote)
    VoiceManager->>VoiceManager: releaseVoice(voice)
    Note over VoiceManager: Trigger release envelope<br/>Schedule voice cleanup
```

---

### File Structure

```
moog-modular/
├── index.html              # Main HTML (clean markup)
├── css/
│   └── styles.css          # All styles
├── js/
│   ├── app.js              # Entry point
│   ├── state.js            # Central state
│   ├── audio/
│   │   ├── audio-context.js    # AudioContext, effects chain
│   │   ├── voice-manager.js    # Voice creation/release
│   │   └── parameters.js       # Real-time parameter updates
│   ├── ui/
│   │   ├── keyboard.js         # Piano keyboard
│   │   ├── knobs.js            # Knob interaction
│   │   ├── visualizations.js   # Oscilloscope, envelopes
│   │   └── wave-selectors.js   # Waveform buttons
│   ├── presets/
│   │   ├── built-in.js         # Preset definitions
│   │   ├── preset-manager.js   # Load presets
│   │   └── user-presets.js     # localStorage management
│   ├── sequencer/
│   │   ├── demo-patterns.js    # Demo definitions
│   │   ├── demo-player.js      # Demo playback
│   │   ├── song-player.js      # Song import/playback
│   │   └── playback-manager.js # Cross-playback control
│   ├── recorder/
│   │   ├── audio-recorder.js   # WebM recording
│   │   └── song-recorder.js    # Note recording
│   └── utils/
│       └── note-converter.js   # MIDI ↔ note conversion
├── songs/                  # Song files (.txt)
│   ├── daft_punk.txt
│   ├── beethoven_fifth_complex.txt
│   └── ...
└── legacy/
    └── index.html          # Original monolithic file
```

---

## License

Made with ❤️ by [Mircha Emanuel D'Angelo](https://a80.it)

CC BY-SA 4.0
