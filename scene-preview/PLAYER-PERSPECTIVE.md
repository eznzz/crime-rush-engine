# Locked player road perspective

Approved requirement: vehicle nose always points toward road center outside the central zone, when no steering input is active.

The actual `schoolboy-vaz-01/rear-10.webp` was visually inspected: its nose points screen right without mirroring.

| Zone | Width | Sprite | Mirror |
| --- | --- | --- | --- |
| Left | 32% | rear-10 | false |
| Center | 37% | rear | false |
| Right | 31% | rear-10 | true |

Do not invert these resting assignments. Explicitly approved maneuver exception: while steering input is active, use rear-10 for the first 1 continuous second, then rear-15. Both original sprites point screen right; mirror for left steering, leave unmirrored for right steering. Reset the hold timer on release or direction change; on release, immediately restore the locked zone perspective. Never use angles above 15 degrees. Road rendering, wheels, suspension, and steering physics are independent of this invariant. Only zone thresholds may be edited when explicitly requested.
