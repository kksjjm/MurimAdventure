# 무림기행 (Murim Adventure) - Project Documentation

## Overview

동양풍 2D 픽셀아트 오픈월드 무협 RPG 게임.
Phaser 3 기반 웹 게임 + 관리자 패널을 Vite로 번들링하여 브라우저에서 실행.

## Tech Stack

- **Game Engine**: Phaser 3 (HTML5 Canvas, Arcade Physics)
- **Bundler**: Vite 5
- **Language**: Vanilla JavaScript (ES Modules)
- **Admin Panel**: Vanilla JS + inline CSS (SPA)
- **Data Storage**: localStorage (admin), in-memory (game)
- **Assets**: 프로그래밍 방식으로 생성 (BootScene에서 Graphics API로 텍스처 생성)

## How to Run

```bash
npm install
npm run dev
```

- **Game**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin.html

## Game Controls

| Key | Action |
|-----|--------|
| W/A/S/D or Arrow Keys | 4방향 이동 (상/하/좌/우) |
| Space | 기본공격 (방향 기반 대상 자동 타겟팅) |
| 1-5 | 스킬 슬롯 사용 |
| I | 인벤토리 열기 |
| E | 장비창 열기 |
| K | 무공(스킬) 창 열기 |
| C | 캐릭터 정보 열기 |
| M | 미니맵 토글 |
| ESC | 패널 닫기 |
| Mouse Click | 몬스터 클릭 공격 |

---

## File Structure & Roles

```
MurimAdventure/
├── package.json              # Dependencies (phaser, vite)
├── vite.config.js            # Multi-page build (game + admin)
├── index.html                # Game entry HTML
├── admin.html                # Admin panel entry HTML
│
├── src/
│   ├── data/                 # === Game Data Definitions ===
│   │   ├── constants.js      # All game enums & constants
│   │   ├── defaultData.js    # Sample items/skills/monsters/config
│   │   └── gameConfig.js     # Phaser config, balance formulas
│   │
│   ├── game/                 # === Game Client ===
│   │   ├── main.js           # Phaser game entry point
│   │   │
│   │   ├── scenes/
│   │   │   ├── BootScene.js      # Generates ALL pixel art textures
│   │   │   ├── PreloadScene.js   # Data loading + title screen
│   │   │   ├── WorldScene.js     # Main game world (map, input, spawning)
│   │   │   └── UIScene.js        # HUD overlay (bars, panels, menus)
│   │   │
│   │   ├── entities/
│   │   │   ├── Player.js         # Player (stats, equipment, skills, combat)
│   │   │   └── Monster.js        # Monster (AI, drops, health bar)
│   │   │
│   │   └── systems/
│   │       ├── CombatSystem.js           # Damage/hit/crit calculations
│   │       ├── ProficiencySystem.js      # Weapon/skill proficiency tracking
│   │       ├── SkillCombinationSystem.js # Skill fusion/combination
│   │       └── ImpactSystem.js           # Visual attack/skill effects
│   │
│   └── admin/                # === Admin Panel ===
│       ├── admin.js          # SPA controller + dashboard
│       │
│       ├── components/
│       │   └── DataManager.js    # localStorage CRUD, JSON import/export
│       │
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

## Data Architecture

### constants.js - Game Enums
- `STATS` (16종): HP, MP, STR, AGI, INT, LUK, DEF, ATK, EVASION, ACCURACY, CRIT_RATE, CRIT_DMG, SPIRIT, ITEM_FIND, MOVE_SPEED, ATK_SPEED
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
- 무기 6종 (철검, 월아도, 쌍단검, 천마검, 용린창, 공허선)
- 방어구 4종 + 장신구 4종
- 스킬 13종 (심법 2, 내가무공 3, 외가무공 3, 경공 2, 주술 3)
- 몬스터 6종 (야생 멧돼지 Lv.1 ~ 혈마왕 Lv.50)
- 스킬 합성 레시피 3종
- 플레이어 기본 스탯, 레벨업 성장치, 경험치 공식

---

## Core Systems

### Combat System (CombatSystem.js)
- `calculateDamage()`: ATK 기반 + 스킬 스케일링 + 숙련도 보너스 - DEF 감쇄
- `calculateHit()`: 명중률 vs 회피율 (30~100% 클램핑)
- `calculateCrit()`: 크리티컬 확률 + 크리티컬 데미지 배율
- `performAttack()`: 전체 공격 시퀀스 (명중 → 데미지 → 크리 → 적용)
- 부동 데미지 숫자 + MISS 텍스트

### Proficiency System (ProficiencySystem.js)
- 무기별/스킬별 숙련도 경험치 추적
- 7단계 숙련도 레벨 (입문 → 초월)
- 숙련도에 따른 스탯 보너스 계산
- 레벨업 이벤트 발생

### Skill Combination System (SkillCombinationSystem.js)
- 스킬 합성 레시피 기반
- 재료 스킬 보유 + 숙련도 요구사항 체크
- 성공 시 새로운 스킬 생성

### Impact System (ImpactSystem.js)
- **기본공격 이펙트**: 무기 타입별 (한손검 = 슬래시, 양손 = 헤비슬래시, 쌍수 = 더블슬래시)
- **스킬 이펙트**: 원소/카테고리별 자동 매핑 (화염, 빙결, 번개, 기파, 암흑 등)
- **버프/힐 이펙트**: 회복 파티클 + 크로스 심볼
- **피격 이펙트**: 히트 플래시, 화면 흔들림, 히트 파티클
- **빗나감 이펙트**: 허공 슬래시

### Equipment Visual System (Player.js)
- 장비 슬롯별 레이어 스프라이트 오버레이
- 등급(RARITY)에 따른 틴트 컬러 적용
- 무기 타입에 따른 무기 텍스처 자동 선택
- 플레이어 이동 시 레이어 위치 동기화

---

## Sprite System

모든 텍스처는 BootScene.js에서 Phaser Graphics API로 프로그래밍 생성:

- **캐릭터 (64x64)**: 상투 스타일 무협 캐릭터, 도복, 띠, 신발 디테일
- **장비 레이어 (64x64)**: 무기 4종(검/창/쌍수/지팡이), 투구 2종, 갑옷 2종, 방패, 장갑, 신발, 허리띠, 목걸이, 부적
- **몬스터 (64x64)**: 멧돼지, 산적, 늑대, 독사 (디테일한 픽셀아트)
- **타일 (32x32)**: 풀, 흙, 돌, 물, 벽, 나무
- **아이템 아이콘 (16x16)**: 검, 지팡이, 갑옷, 물약
- **임팩트 이펙트 (96x96)**: 슬래시, 헤비슬래시, 주먹, 기파, 화염, 빙결, 번개, 암흑, 회복
- **기본 스킬 이펙트 (64x64)**: 빨강, 파랑, 초록, 노랑, 보라 원형 이펙트

---

## Physics & Collision

- 플레이어 ↔ 벽/나무/물 충돌 (통과 불가)
- 플레이어 ↔ 몬스터 충돌 (서로 통과 불가)
- 몬스터 ↔ 몬스터 충돌 (서로 통과 불가)
- 몬스터 ↔ 벽 충돌
- 플레이어 ↔ 아이템 픽업 (오버랩)

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

---

## Implementation Status

### Completed
- [x] 프로젝트 구조 및 빌드 시스템
- [x] 게임 데이터 모델 (상수, 샘플 데이터, 밸런스 공식)
- [x] 프로그래밍 방식 64x64 고해상도 스프라이트 생성
- [x] 장비 시각 표시 레이어 시스템
- [x] 4방향 이동 (WASD/방향키) + 방향 바라보기
- [x] 스페이스바 기본공격 (방향 기반 자동 타겟팅)
- [x] 임팩트 이펙트 시스템 (기본공격/스킬/버프/피격)
- [x] 전투 시스템 (데미지/명중/크리티컬 계산)
- [x] 숙련도 시스템 (무기/스킬 7단계)
- [x] 스킬 합성 시스템
- [x] 몬스터 AI (대기/배회/추적/공격)
- [x] 플레이어 ↔ 몬스터 충돌 (서로 통과 불가)
- [x] HUD (HP/MP/EXP 바, 스킬 슬롯, 메뉴 버튼)
- [x] 인벤토리/장비/스킬/캐릭터 정보 패널
- [x] 아이템 드랍 및 픽업
- [x] 경험치/레벨업 시스템
- [x] 미니맵
- [x] 관리자 패널 (11개 에디터)

### TODO (Future)
- [ ] 실제 픽셀아트 스프라이트시트 교체
- [ ] 캐릭터 걷기/공격 애니메이션 프레임
- [ ] NPC 대화 시스템
- [ ] 퀘스트 인게임 구현
- [ ] 상점 시스템
- [ ] 인벤토리 드래그&드롭
- [ ] 탈것/환수 인게임 구현
- [ ] 다중 맵 전환
- [ ] 사운드/BGM
- [ ] 세이브/로드 시스템 (localStorage)
- [ ] PvP 시스템
- [ ] 길드 시스템
- [ ] 더 큰 오픈월드 맵
- [ ] 보스 전투 패턴
- [ ] 날씨/낮밤 주기 시각 효과

---

## Coding Conventions

- ES Modules (import/export)
- Phaser Scene classes extend `Phaser.Scene`
- Entity classes extend `Phaser.Physics.Arcade.Sprite`
- System classes are plain JS classes receiving `scene` in constructor
- Korean display names in `nameKo`, English keys in `name`/`id`
- Data constants use UPPER_SNAKE_CASE
- All textures generated in BootScene (no external image files)
