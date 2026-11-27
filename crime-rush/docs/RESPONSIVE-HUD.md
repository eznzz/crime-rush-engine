# Responsive HUD alpha.10
Reference drive module owns hud-responsive.css. Desktop condition uses contained voltage label and track, compact 5+5 symbols and 2x2 warnings. Mobile shares live data nodes, hides circular gauges, decorative climate/vents and voltmeter, displays horizontal speed/temperature/fuel and a compact LCD with speed/score/health/gears/warnings. Radio retained as a small status strip. Fuel/gears remain cosmetic.
Retina raster budget is 460800 pixels with min scale .75; only applies to reference module on DPR >=1.5. Logical W,H unchanged. Standard 864x432 remains unscaled. Very wide canvas can still exceed budget due to minimum scale. This is a proposed GPU fill/compositing optimization, not proof of cause or FPS gain. Performance monitor includes raster dimensions and DPR. Browser visual and performance comparison required.

Follow-up: labeled mechanical gauges (speed/fuel/temperature); warning grid right of both condition rows on all devices. Mobile HUD target 64–76 CSS px plus bottom safe area, landscape short screens place three mechanical instruments side by side and FM at right. No gameplay changes. Visual browser acceptance pending.

Alpha.11: thicker analog needles, numerical voltage, four selectable decorative heater modes, integrated instrument pictograms, compact mobile HUD. Landscape target 48px plus safe area, portrait two rows of 26px. Fuel and temperature shortened visually; physical ranges unchanged. Browser layout verification pending.

Mobile refinement: separate score/state/VOLTS grid cells, matching numeric LCD styling, no speed pictogram, aligned smaller health and gear rows, larger warning indicators. Existing HUD height unchanged. Browser verification pending.

Alpha.12: desktop left voltage/condition, right full-height 2x2 telltales; shortened and inset gauge art, pixel pictograms, no ornamental switches; mobile sequence score, instruments, voltage, condition, radio (two rows in portrait). Landscape allocation of fuel and temp reduced 15% relative to prior nominal shares, transferred to radio. Backdrop raster now matches backing Canvas; repeated projections, palette allocation, offscreen soil scanlines and crossroad hashing reduced. No measured FPS guarantee.

Alpha.13: fuel/temp text labels use BeetlePixel; combined left bay with 72% vent/gauge stack height, radio knobs inset 10%/7%, LCD typography/voltage and denser square glyphs, frameless mobile gauges, common 14px safe-area-aware margins matching controls. No gameplay or performance changes; visual acceptance pending.

Alpha.16 follow-up: continuous desktop condition glass beneath transparent instrument cells, bezel padding matched to score plus content inset; seven squared voltage segments spaced 2px; tactile radio and heater faces, radio knobs scaled 1.15 about their existing centers; heater modes 0–3, fuel 1/2 and mobile speed labels 4.55 instead of 7. User warning glyphs retained. Visual browser acceptance pending.

Alpha.17: removed outer-wing fastener decorations and left gauge bezel screws, preserving central LCD screws. Radio/climate panel finishes, bevelled keys and knurled knobs with index marks; existing positions and 115% knob scale retained. All mobile instrument cells use a common 2px radius. No gameplay changes.

Alpha.18: matching score/voltage type size, reduced voltage bar width, symmetric insets and lower alignment; vent maximum +15%, retained radio knob centered scale 1.30. Six selectable original hip-hop radio loops (92–110 BPM), power replaces two right dummy knobs, independent music mute, warning text retains priority, tracks prepared before drive; existing heater mode controls remain cosmetic.

Alpha.19: fix inherited pointer-events:none on radio and heater controls. Three-column radio controls, centered remaining knob scaled 1.69 (30% above 1.30), power height matches presets. Desktop voltage spacing, broader rectangular 7-segment strip; displayed 12.9V or less lights one, 14.0V lights five, with independent mini-count updates. Simulated voltage now spans 12.9–14.0 with existing speed-based rise. Browser interaction still needs live verification.

Alpha.20: independent 3px mobile LCD/gauge corner radius and 3px gap between mechanical gauges. Desktop condition glass uses symmetric inset, three equal left rows and two centered warning rows spanning the same height. Voltage strip height is .8em tied to the voltage typography. No audio, gameplay or meter calibration changes.

Alpha.21: right assembly centered; vent cap +10px (199.75px), flexible vents consume spare width. Condition symbol target +80% with cell-bound sizing. Native independent cold/hot sliders, no game linkage; heater caption aligned to second climate row. Unified mobile glass, border, shadow and corner radius including FM, preserving notice colors.
