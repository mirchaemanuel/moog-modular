// Moog Modular Synthesizer - Playback Manager
// Centralized playback control to avoid circular dependencies

const stopFunctions = new Map();

/**
 * Register a stop function for a playback source
 */
export function registerStopFunction(name, stopFn) {
    stopFunctions.set(name, stopFn);
}

/**
 * Stop all playback sources except the one specified
 */
export function stopAllExcept(exceptName) {
    stopFunctions.forEach((stopFn, name) => {
        if (name !== exceptName) {
            stopFn();
        }
    });
}

/**
 * Stop all playback sources
 */
export function stopAll() {
    stopFunctions.forEach(stopFn => stopFn());
}
