# ROAD SCENE standard v1

ROAD SCENE is a portable JSON composition of five independent sections: road, environment, atmosphere, traffic, events. Presets live in LIBRARY; validation and translation to existing drive controls live in ENGINE. No runtime activation in Phase 1.

| Section | Contract |
| --- | --- |
| road | Geometry profile, lane count, logical viewport, perspective/curve parameters and markings. Distances are existing engine world units, not metres. Version 1 accepts legacy-four-lane only; changing geometry is not yet wired to the renderer. |
| environment | Preset id (rural, forest, village, industrial, city, motorway) and eight legacy layer switches. Only rural has an implemented reference preset in Phase 1. |
| atmosphere | Existing mission atmosphere schema (legacy/static/dynamic/scripted). |
| traffic | Direction mode one/two and existing traffic speed percentage 80–150. |
| events | Existing obstacle enabled/damage switches, chance percentages and allowed obstacle types. |

Identity: schemaVersion 1, kind road-scene, unique slug id and title. Validation rejects unsupported lane geometry and out-of-range values. fromPreset creates a mutable deep copy; original library presets are deeply frozen. toDriveOptions translates existing control fields and atmosphere only; it does not apply road projection or environment-specific assets. The reference RURAL preset captures the current four-lane road defaults, with original LEGACY atmosphere. It does not replace any game configuration.

## Road Builder phases
1. Pure schema/model and immutable rural reference (this change).
2. Environment library with distinct preset assets and placement rules.
3. Opt-in renderer integration, preserving legacy parity.
4. Road Builder editor and portable JSON.
5. Route segments and seamless environment transitions.
6. Mission Lab integration.

Do not advertise non-rural presets or arbitrary lane geometry as rendered features before implementation and visual tests. Traffic density and new event categories remain future extensions; existing game mechanics and balance are unchanged.
