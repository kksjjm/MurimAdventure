// =============================================================================
// questData.js - Quest definitions for Murim Adventure
// =============================================================================

export const QUESTS = Object.freeze({
  quest_01: {
    id: 'quest_01',
    nameKo: '마을 수호',
    name: 'Village Protection',
    description: '마을 주변에 출몰하는 멧돼지를 처치하여 마을을 안전하게 지켜주세요.',
    objectives: [
      { type: 'kill', target: 'mon_wild_boar', targetNameKo: '멧돼지', count: 3, current: 0 },
    ],
    rewards: {
      exp: 50,
      gold: 30,
      items: [],
    },
  },

  quest_02: {
    id: 'quest_02',
    nameKo: '산적 토벌',
    name: 'Bandit Subjugation',
    description: '산적들이 마을 근처까지 내려왔습니다. 산적 2명을 처치해 주세요.',
    objectives: [
      { type: 'kill', target: 'mon_mountain_bandit', targetNameKo: '산적', count: 2, current: 0 },
    ],
    rewards: {
      exp: 100,
      gold: 50,
      items: [{ itemId: 'wpn_crescent_blade', quantity: 1 }],
    },
  },

  quest_03: {
    id: 'quest_03',
    nameKo: '약초 채집',
    name: 'Herb Gathering',
    description: '약초꾼에게 약초 3개를 구해다 주세요. 숲에서 약초를 채집할 수 있습니다.',
    objectives: [
      { type: 'collect', target: 'mat_herb', targetNameKo: '약초', count: 3, current: 0 },
    ],
    rewards: {
      exp: 80,
      gold: 40,
      items: [{ itemId: 'item_hp_potion', quantity: 3 }],
    },
  },

  quest_04: {
    id: 'quest_04',
    nameKo: '대장장이의 부탁',
    name: "Blacksmith's Request",
    description: '촌장이 대장장이에게 전할 말이 있다고 합니다. 대장장이를 찾아가 보세요.',
    objectives: [
      { type: 'talk', target: 'npc_blacksmith', targetNameKo: '대장장이', count: 1, current: 0 },
    ],
    rewards: {
      exp: 30,
      gold: 0,
      items: [{ itemId: 'wpn_iron_sword', quantity: 1 }],
    },
  },
});

export const QUESTS_BY_ID = QUESTS;
