# Reference sprite standard

All identifiers are lowercase ASCII; UI labels are in registry.js. The local catalog maps semantic roles to actual paths; registry is the single source for display names, pair associations and legacy aliases. Character files: front.webp, front-quarter.webp, side.webp (runtime role aliases man-front, man, man-side retained). Personal vehicles: front.webp, front-quarter.webp, side.webp, rear.webp, rear-05.webp, rear-10.webp, rear-15.webp, rear-20.webp, rear-30.webp, rear-40.webp when present. Traffic uses its existing actual angle roles. Missing optional angles are not synthesized. Images are byte-identical to the approved source WebP files. Original shared game catalog is unchanged.

- governor (Губернатор) / pobeditel (Победитель)
- tosha (Тоша) / sputnik (Спутник)
- schoolboy (Школьник) / yaichnitsa (Яичница)
- alex (Алекс) / vasilek (Василёк)

The local asset library loads only this catalog. The game retains its separate original roster and identifiers. Brake-light compatibility accepts both old and new identifiers. Standalone pages use local fonts, icons and road assets; launch via HTTP for reliable browser behavior.

Friend-traffic status also uses display names when the local asset library is active.

Traffic identifiers are brand-neutral: `traffic-01`, `traffic-02`. New traffic models use sequential numeric IDs.
