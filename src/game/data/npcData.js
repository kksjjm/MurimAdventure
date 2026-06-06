// =============================================================================
// npcData.js - NPC definitions for Murim Adventure village
// =============================================================================

export const NPC_LIST = Object.freeze([
  {
    id: 'npc_village_elder',
    nameKo: '촌장',
    name: 'Village Elder',
    type: 'quest',
    texture: 'npc_elder',
    dialogues: {
      default: [
        '어서 오게, 젊은 무인이여.',
        '이 마을은 최근 짐승과 산적들로 인해 위험해지고 있다네.',
        '자네가 도와줄 수 있겠는가?',
      ],
      quest_available: [
        '마을 주변에 멧돼지들이 출몰하고 있네.',
        '멧돼지 3마리를 처치해 주겠는가?',
      ],
      quest_complete: [
        '고맙네! 덕분에 마을이 안전해졌구먼.',
        '이것은 보답일세. 받아 주게.',
      ],
      quest_04_available: [
        '대장장이에게 전할 말이 있네.',
        '그에게 가서 새 검을 하나 받아 오게나.',
      ],
      quest_04_complete: [
        '대장장이에게 다녀왔는가? 잘 했네.',
      ],
    },
    quests: ['quest_01', 'quest_04'],
    shopType: null,
    position: { x: 12, y: 10 },
  },

  {
    id: 'npc_blacksmith',
    nameKo: '대장장이',
    name: 'Blacksmith',
    type: 'shop_weapon',
    texture: 'npc_blacksmith',
    dialogues: {
      default: [
        '어서 와라! 좋은 무기가 많다.',
        '무엇이 필요한가?',
      ],
      shop: [
        '마음에 드는 것이 있으면 말해라.',
      ],
    },
    quests: [],
    shopType: 'weapon',
    position: { x: 16, y: 8 },
  },

  {
    id: 'npc_merchant',
    nameKo: '상인',
    name: 'Merchant',
    type: 'shop_general',
    texture: 'npc_merchant',
    dialogues: {
      default: [
        '이히히, 손님이로군!',
        '약초부터 장신구까지, 없는 게 없다네.',
      ],
      shop: [
        '천천히 둘러보시게나.',
      ],
    },
    quests: [],
    shopType: 'general',
    position: { x: 20, y: 10 },
  },

  {
    id: 'npc_guard',
    nameKo: '경비병',
    name: 'Guard',
    type: 'quest',
    texture: 'npc_guard',
    dialogues: {
      default: [
        '무림의 치안을 지키는 것이 나의 임무다.',
        '최근 산적들이 마을 근처까지 내려오고 있어 걱정이다.',
      ],
      quest_available: [
        '산적들이 마을 근처에 나타나고 있소.',
        '산적 2명을 처치해 주시오. 사례는 충분히 하겠소.',
      ],
      quest_complete: [
        '산적들을 처치했소? 대단하오!',
        '약속대로 보상을 드리겠소.',
      ],
    },
    quests: ['quest_02'],
    shopType: null,
    position: { x: 24, y: 12 },
  },

  {
    id: 'npc_herbalist',
    nameKo: '약초꾼',
    name: 'Herbalist',
    type: 'quest',
    texture: 'npc_merchant',
    dialogues: {
      default: [
        '산에서 좋은 약초를 찾고 있다네.',
        '혹시 약초를 구해올 수 있겠는가?',
      ],
      quest_available: [
        '이 근처 숲에서 약초 3개를 채집해 주게.',
        '보답으로 회복약을 넉넉히 주겠네.',
      ],
      quest_complete: [
        '오! 이 약초들이면 충분하겠구먼.',
        '약속대로 회복약을 주겠네. 고맙네!',
      ],
    },
    quests: ['quest_03'],
    shopType: null,
    position: { x: 14, y: 14 },
  },
]);

/**
 * Quick lookup map by NPC id
 */
export const NPC_BY_ID = Object.freeze(
  Object.fromEntries(NPC_LIST.map(npc => [npc.id, npc]))
);
