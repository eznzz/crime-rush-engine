# Acceptance fixes alpha.5
Garage: SecurityError from pixel readback is cosmetic; retain scene and use approximate canvas filter/tint fallback. Exact color matrix still used when readback is permitted.
Drive: skip invisible paint-wear texture loops, cache road sprite tint and shadow bounds, avoid per-frame canvas layout read (ResizeObserver and resize events remain), avoid unchanged HUD DOM writes. No gameplay rebalance. Performance benefit must be measured in browser; no FPS claim.
HUD: mobile tell-tales are a separate 2x2 panel within condition block; wide fan dial has four radial modes and dot fixed to mode 3 (cosmetic).
