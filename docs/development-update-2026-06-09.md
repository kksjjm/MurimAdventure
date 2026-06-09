# Murim Adventure Development Update - 2026-06-09

## Summary

This update restructures the project around admin-managed ARPG data, editable sprites, larger maps, portal-based map transitions, and a revised in-game UI. The main goal was to remove disconnected temporary game logic and make gameplay entities, effects, sprites, maps, NPCs, monsters, skills, and items consistently driven by data that can be managed from the admin panel.

## Core Data And Admin Changes

- Reworked the shared data loading path so default data and admin localStorage data are merged through `GameDataLoader`.
- Added map ID normalization so legacy IDs such as `map_arpg_test_field` and `arpg_test_field` resolve to `field_01`.
- Added default NPC, shop, combat action, hitbox, formula, and basic attack data into the unified default data set.
- Added `skill_basic_attack` so the Space key attack is represented as a skill and can use managed impact/sprite data.
- Updated admin data migration/versioning with `MAP_EDITOR_DATA_VERSION = 4`.
- Added a reusable sprite selector component for dropdown + search sprite linking.
- Added NPC management through `NpcEditor`.
- Updated item, skill, monster, mount/pet, character, and map editors so sprite/data references use searchable dropdowns where applicable.

## Sprite System Changes

- Reset sprite workspace version to `960-32x64-v1`.
- Standardized actor sprite assumptions around:
  - Game resolution: `960x540`
  - Tile size: `32x32`
  - Character/monster visual size: `32x64`
  - Collision box: `32x32`
- Reworked generated character and monster fallback visuals as box-style sprites.
- Added skill-related sprite visibility/management in the sprite editor.
- Added frame workflow improvements in the sprite editor, including previous-frame copy and pixel-data copy/paste behavior.
- Updated sprite editor workspace behavior toward a centered, expandable canvas model.
- Reconnected item, skill, monster, main character, effect, and basic attack sprite usage through managed sprite keys instead of disconnected CSS-only temporary visuals.

## Map And World Changes

- Replaced separate `VillageScene` and `DarkForestScene` usage with one reusable `WorldScene` that loads admin-managed maps by ID.
- Updated managed maps:
  - `field_01`: ARPG test field, expanded to `60x34`
  - `village_01`: admin hub, `30x17`
  - `dark_forest`: AI validation field, `30x17`
- Removed procedural/random field generation from the live map flow. Maps now load from managed map data.
- Added map object selection/editing support in the admin map editor.
- Added map editor zoom, fit, and scroll support so larger maps can be inspected and edited.
- Added searchable data linking for map spawns, monsters, NPCs, items, and portals.
- Added fallback handling so missing or invalid map targets safely return to `field_01` instead of leaving the game on a blank transition.
- Added portal cooldown and duplicate transition guards to prevent immediate bounce-back or double-start issues.

## In-Game UI Changes

- Split the game camera viewport from the bottom UI area so the HUD no longer covers the visible map.
- Added a bottom HUD showing:
  - HP, MP, EXP
  - Level, gold, proficiency
  - Skill slots `1-5`
  - Consumable quick slots `6-9`
  - Character, minimap, save, and load buttons
- Reduced bottom UI height to `112px` and tightened internal spacing to avoid overflow.
- Added `M` minimap toggle and a bottom HUD minimap button.
- Increased minimap opacity for better readability.
- Reworked `I` into an integrated character window containing:
  - Equipment
  - Inventory
  - Basic stats
  - Detailed stat view toggle
- Reworked the equipment panel into a character-shaped layout with equipment icons displayed in slots.

## Combat, Effects, And Entities

- Connected basic attack behavior to managed skill/effect data.
- Removed rotation-based CSS-style basic attack effect assumptions and normalized default attack impact rotation.
- Added managed hit/whiff/basic attack effect behavior in `ImpactSystem`.
- Updated player, monster, and NPC collision to match `32x64` visuals with `32x32` collision boxes.
- Moved monster HP bars below the sprite instead of above it.
- Preserved name labels above monsters while keeping HP bars near the lower body.
- Added NPC spawning and simple interaction support through map-managed NPC spawn data.

## Stability Fixes

- Fixed intermittent blank map after portal transitions by:
  - Normalizing target map IDs consistently.
  - Using a managed map lookup helper.
  - Adding a safe fallback map.
  - Adding a fade completion backup timer.
  - Preventing duplicate transition starts.
- Fixed cases where map spawns could be outside the target map by clamping spawn coordinates.
- Fixed HUD overflow caused by compressed bottom UI height.
- Kept build compatibility after removing old scene files and centralizing map loading in `WorldScene`.

## Follow-Up Stabilization Update

Additional in-game and admin fixes were completed after the managed ARPG refactor:

### Portal And Map Transition Runtime

- Reworked portal transitions so `WorldScene` changes the active map in-place instead of restarting or switching scenes.
- Added runtime cleanup and recreation for map layers, monsters, NPCs, item pickups, portals, minimap, camera bounds, physics colliders, and respawn timers.
- Added safe spawn resolution so blocked or invalid portal arrival tiles move the player to the nearest walkable tile.
- Added arrival portal blocking/cooldown behavior to prevent instant bounce-back after a map transition.
- Restored keyboard input state after map changes so movement, Space attack, and other controls remain active.

### Unified Save And Load Behavior

- Save data now records the current map ID, world position, and tile position.
- In-game load now chooses the newest valid save snapshot across manual save and auto-save.
- Loading a save now restores the saved map runtime first, then restores player stats, equipment, inventory, skills, proficiency, and exact position.
- Added fallback placement if a saved position is no longer walkable because map data changed.

### Monster AI, Navigation, And Collision

- Added `NavigationSystem` for tile-aware pathfinding over map collision data.
- Added support for two monster behavior modes:
  - Passive monsters do not attack until provoked by the player.
  - Aggressive monsters chase and attack when the player enters detection range.
- Updated `MonsterEditor` so admins can select passive or aggressive AI behavior.
- Prevented player and monster physics from pushing each other through movement.
- Moved player, monster, and NPC collision boxes to the lower half of their `32x64` visuals so collision matches the feet/body area.

### Sprite Editor Follow-Up

- Fixed the sprite reset flow so custom sprite data and linked data references are cleared consistently.
- Added a `전부지우기` button next to `초기화`; it clears the current sprite canvas while preserving undo support until the user saves.
- Updated the character guide overlay so it follows the admin-selected main character sprite.
- Ensured weapon, armor, and other equipment sprite editing always shows the character guide overlay.

## Removed Or Replaced Files

- Removed old scene-specific map files:
  - `src/game/scenes/VillageScene.js`
  - `src/game/scenes/DarkForestScene.js`
- Removed older separated data files now represented through unified/default/admin-managed data:
  - `src/game/data/npcData.js`
  - `src/game/data/questData.js`
  - `src/game/data/shopData.js`

## Verification

Latest verification commands run successfully:

```bash
node --check src/game/scenes/UIScene.js
node --check src/game/entities/Monster.js
node --check src/game/systems/SaveSystem.js
node --check src/game/scenes/WorldScene.js
node --check src/admin/editors/SpriteEditor.js
npm run build
```

Build result:

- Vite production build completed successfully.
- Existing chunk size warning remains because the Phaser/game bundle is larger than Vite's default `500 kB` warning threshold. This is a warning, not a runtime failure.
- `http://localhost:3000/admin.html` returned HTTP 200 during local verification.

## Current Notes

- The project now expects map, spawn, sprite, skill, item, monster, NPC, and effect data to be managed through the unified admin/default data pipeline.
- Admin localStorage may be migrated/reset by version keys when map or sprite schema versions change.
- Browser rendering automation could not be completed in this environment because the Codex in-app browser connection failed with a Windows sandbox setup error, but syntax checks, production build, and HTTP checks have passed in recent verification.
