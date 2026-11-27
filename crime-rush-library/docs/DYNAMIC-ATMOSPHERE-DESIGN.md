# Dynamic Atmosphere — approved design (stage 13.5)
Status: phase 3 timeline editor and scripted preview implemented; mission integration pending.
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

## Phase 1 defaults
20 real minutes per game day; 30-second transitions; weather holds 45–120 seconds; drying target 120 seconds (configuration only, drying behavior pending). Time anchors 00/06/12/18/24. Timeline time moves forward across midnight. Core modules are independently testable and not loaded by the existing static renderer. Phase 2 integrates continuous state and bounded palette caches; phase 3 adds Road Lab timeline controls and mission integration.

## Phase 2A
Road Lab opt-in smooth transitions with adjustable duration and progress. Endpoint skies composite in a single reusable buffer; continuous ambient, ground, fog, wetness, road and headlight intensity. Rain streak counts and glass/spray spawn rates interpolate; residual wetness dries over configured duration. Existing static mode unchanged. Automatic clock/scheduler playback, continuous celestial trajectories and rain audio gain remain pending. Sky endpoint crossfade is not a physical moving sun path. Mobile visual/performance review pending.

## Phase 2B
Opt-in automatic Road Lab mode: continuous clock, seeded independent weather scheduler, pause, adjustable day length and initial hour, moving sun/moon arcs, continuously weighted time/weather skies (up to four endpoints), independent wetness. Weather holds are at least as long as the transition. Automatic mode overrides manual fog/wet/headlights using presets. Celestial bodies currently drawn above clear-cloud endpoints, and rain audio gain is still pending; visual review required. No production game activation.

## Phase 2C
Celestial bodies now render below cloud sprites within each clear endpoint; opaque weather panoramas hide them through normal endpoint blending. Procedural rain ambience follows precipitation with smoothed gain/filter, existing audio unlock and mute, one reusable noise buffer; Road Lab only, legacy unchanged. Audio and visual quality require manual review.

## Phase 3
ROAD LAB scripted mode: independent editable time/weather keyframes, add/remove, JSON import/export, play/pause/reset, seek and playback speed. Scripted samples are deterministic independent of seek history; wetness follows the authored weather interpolation rather than automatic drying history. Timeline time moves forward across midnight. No game activation. Browser and manual review pending.
