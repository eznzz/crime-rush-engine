# Locked player road perspective

Approved requirement: vehicle nose always points toward road center outside the central zone, when no steering input is active.

The actual `schoolboy-vaz-01/rear-10.webp` was visually inspected: its nose points screen right without mirroring.

| Zone | Width | Sprite | Mirror |
| --- | --- | --- | --- |
| Left | 32% | rear-10 | false |
| Center | 37% | rear | false |
| Right | 31% | rear-10 | true |

Do not invert these resting assignments. Explicitly approved maneuver exception: while steering input is active, use rear-10 for the first 0.2 continuous seconds, then rear-15, and rear-20 after 0.6 continuous seconds. All three original sprites point screen right; mirror for left steering, leave unmirrored for right steering. Reset the hold timer on release or direction change; on release, animate through the previous angle, then 15 and 10 as applicable at 75 ms per frame before restoring the locked zone perspective. Never use angles above 20 degrees. While rear-15 is active, lateral movement speed is multiplied by 1.4; while rear-20 is active, it is multiplied by 1.6; otherwise it uses the original multiplier of 1. At zero forward speed, both manual and automatic steering are disabled, residual lateral velocity and the steering hold timer are reset. Holding up accelerates at 32 speed units/s; releasing the accelerator maintains the selected speed; down brakes at 65 units/s. Steering smoothing, road rendering, wheels and suspension remain unchanged. Only zone thresholds may be edited when explicitly requested.
