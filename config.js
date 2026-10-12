// CONFIG - single source of truth
const BASENAME = 'hadith-video';
const FPS = 30;
const RATIOS = {
  '9x16': { w: 1080, h: 1920, w4k: 2160, h4k: 3840, wHd: 720, hHd: 1280 },
  '16x9': { w: 1920, h: 1080, w4k: 3840, h4k: 2160, wHd: 1280, hHd: 720 },
  '1x1':  { w: 1080, h: 1080, w4k: 2160, h4k: 2160, wHd: 720, hHd: 720 },
  '4x5':  { w: 1080, h: 1350, w4k: 2160, h4k: 2700, wHd: 720, hHd: 900 },
  '3x4':  { w: 1080, h: 1440, w4k: 2160, h4k: 2880, wHd: 720, hHd: 960 },
  '4x3':  { w: 1440, h: 1080, w4k: 2880, h4k: 2160, wHd: 960, hHd: 720 },
};
const TIERS = {
  '4k':  { crf: 20, suffix: '4k' },
  'fhd': { crf: 18, suffix: 'fhd' },
  'hd':  { crf: 20, suffix: 'hd' },
};
const APP_NAME = 'ইসলামী বিশ্বকোষ ও আল হাদিস S2';
const APP_NAME_EN = 'Islami Bishwakosh & Al Hadith S2';
const CTA_BN = 'আজই প্লে স্টোর থেকে ইনস্টল করুন';
