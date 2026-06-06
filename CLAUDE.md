# 무림기행 (Murim Adventure) - Project Documentation

## Overview

동양풍 2D 픽셀아트 오픈월드 무협 RPG 게임.
Phaser 3 기반 웹 게임 + 관리자 패널을 Vite로 번들링하여 브라우저에서 실행.

## Tech Stack

- **Game Engine**: Phaser 3 (HTML5 Canvas, Arcade Physics)
- **Bundler**: Vite 5
- **Language**: Vanilla JavaScript (ES Modules)
- **Admin Panel**: Vanilla JS + inline CSS (SPA)
- **Data Storage**: localStorage (세이브/로드, admin 데이터)
- **Assets**: Pixel Crawler Free Pack 스프라이트 + 프로그래밍 방식 텍스처 (폴백)

## How to Run

```bash
npm install
npm run dev
```

- **Game**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin.html
- **GitHub**: https://github.com/kksjjm/MurimAdventure

## Game Controls

| Key | Action |
|-----|--------|
| W/A/S/D or Arrow Keys | 4방향 이동 (상/하/좌/우) |
| Space | 기본공격 (방향 기반 대상 자동 타겟팅) |
| 1-5 | 스킬 슬롯 사용 |
| F | NPC 대화 (마을에서) |
| F5 | 빠른 저장 |
| F9 | 빠른 불러오기 |
| I | 인벤토리 열기 |
| E | 장비창 열기 |
| K | 무공(스킬) 창 열기 |
| C | 캐릭터 정보 열기 |
| M | 미니맵 토글 |
| ESC | 패널 닫기 |
| Mouse Click | 몬스터 클릭 공격 / NPC 클릭 대화 |

---

## File Structure & Roles

```
MurimAdventure/
├── package.json              # Dependencies (phaser, vite)
├── vite.config.js            # Multi-page build (game + admin)
├── index.html                # Game entry HTML
├── admin.html                # Admin panel entry HTML
├── CLAUDE.md                 # This documentation
│
├── src/
│   ├── data/                 # === Shared Game Data Definitions ===
│   │   ├── constants.js      # All game enums & constants (STATS, EQUIPMENT_SLOTS, etc.)
│   │   ├── defaultData.js    # Sample items/skills/monsters/player defaults
│   │   └── gameConfig.js     # Phaser config, balance formulas
│   │
│   ├── game/                 # === Game Client ===
│   │   ├── main.js           # Phaser game entry point (registers all scenes)
│   │   │
│   │   ├── data/             # --- Game-specific data ---
│   │   │   ├── mapData.js        # Map definitions (field, village, dark forest)
│   │   │   ├── npcData.js        # NPC definitions (positions, dialogues, quests)
│   │   │   ├── questData.js      # Quest definitions (objectives, rewards)
│   │   │   └── shopData.js       # Shop inventories (weapon shop, general shop)
│   │   │
│   │   ├── scenes/           # --- Phaser Scenes ---
│   │   │   ├── BootScene.js      # Generates ALL pixel art textures programmatically
│   │   │   ├── PreloadScene.js   # Data loading + title screen
│   │   │   ├── WorldScene.js     # Field map (녹림 평원) - combat, exploration
│   │   │   ├── VillageScene.js   # Village map (무림촌) - NPCs, shops, quests
│   │   │   ├── DarkForestScene.js # Dark forest map (흑림) - harder combat
│   │   │   └── UIScene.js        # HUD overlay (bars, panels, menus)
│   │   │
│   │   ├── entities/         # --- Game Entities ---
│   │   │   ├── Player.js         # Player (stats, equipment, skills, combat, regen)
│   │   │   ├── Monster.js        # Monster (AI, drops, health bar)
│   │   │   └── NPC.js            # NPC (dialogue, shop, quest interaction)
│   │   │
│   │   └── systems/          # --- Game Systems ---
│   │       ├── CombatSystem.js           # Damage/hit/crit calculations
│   │       ├── ProficiencySystem.js      # Weapon/skill proficiency tracking
│   │       ├── SkillCombinationSystem.js # Skill fusion/combination
│   │       ├── ImpactSystem.js           # Visual attack/skill effects
│   │       ├── SaveSystem.js             # Save/load to localStorage + file export
│   │       ├── MapTransitionSystem.js    # Map transition with fade effects
│   │       ├── DialogueSystem.js         # NPC dialogue UI
│   │       ├── ShopSystem.js             # Buy/sell shop UI
│   │       └── QuestSystem.js            # Quest tracking and completion
│   │
│   └── admin/                # === Admin Panel ===
│       ├── admin.js          # SPA controller + dashboard
│       ├── components/
│       │   └── DataManager.js    # localStorage CRUD, JSON import/export
│       └── editors/
│           ├── ItemEditor.js         # Item CRUD + stat editor
│           ├── SkillEditor.js        # Skill CRUD + combination editor
│           ├── MonsterEditor.js      # Monster CRUD + drop table
│           ├── MapEditor.js          # Canvas tile map editor
│           ├── QuestEditor.js        # Quest chain editor
│           ├── EventEditor.js        # Scheduled event editor
│           ├── MountPetEditor.js     # Mount & pet editor
│           ├── StatsConfigEditor.js  # Balance/formula tuning
│           └── GameSettingsEditor.js # Global game settings
│
├── assets/                   # Reserved for future real assets
│   ├── sprites/
│   ├── tilesets/
│   └── audio/
└── public/
```

---

## Maps

| Map ID | Name | Size | Type | Features |
|--------|------|------|------|----------|
| `field_01` | 녹림 평원 | 50x50 | 필드 (절차적 생성) | 몬스터, 아이템, 포탈 2개 |
| `village_01` | 무림촌 | 30x30 | 마을 (수작업) | NPC 5명, 상점 2개, 퀘스트, 안전지대 |
| `dark_forest` | 흑림 | 40x40 | 던전 (수작업) | 강한 몬스터, 밀림, 어두운 분위기 |

### Map Connections
```
무림촌 (village_01)
    ↕ (north/south portal)
녹림 평원 (field_01)
    ↔ (east/west portal)
흑림 (dark_forest)
```

---

## Data Architecture

### constants.js - Game Enums
- `STATS` (20종): HP, MP, STR, AGI, INT, LUK, DEF, ATK, EVASION, ACCURACY, CRIT_RATE, CRIT_DMG, SPIRIT, ITEM_FIND, MOVE_SPEED, ATK_SPEED, HP_REGEN, MP_REGEN, DMG_BONUS(가하는피해%), DMG_TAKEN(받는피해%)
- `WEAPON_GRIP` (3종): ONE_HANDED(한손), TWO_HANDED(양손), DUAL_WIELD(쌍수) - 방패 호환 결정
- `WEAPON_TYPES` (8종): SWORD(검), BLADE(도), SPEAR(창), STAFF(봉), HIDDEN(암기), WHIP(편), FIST(권), EXOTIC(기문병기) - 숙련도 카테고리
- `ITEM_RARITY` (14등급, 0~13): GRADE_0(창세) ~ GRADE_13(하품), 숫자 낮을수록 강력
- `EQUIPMENT_SLOTS` (13종): WEAPON, SHIELD, HELMET, ARMOR, PANTS, SHOES, GLOVES, BELT, RING_RIGHT, RING_LEFT, NECKLACE, TALISMAN, JADE_TOKEN
- `WEAPON_TYPES`: ONE_HANDED, TWO_HANDED, DUAL_WIELD
- `SKILL_CATEGORIES`: SIMBEOP(심법), MUGONG(무공), GYEONGGONG(경공), JUSUL(주술)
- `MUGONG_TYPES`: INTERNAL(내가), EXTERNAL(외가)
- `JUSUL_TYPES`: ATTACK, BUFF, DEBUFF
- `ITEM_RARITY` (6단계): COMMON ~ MYTHIC
- `ELEMENT_TYPES` (9종): NONE, FIRE, ICE, LIGHTNING, WIND, EARTH, DARK, LIGHT, POISON
- `PROFICIENCY_LEVELS` (7단계): 입문(0) ~ 초월(25000)
- `AI_BEHAVIOR`: PASSIVE, AGGRESSIVE, TERRITORIAL, PATROL, BOSS

### defaultData.js - Sample Game Content
- 무기 10종 (철검, 언월도, 쌍단도, 천마검, 청룡창, 허공선, 철봉, 독침, 구절편, 금강권갑) - baseATK, baseATK_SPEED, baseRange
- 갑옷 5종, 투구 4종, 하의 3종, 신발 4종, 장갑 3종, 허리띠 3종, 방패 3종 - baseDEF + 추가 옵션
- 반지 4종, 목걸이 3종, 부적 3종, 옥패 4종 - 다양한 추가 옵션
- 방어구 4종 + 장신구 4종
- 스킬 14종 (심법 3 [태극심법, 철체공, **운기조식**], 내가무공 3, 외가무공 3, 경공 2, 주술 3)
- 몬스터 6종 (야생 멧돼지 Lv.1 ~ 혈마왕 Lv.50)
- 스킬 합성 레시피 3종
- 플레이어 기본 스탯 (HP_REGEN: 2, MP_REGEN: 1 포함), 레벨업 성장치, 경험치 공식
- 소모품: HP 회복약, MP 회복약, 고급 HP 회복약, 해독제

### shopData.js - Shop Inventories
- 무기상점: 철검, 월아도 등 무기/방어구
- 잡화상점: 회복약, 해독제 등 소모품

### questData.js - Quest Definitions
- quest_01: 마을 수호 (멧돼지 3마리 처치)
- quest_02: 산적 토벌 (산적 2명 처치)
- quest_03: 약초 채집 (약초 3개 수집)
- quest_04: 대장장이의 부탁 (NPC 대화)

### npcData.js - NPC Definitions
- 촌장 (퀘스트 제공), 대장장이 (무기상점), 상인 (잡화상점), 경비병 (퀘스트), 약초꾼 (퀘스트)

---

## Core Systems

### Combat System (CombatSystem.js)
- `calculateDamage()`: ATK 기반 + 스킬 스케일링 + 숙련도 보너스 - DEF 감쇄
- **피해 증가(DMG_BONUS %)**: 공격자의 가하는 피해 증가 적용
- **받는 피해(DMG_TAKEN %)**: 방어자의 받는 피해 증감 적용 (DEF에 의해 추가 감소: DEF/10%)
- `calculateHit()`: 명중률 vs 회피율 (30~100% 클램핑)
- `calculateCrit()`: 크리티컬 확률 + 크리티컬 데미지 배율
- `performAttack()`: 전체 공격 시퀀스 (명중 → 데미지 → 크리 → 적용)
- 부동 데미지 숫자 + MISS 텍스트
- **스킬 사용 불가 안내**: 쿨타임/내력부족 사유 화면 표시

### Proficiency System (ProficiencySystem.js)
- **무기 8종 분류별** 독립 숙련도 추적 (검, 도, 창, 봉, 암기, 편, 권, 기문병기)
- 스킬별 숙련도 추적
- 7단계 숙련도 레벨 (초식 → 탈태환골)
- 숙련도 레벨별 세부 보너스:
  - **피해 증가** (dmgBonus): 0% ~ +75%
  - **공격 속도** (atkSpdBonus): 0 ~ +30
  - **크리티컬 확률** (critRateBonus): 0% ~ +18%
  - **크리티컬 데미지** (critDmgBonus): 0% ~ +65%
- `toJSON()` / `fromJSON()` 직렬화 지원

### Skill System (Player.js)
- **스킬 쿨다운**: 각 스킬 사용 후 cooldown 시간 동안 재사용 불가
- **스킬 지속시간**: `duration` 필드가 있는 스킬은 효과가 일정 시간 지속
- **채널링 효과**: `CHANNEL_REGEN` 타입 - 시전 중 지속적으로 효과 적용 (예: 운기조식)
- **운기조식**: 8초간 초당 최대 내력의 10% 회복 (쿨다운 30초)
- **UI 표시**: 스킬 슬롯에 녹색 게이지(지속시간), 검은 게이지(쿨다운) 동시 표시

### HP/MP Regeneration System (Player.js)
- `HP_REGEN` / `MP_REGEN` 능력치 기반 (장비로 증가 가능)
- 2초마다 해당 수치만큼 자동 회복
- 장비 보너스, 버프 효과에 의해 추가 증가 가능
- 채널링 스킬(운기조식)로 추가 회복 가능

### Skill Combination System (SkillCombinationSystem.js)
- 스킬 합성 레시피 기반
- 재료 스킬 보유 + 숙련도 요구사항 체크
- 성공 시 새로운 스킬 생성

### Impact System (ImpactSystem.js)
- **기본공격 이펙트**: 무기 타입별 (한손검 = 대각선 슬래시, 양손 = 헤비 X슬래시, 쌍수 = 더블슬래시)
- **스킬 이펙트**: 원소/카테고리별 자동 매핑 (화염, 빙결, 번개, 기파, 암흑 등 9종)
- **버프/힐 이펙트**: 회복 파티클 + 크로스 심볼
- **피격 이펙트**: 히트 플래시, 화면 흔들림, 히트 파티클
- **빗나감 이펙트**: 허공 슬래시

### Save System (SaveSystem.js + UIScene 통합)
- **저장/불러오기 UI 패널**: 메뉴 버튼 '저장', '불러오기' 추가
- **F5 빠른 저장 / F9 빠른 불러오기**: 핫키 지원
- **자동 저장**: 60초마다 별도 슬롯으로 자동 저장
- **파일 내보내기**: JSON 파일로 다운로드
- **파일 가져오기**: JSON 파일 업로드 + 검증
- **플레이 타임 추적**: 세션 간 누적 플레이 시간 표시
- 저장 대상: version, timestamp, playTime, player(stats/equipment/inventory/skills), proficiency, map(id/x/y)

### Map Transition System (MapTransitionSystem.js)
- 포탈 기반 맵 전환 (페이드 아웃 → 씬 전환 → 페이드 인)
- 플레이어 데이터 맵 간 유지 (스탯, 인벤토리, 장비, 스킬)
- 맵 진입 시 맵 이름 표시

### Dialogue System (DialogueSystem.js)
- NPC 대화 박스 (화면 하단)
- 순차 대화 진행 (Space/F로 넘기기)
- 선택지 제공 (상점 열기, 퀘스트 수락, 닫기)

### Shop System (ShopSystem.js)
- 구매/판매 탭 전환
- 무기상점: 무기, 방패, 투구, 갑옷, 장갑
- 잡화상점: 회복약, 해독제, 장신구
- 판매 가격: 구매가의 50%
- 재고 수량 관리

### Quest System (QuestSystem.js)
- 퀘스트 수락/진행/완료 추적
- 퀘스트 유형: kill(처치), collect(수집), talk(대화)
- 보상 지급: 경험치, 골드, 아이템
- `toJSON()` / `fromJSON()` 직렬화 지원

### Equipment Visual System (Player.js, 프레임 동기화)
- 장비 슬롯별 레이어 스프라이트 오버레이 (9개 레이어: 부적/신발/갑옷/허리띠/장갑/목걸이/투구/방패/무기)
- **프레임 동기화**: 장비 스프라이트시트가 있으면 캐릭터 애니메이션과 같은 프레임 표시
  - 네이밍: `{equipTexKey}_{animType}_{direction}` (예: `equip_weapon_sword_walk_down`)
  - 없으면 정적 오버레이로 폴백
- 14등급별 틴트 컬러 적용 (창세=빨강, 하품=무색)
- 아이템 데이터의 `spriteKey` 필드로 커스텀 텍스처 지정 가능

---

## Sprite System

실제 스프라이트 에셋(Pixel Crawler Free Pack) + 프로그래밍 생성 텍스처 혼용:

### 실제 에셋 (public/assets/)
- **캐릭터 (64x64, 스프라이트시트)**: Idle/Walk/Run/Slice/Hit/Death × Down/Side/Up = 18장
- **몬스터 (32x32, 스프라이트시트)**: Orc(4종)/Skeleton(4종) × Idle/Run/Death = 24장
- **타일셋**: Floors, Walls, Dungeon, Water 타일시트
- **나무**: 3종 트리 스프라이트
- **무기**: Wood, Bone, Hands 스프라이트

### 프로그래밍 생성 (BootScene.js, 폴백)
- **장비 레이어 (64x64)**: 무기 4종(검/창/쌍수/지팡이), 투구 2종, 갑옷 2종, 방패, 장갑, 신발, 허리띠, 목걸이, 부적
- **NPC (64x64)**: 촌장, 대장장이, 상인, 경비병, 약초꾼
- **타일 (32x32)**: 풀, 흙, 돌, 물, 벽, 나무 (폴백)
- **타일 (32x32)**: 풀, 흙, 돌, 물, 벽, 나무
- **포탈 (32x32)**: 파란 글로우 원형
- **아이템 아이콘 (16x16)**: 검, 지팡이, 갑옷, 물약
- **임팩트 이펙트 (96x96)**: 대각선 슬래시, 헤비 X슬래시, 주먹 충격파, 기파, 화염, 빙결, 번개, 암흑, 회복
- **기본 스킬 이펙트 (64x64)**: 빨강, 파랑, 초록, 노랑, 보라 원형 이펙트

---

## Physics & Collision

- 플레이어 ↔ 벽/나무/물 충돌 (통과 불가)
- 플레이어 ↔ 몬스터 충돌 (서로 통과 불가)
- 플레이어 ↔ NPC 충돌 (NPC는 immovable)
- 몬스터 ↔ 몬스터 충돌 (서로 통과 불가)
- 몬스터 ↔ 벽 충돌
- 플레이어 ↔ 아이템 픽업 (오버랩)
- 플레이어 ↔ 포탈 (근접 시 자동 전환)

---

## Admin Panel Features

| Editor | 기능 |
|--------|------|
| Dashboard | 데이터 수량 현황 |
| ItemEditor | 아이템 CRUD, 능력치 편집, 등급 필터, 프리뷰 카드 |
| SkillEditor | 스킬 CRUD, 카테고리별 분류, 스킬 합성 편집, 스킬 트리 시각화 |
| MonsterEditor | 몬스터 CRUD, AI 설정, 드랍 테이블 편집 |
| MapEditor | 캔버스 기반 타일맵 에디터, 3레이어, 페인트/지우기/채우기/스폰 도구 |
| QuestEditor | 퀘스트 체인 편집, 목표/보상/대화 관리 |
| EventEditor | 예약 이벤트, 보너스 설정 |
| MountPetEditor | 탈것/환수 관리, 성장/진화 시스템 |
| StatsConfigEditor | 레벨업 성장률, 전투 공식 계수, 경험치 커브 |
| GameSettingsEditor | 게임 전역 설정, 기능 토글 |
| DataManager | JSON 내보내기/가져오기, 백업/복원 |
| SpriteEditor | 79종 스프라이트 브라우저, 픽셀아트 에디터 (연필/지우개/채우기/스포이드/선/사각형), PNG 업로드/다운로드, 스프라이트시트 프레임 편집, 애니메이션 미리보기, Undo/Redo, **장비 편집 시 캐릭터 가이드 오버레이** (투구/갑옷/허리/신발 영역 표시), 커스텀 스프라이트 저장 |

---

## Implementation Status

### Completed
- [x] 프로젝트 구조 및 빌드 시스템 (Vite + Phaser 3)
- [x] 게임 데이터 모델 (20종 스탯, 14등급 아이템, 8종 무기분류)
- [x] **실제 스프라이트 에셋** 적용 (Pixel Crawler Free Pack)
  - 캐릭터 애니메이션: Idle/Walk/Run/Slice/Hit/Death × 3방향 (18장)
  - 몬스터 애니메이션: Orc 4종 + Skeleton 4종 × Idle/Run/Death (24장)
- [x] 프로그래밍 방식 텍스처 (NPC/장비레이어/이펙트/UI) - 폴백
- [x] 장비 시각 표시 레이어 시스템 (14등급별 틴트)
- [x] 4방향 이동 + 방향별 걷기/대기 애니메이션 자동 전환
- [x] 스페이스바 기본공격 (Slice 애니메이션 + 돌진)
- [x] 임팩트 이펙트 시스템 (기본공격/스킬/버프/피격, 9종 이펙트)
- [x] 전투 시스템 (데미지/명중/크리티컬 + 무기숙련도 보너스 + DMG_BONUS/DMG_TAKEN)
- [x] 무기 8종 분류별 숙련도 (7단계, 피해/공속/크리율/크리뎀 보너스)
- [x] 스킬 합성 시스템
- [x] 스킬 쿨다운 + 지속시간 + 채널링 시스템 (운기조식)
- [x] HP_REGEN / MP_REGEN 능력치 기반 자동 회복
- [x] 스킬 사용 불가 사유 표시 (쿨타임/내력부족)
- [x] 몬스터 AI (대기/배회/추적/공격) + 상태별 애니메이션
- [x] 플레이어 ↔ 몬스터 ↔ NPC 충돌 시스템
- [x] HUD (HP/MP/EXP 바, 스킬 슬롯 쿨다운/지속시간, 메뉴 버튼)
- [x] 인벤토리/장비/스킬/캐릭터 정보 패널 (호버 툴팁, baseATK/baseDEF 표시)
- [x] 아이템 49종 (무기 10종, 갑옷 5종, 투구 4종, 하의 3종, 신발 4종, 장갑 3종, 허리띠 3종, 방패 3종, 장신구 14종)
- [x] 경험치/레벨업 시스템
- [x] 미니맵
- [x] **세이브/로드 시스템** (F5/F9 핫키, 60초 자동저장, 파일 내보내기/가져오기)
- [x] **3개 맵** (녹림 평원, 무림촌, 흑림) + 포탈 전환
- [x] **NPC 5명** + 대화/퀘스트/상점 시스템
- [x] **상점 시스템** (무기상점, 잡화상점 - 구매/판매)
- [x] **퀘스트 4종** (처치/수집/대화)
- [x] 관리자 패널 (11개 에디터)
- [x] **스프라이트 에디터** (79종 스프라이트 관리, 픽셀아트 직접 편집, PNG 업로드, 커스텀 스프라이트 localStorage 저장)

### TODO (Future)
- [ ] 인벤토리 드래그&드롭
- [ ] 탈것/환수 인게임 구현
- [ ] 사운드/BGM
- [ ] PvP 시스템
- [ ] 길드 시스템
- [ ] 더 큰 오픈월드 맵 (추가 맵)
- [ ] 보스 전투 패턴
- [ ] 날씨/낮밤 주기 시각 효과
- [ ] 제작(crafting) 시스템
- [ ] 파티/동료 시스템

---

## Coding Conventions

- ES Modules (import/export)
- Phaser Scene classes extend `Phaser.Scene`
- Entity classes extend `Phaser.Physics.Arcade.Sprite`
- System classes are plain JS classes receiving `scene` in constructor (MapTransitionSystem은 static methods)
- Korean display names in `nameKo`, English keys in `name`/`id`
- Data constants use UPPER_SNAKE_CASE
- Real sprite assets in public/assets/ (loaded in BootScene.preload())
- Programmatic textures in BootScene.create() as fallback
- Custom sprites stored in localStorage, loaded via CustomSpriteLoader
- Save data versioned (version: 1) for future migration
- Weapon items have baseATK, baseATK_SPEED, baseRange; armor has baseDEF
