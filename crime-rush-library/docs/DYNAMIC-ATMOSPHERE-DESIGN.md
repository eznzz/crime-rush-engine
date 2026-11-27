# Dynamic Atmosphere — approved design (stage 13.5)
Status: design only; no runtime changes in this PR.
## Modes
STATIC fixed presets; DYNAMIC independent simulation clock and weather scheduler; SCRIPTED deterministic mission timeline. Legacy remains opt-out.
## Modules
clock.js: cyclic 24-hour clock, adjustable real seconds per game day, pause/seek.
transition.js: interpolate resolved continuous state, smoothstep, interruption starts from current sampled state.
weather-controller.js: seeded scheduling; clear ↔ overcast ↔ rain ↔ storm; rain/storm → afterrain → clear/overcast; fog enters/exits through clear/overcast.
timeline.js: validate ordered keyframes, time and weather tracks independent; deterministic seek and playback.
manager.js: single resolved state for renderer; static compatibility.
LIBRARY atmosphere.config.js: defaults and tunable durations.
## Rendering contract
Interpolate sky/ground/road/light/fog RGB, ambient, shadow, cloud coverage, fog, wetness, precipitation and headlights strength. Celestial positions and visibility continuous over midnight. Stable cloud identities with alpha ramps, crossfade bounded cached palette endpoints instead of new textures per frame. Wetness rises with rain and decays separately after precipitation stops. Rain particle populations and audio gain ramp independently. Fog remains composited after sky. No geometry/physics/HUD changes.
## Road Lab
Timeline playback, pause, scrub, duration, start/target presets and time, speed controls, JSON export. Validate all 24 static combinations and interrupted transitions, midnight rollover, repeatability, low-memory/mobile and legacy regression. Initial durations and cycle length to be tuned visually.
