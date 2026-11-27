# Vehicle Sprite Standard v1.0

10 nominal views: front, front-quarter, side, rear (0°), rear-05, rear-10, rear-15, rear-20, rear-30, rear-40.
PNG sources and lossless WebP runtime files, transparent background, no baked ground shadows, consistent camera and ground anchor. Angles are nominal, not calibrated 3D projections.
Drive preview maps steering to the nearest of 0, 5, 10, 15, 20, 30, 40 degrees; opposite direction uses a horizontal mirror. Legacy five-frame sets remain supported.
Add new files under sprites/vehicles/<id>/ and run python3 tools/build_catalog.py before commit.

## Approved visual quality — v22

The approved HD 16-bit artwork in `vehicles/schoolboy-vaz-01/` is the visual reference for future vehicle objects. Preserve each vehicle’s silhouette, proportions, ride height, wheel design, identifying details and consistent pixel-art treatment across all ten views. Prefer crisp contours, readable pixel clusters and deliberate highlights over blur or generic sharpening. Do not change the approved angle set. Use the reference sprites themselves rather than imposing one universal pixel dimension or color count.
