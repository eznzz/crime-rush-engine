# CRIME RUSH / STANCE CRIME architecture

Protected canonical source: crime-rush/engine/. Engine changes require a dedicated PR, regression tests and an explicit release. The sandbox is adjacent, not part of the engine runtime. The engine sandbox only exposes garage and drive; reference roster: gubernator/pobeditel01, schoolboy/schoolboy-vaz-01, tosha08/sputnik08, alex-tan/vaz03-tan. No redjacket-01 or m412-01 in its roster. Traffic models remain. Game sandbox retains promenade, garage and drive; the game retains all existing pairs.

Game-specific settings, adapters and scenes belong in stance-crime/. Shared sprite sources remain in sprites/. Existing scene-preview HTML entrypoints remain compatible and reference the canonical engine; old supporting resources remain for legacy pages. No stable release tag until browser regression tests pass. Next: instance API, runtime config overrides, scene engine, plugins, debugger, version pinning and enforcement. This layout migration is not a claim that those features already exist.

## Autonomous reference assets (alpha.4)
The engine sandbox no longer depends on the shared sprite library or root fonts. Local catalog and registry are under assets/sprites/. Four reference pairs use new identifiers; game catalog remains separate. See SPRITE-STANDARD.md.
