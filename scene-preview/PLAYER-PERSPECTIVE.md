# Locked player road perspective

Approved requirement: vehicle nose always points toward road center outside the central zone, regardless of steering input.

The actual `schoolboy-vaz-01/rear-10.webp` was visually inspected: its nose points screen right without mirroring.

| Zone | Width | Sprite | Mirror |
| --- | --- | --- | --- |
| Left | 32% | rear-10 | false |
| Center | 37% | rear | false |
| Right | 31% | rear-10 | true |

Do not invert these assignments or reintroduce a steering override. Road rendering, wheels, suspension, and steering physics are independent of this invariant. Only zone thresholds may be edited when explicitly requested.
