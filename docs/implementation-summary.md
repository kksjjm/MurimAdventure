# MurimAdventure Implementation Summary

Last updated: 2026-06-07

## Overview

This update reworks the project around the new realtime modular ARPG planning data, resets the visual baseline to box-style actors, and expands the admin panel so game data and sprites can be managed from the same workflow.

## Data Model And Content

- Reorganized shared constants and default data around the new modular ARPG DB design.
- Added modular metadata for systems, table catalog entries, formulas, combat actions, hitboxes, items, skills, monsters, quests, shops, NPCs, maps, spawn config, and player defaults.
- Added `GameDataLoader` as the shared game-side loader for admin localStorage data with default-data fallback.
- Updated game systems and scenes to consume the new item, skill, monster, quest, shop, and map IDs.

## Sprite Reset And Runtime Visuals

- Reset character, monster, and NPC visuals to generated box-style sprites.
- Disabled external character and monster asset dependency for the current baseline.
- Kept generated fallback textures for tiles, items, equipment layers, effects, portals, and pickups.
- Added safer custom sprite loading so bad or mismatched custom sprite data no longer blocks game boot.
- Reordered boot flow so custom sprites load before player animations are created.
- Preserved box actor defaults while allowing admin-managed player, skill, icon, and effect sprites to load.

## Admin Sprite Management

- Rebuilt the sprite browser around data-driven categories:
  - Main character
  - Item equipment
  - Monsters
  - NPCs
  - Skills/effects
  - Consumables
  - Mounts/pets
  - Custom sprites
- Added generated sprite entries for current data records instead of only static registry entries.
- Added skill sprite management for:
  - Skill icons
  - Skill effects
  - Cast animations
- Mapped design effect IDs to real default effect sprites:
  - `effect_slash_damage` -> `fx_slash`
  - `effect_bolt_damage` -> `fx_lightning`
  - `effect_recover_channel` -> `fx_heal`
- Mapped item icon fallback behavior to the same keys used in-game, so items like `consumable_hp_001` show as `icon_potion`.
- Added programmatic preview drawing for default generated sprites, so built-in icons/effects/player sprites do not open as blank canvases.
- Added one-pixel grid rendering and a generated box-character guide for sprite editing.

## Main Character Admin

- Added a new admin page: Main Character Management.
- Added `mainCharacter` data to admin defaults and game data loading.
- Added fields for character ID, display name, level, class ID, race ID, description, and base sprite key.
- Connected `mainCharacter.spriteKey` to the player entity so admin changes can affect the in-game player texture.
- Added main character sprite entries in Sprite Management, including base and animation-oriented player sprite keys.

## Map And Movement Fixes

- Made `field_01` the ARPG test field and gave it real 50x50 tile data.
- Updated `WorldScene` to use map data tiles first instead of always procedurally generating the field.
- Fixed map transition blocking caused by `_transitioning` being set before calling `MapTransitionSystem.transition`.
- Added a separate `_mapTransitionInProgress` guard inside `MapTransitionSystem`.
- Ensured field portals connect to village and dark forest, and return portals connect back to the field.
- Updated map editor import behavior so the ARPG test field is available because it now has tile data.

## Admin Korean Text Repair

- Restored `admin.html` to valid UTF-8.
- Rebuilt the static admin header/sidebar labels with valid Korean text.
- Added a render-time mojibake repair helper in `admin.js` for legacy admin strings that were previously saved with bad encoding.

## Verification

- `npm run build` passes.
- `http://localhost:3000` responds with HTTP 200.
- `http://localhost:3000/admin.html` responds with HTTP 200.

## Notes

- Existing localStorage data may still contain older records, but admin load now backfills missing `mainCharacter` data.
- Invalid custom sprites are skipped at runtime with a console warning instead of blocking loading.
- Monster and NPC custom overrides remain blocked by default so the requested box baseline is preserved.
