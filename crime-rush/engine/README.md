# CRIME RUSH — engine migration 2

Shared classic JavaScript / Canvas 2D runtime for Scene Preview and STANCE CRIME. Both pages load the same core, world, vehicles, renderer and input scripts; adapters preserve their different menus and startup behavior. No bundler. Existing asset paths and public HTML URLs stay unchanged.

## Structure
- core: state, loop, loading, assets
- config: speed, world, difficulty
- world: projection, road surface, scenery and crossroads
- vehicles: player, traffic, collision and behavior
- renderer: shadows, renderer, motion and effects
- weather: weather, wind, rain, wet effects
- gameplay: medkits and obstacles
- hud: DOM-only rendering and CSS
- indicators: warning flicker, simulated instruments, timed notifications
- gameplay: independent health, scoring, coolant temperature models
- core/drive-systems.js: active frame orchestration and resets
- config/gameplay.config.js and config/indicators.config.js: balance vs cosmetic settings
- audio, input, storage: support systems

## Migration boundaries
Classic scripts deliberately share the existing global lexical state and must load in the order specified by the pages. This is not a fully independent engine API yet. Legacy root scripts are retained for compatibility with other pages and external links. Do not edit them for the new drive/game pages. Health, scoring and temperature are independent of HUD; cosmetic blinking and simulated instruments have separate models. HUD reads their state. No new damage from temperature has been introduced. Feature flags and fixed-step clock are not yet introduced. The 140 km/h physical display limit and 160 km/h dial are distinct and retained. Existing gameplay parameters are not intentionally rebalanced.

## Validation
Run node --check for changed scripts and test both pages on desktop and mobile: load, steering, speed, traffic, collision, medkits, overheating, rain, pause/restart, records and fullscreen. Browser validation required before merge.

## Repository layout
Canonical engine lives in crime-rush/engine. Game-specific pairs and difficulty presets live in stance-crime/config. Shared sprites are resolved relative to sprites/library.js. Engine sandbox restricts the reference roster to four personal cars and four characters; traffic sprites are retained. Legacy HTML entrypoints load the canonical engine. Classic global state remains transitional; public instance API and browser validation are not finished.
