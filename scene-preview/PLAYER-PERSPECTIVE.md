# Locked player road perspective

Approved requirement: vehicle nose always points toward road center outside the central zone, when no steering input is active.

The actual `schoolboy-vaz-01/rear-10.webp` was visually inspected: its nose points screen right without mirroring.

| Zone | Width | Sprite | Mirror |
| --- | --- | --- | --- |
| Left | 32% | rear-10 | false |
| Center | 37% | rear | false |
| Right | 31% | rear-10 | true |

Do not invert these resting assignments. Explicitly approved maneuver exception: while steering input is active, use rear-10 for the first 0.4 continuous seconds, then rear-15, and rear-20 after 3 continuous seconds. All three original sprites point screen right; mirror for left steering, leave unmirrored for right steering. Reset the hold timer on release or direction change; on release, immediately restore the locked zone perspective. Never use angles above 20 degrees. While rear-15 is active, lateral movement speed is multiplied by 1.4; while rear-20 is active, it is multiplied by 1.6; otherwise it uses the original multiplier of 1. Forward speed, steering smoothing, road rendering, wheels and suspension remain unchanged. Only zone thresholds may be edited when explicitly requested.
