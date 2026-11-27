# CRIME RUSH / STANCE CRIME architecture

Protected canonical source: crime-rush/engine/. Engine changes require a dedicated PR, regression tests and an explicit release. The sandbox is adjacent, not part of the engine runtime. The engine sandbox only exposes garage and drive; reference roster: governor/pobeditel, schoolboy/yaichnitsa, tosha/sputnik, alex/vasilek. Only four reference pairs and two traffic models are included. Game-specific scenes remain outside the engine.

Game-specific settings, adapters and scenes belong in stance-crime/. Shared sprite sources remain in sprites/. Existing scene-preview HTML entrypoints remain compatible and reference the canonical engine; old supporting resources remain for legacy pages. No stable release tag until browser regression tests pass. Next: instance API, runtime config overrides, scene engine, plugins, debugger, version pinning and enforcement. This layout migration is not a claim that those features already exist.

## Autonomous reference assets (alpha.4)
The engine sandbox no longer depends on the shared sprite library or root fonts. Local catalog and registry are under assets/sprites/. Four reference pairs use new identifiers; game catalog remains separate. See SPRITE-STANDARD.md.

## Alpha.27 — dual condition
Damage table and power coefficients in engine/config/damage.config.js. Driver hearts and vehicle gears each max five, half-step. Atomic event application, failure on either zero. Overheat damage every ten continuous seconds at 105 C. Independent repair kit roll 2%, heals 1.5 vehicle points; medkits unchanged. Engine/oil warnings tied to vehicle condition; battery remains decorative. Preview repair resets both states. Existing obstacle damage toggle gates both conditions. UI/layout unchanged except functional gear fills. Browser playtest pending.
