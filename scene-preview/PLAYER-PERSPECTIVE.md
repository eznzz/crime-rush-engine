# Locked player road perspective

Approved requirement: vehicle nose always points toward road center outside the central zone, when no steering input is active.

The actual `schoolboy-vaz-01/rear-10.webp` was visually inspected: its nose points screen right without mirroring.

| Zone | Width | Sprite | Mirror |
| --- | --- | --- | --- |
| Left | 32% | rear-10 | false |
| Center | 37% | rear | false |
| Right | 31% | rear-10 | true |

Do not invert these resting assignments. Explicitly approved maneuver exception: while steering input is active, use rear-10 mirrored for left steering and unmirrored for right steering, independent of road zone. On release, immediately restore the locked zone perspective. Never use larger steering angles. Road rendering, wheels, suspension, and steering physics are independent of this invariant. Only zone thresholds may be edited when explicitly requested.
