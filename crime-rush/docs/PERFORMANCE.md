# Performance acceptance notes (alpha.6)

Static analysis, not measured FPS: per-frame world grain and road wear are CPU-heavy; first-use full-resolution pixel readbacks and four wheel overlays are probable long tasks; synchronous music generation can stall input; repeated collision projection wastes work.

Implemented: wheel overlay generation bounded to 384 pixels on longest side (original vehicle body remains full resolution), reuse player collision position within tick and refresh after side impact, skip invisible traffic draw. Shared lowpass effects and one 78 BPM soundtrack at 22050 Hz (four-bar loop, reused across difficulties). Garage hidden labels now obey hidden attribute. Unified green LCD with unframed 2x2 indicators at all breakpoints.

Next: capture p50/p95/p99 frame time, long tasks and memory; prewarm image analyses before first drive; move audio synthesis and wheel processing to Worker or prebuilt assets; batch/cache road textures with quality presets; consider fixed-step simulation with interpolated rendering after collision regression tests. Do not change driving balance or impose FPS cap without testing.
