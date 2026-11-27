# STANCE CRIME — Object Sprite Standard v1.0

Approved baseline: Sprite Lab v22 — HD 16-bit Sprite Update.

## Visual quality

The actual v22 vehicle and character assets are the approved reference for future objects. Use detailed, crisp 16-bit-inspired pixel art, controlled highlights, clear silhouettes and consistent pixel scale. Preserve the identity, proportions, colors, pose and distinguishing details of each object. No baked ground shadows or opaque background. Export PNG source and lossless WebP runtime files; do not use smooth resampling for in-game display.

## Vehicles

Reference: `vehicles/schoolboy-vaz-01/`. Follow `VEHICLE-STANDARD.md`: front, front-quarter, side, rear, rear-05, rear-10, rear-15, rear-20, rear-30, rear-40. Angles are nominal visual references, not measured projections. Mirroring may reverse asymmetric details.

## Characters

Reference: `characters/schoolboy/`. Five mandatory views: `man-front` (front), `man` (front three-quarter), `man-side` (side), `man-three-quarter-back` (rear three-quarter), `man-back` (rear). Keep body proportions, clothing, face, tattoos and accessories consistent across views. Use a common ground anchor and compatible scale.

## Repository compatibility

Keep existing naming and folder structure. Preserve legacy vehicle assets for compatibility; they are not the approved v22 visual references. Rebuild `sprites/catalog.js` using `python3 tools/build_catalog.py` when filenames change. v22 does not change the scene renderer or Promenade v1.0 Final.
