export enum PhaseType {
  NEW_MOON = "新月 (しんげつ)",
  WAXING_CRESCENT = "三日月 (みかづき)",
  FIRST_QUARTER = "上弦の月 (じょうげんのつき)",
  WAXING_GIBBOUS = "十三夜 (じゅうさんや)",
  FULL_MOON = "満月 (まんげつ)",
  WANING_GIBBOUS = "十八夜 (じゅうはちや)",
  LAST_QUARTER = "下弦の月 (かげんのつき)",
  WANING_CRESCENT = "二十六夜 (にじゅうろくや)",
}

export interface PhaseInfo {
  type: PhaseType;
  angle: number; // 0-360
  description: string;
  kidDescription: string;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
}