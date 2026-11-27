# Road atmosphere v1 (experimental)
Legacy mode leaves the approved dawn palette and fog unchanged. The SCENE LAB road tab embeds the canonical drive renderer, with gameplay progression disabled. Four time presets and six independent weather presets control sky, ground, road palette, fog, wet-road sheen and precipitation. Sun position, shadows and night headlight beam are first-pass procedural approximations, not a physically based lighting model. No new binary art and no game defaults changed. Export is a standalone JSON configuration; road versioning integration and mission integration are deferred until visual approval.

## v2
Fog density 0–1.7, exponential world-depth opacity on full silhouettes and horizon gradient. Sky uses 48 logical pixel solar/lunar discs and cached procedural shaded pixel clouds. Wet asphalt uses irregular world-anchored patches rather than full-width strips. Headlight beams project from ahead of player ground anchor and render before car. Cloud masters are generated in code, not external WebP resources; visual review remains required. Legacy branch remains unchanged.

## v2.1
UI fog 0–100% maps to internal optical density 0–1.7. Horizon plateau is composited after ground lighting; fences and poles use opaque fog-tinted artwork in experimental mode, wires use matched fog colors. Wide manually defined procedural cloud silhouettes and a single cached radial headlight glow replace v2 effects. Legacy remains separate. Visual approval pending.

## v2.1.1
Ground veil and all experimental roadside silhouettes share the same horizon-bounded fog opacity. This avoids distant objects becoming white against less-fogged terrain at low and medium density. Experimental cached roadside tint quantizes downward to avoid overshooting ground fog; legacy quantization remains unchanged. Maximum optical density and horizon occlusion remain unchanged.

## v2.2 — promenade cloud catalog
Six original static WebP masks are reused, unchanged, with four shared time palettes and weather interpolation. The sunset clear palette preserves original RGB exactly. Other variants are cached as transparent canvases at runtime, not exported as separate files. Original aspect ratios and alpha preserved. Road Lab loads only six original images and rebuilds its cached backdrop as they arrive. Static promenade unchanged. Cloud motion remains static in the cached road backdrop.

## v2.3
Smaller original cloud assets use staggered whole-sky placement, target 7–12 clouds depending on weather, 60–70% opacity (30–40% transparency), collision avoidance for other clouds and celestial discs, stars only in free sky. Moon uses pixel-shaded irregular lunar maria. Road Lab adds fullscreen with CSS viewport fallback and audio toggle via the existing preview audio controller. Cloud counts may be lower on constrained viewports to preserve spacing. Legacy and promenade unchanged.

## v2.4
Animated bounded horizontal cloud drift uses elevation-based perspective (smaller and slower near horizon), stable randomized positions, 9–14 target clouds, lower alpha, and independent seeded star scatter. Sky overlay increases toward horizon; cloud and celestial drawing occurs before the existing continuous fog veil. Storm experimental rain uses 620–690 streaks, up to 24 camera drops, and increased spray; legacy unchanged. Experimental power cables fade over the last 480 world units and use thinner lower-contrast strokes. This is a visual fade solution, not a change to pole spacing or world geometry. Visual/mobile performance review pending.
