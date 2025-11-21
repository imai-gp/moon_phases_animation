import { PhaseType, PhaseInfo } from './types';

export const PHASE_DATA: PhaseInfo[] = [
  {
    type: PhaseType.NEW_MOON,
    angle: 0,
    description: "The moon is between the Earth and the Sun.",
    kidDescription: "お月さまは、地球と太陽のあいだにいるよ。太陽の光が当たる場所が向こう側だから、地球からは真っ暗で見えないんだ。",
  },
  {
    type: PhaseType.WAXING_CRESCENT,
    angle: 45,
    description: "A sliver of the moon becomes visible.",
    kidDescription: "夕方の西の空に見える細いお月さまだよ。これからだんだん丸くなっていくよ。",
  },
  {
    type: PhaseType.FIRST_QUARTER,
    angle: 90,
    description: "Half of the moon is visible.",
    kidDescription: "右半分が光っているお月さまだよ。お昼ごろにのぼって、真夜中にしずむんだ。",
  },
  {
    type: PhaseType.WAXING_GIBBOUS,
    angle: 135,
    description: "Most of the moon is visible.",
    kidDescription: "満月まであと少し！とても明るくて、形が少しふくらんで見えるね。",
  },
  {
    type: PhaseType.FULL_MOON,
    angle: 180,
    description: "The entire face of the moon is illuminated.",
    kidDescription: "お月さま、地球、太陽が一直線にならんでいるよ。お月さまの全体に光が当たって、まんまるに見えるね！",
  },
  {
    type: PhaseType.WANING_GIBBOUS,
    angle: 225,
    description: "The moon starts to shrink.",
    kidDescription: "満月をすぎて、少しずつ欠けてきたお月さまだよ。",
  },
  {
    type: PhaseType.LAST_QUARTER,
    angle: 270,
    description: "The other half of the moon is visible.",
    kidDescription: "左半分が光っているお月さまだよ。真夜中にのぼって、お昼ごろにしずむんだ。",
  },
  {
    type: PhaseType.WANING_CRESCENT,
    angle: 315,
    description: "Only a sliver remains before the new moon.",
    kidDescription: "夜明け前の東の空に見える、細いお月さまだよ。もうすぐ新月にもどるね。",
  },
];

export const ORBIT_RADIUS = 120;
export const MOON_RADIUS = 15;
export const EARTH_RADIUS = 30;
export const SUN_RADIUS = 40; // Visual representation only, not to scale
