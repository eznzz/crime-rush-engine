# Drive API

The optional same-origin integration receives `CrimeRushDrive` after the engine scripts load. `initialize(car)` loads assets, `start({car, music, health, weather, speed, controls})` resets and starts a run, `play()` starts the render loop once, `snapshot()` reports immutable run state, `pause(value)` and `clearInput()` manage controls. `CrimeRushDriveIntegration` provides `onFinish`, `loadingReady`, `blocksInput` callbacks. No game-specific import in engine.
