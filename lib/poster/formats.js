// Design sizes. w/h are editor pixels; mm (when set) is the real print size used for PDF pages.
export const FORMATS = [
  { key: 'poster-a4', name: 'Poster A4', group: 'Print', w: 794, h: 1123, mm: [210, 297] },
  { key: 'poster-a3', name: 'Poster A3', group: 'Print', w: 1123, h: 1587, mm: [297, 420] },
  { key: 'flyer-a5', name: 'Pamphlet / Flyer A5', group: 'Print', w: 559, h: 794, mm: [148, 210] },
  { key: 'invitation', name: 'Invitation card 5×7 in', group: 'Print', w: 750, h: 1050, mm: [127, 178] },
  { key: 'business-card', name: 'Business card', group: 'Print', w: 1050, h: 600, mm: [89, 51] },
  { key: 'certificate', name: 'Certificate (A4 landscape)', group: 'Print', w: 1123, h: 794, mm: [297, 210] },
  { key: 'flex-banner', name: 'Flex banner 6×3 ft', group: 'Print', w: 1800, h: 900, mm: [1829, 914] },
  { key: 'hoarding', name: 'Hoarding 3:1', group: 'Print', w: 2400, h: 800, mm: [3048, 1016] },
  { key: 'standee', name: 'Roll-up standee', group: 'Print', w: 750, h: 1800, mm: [762, 1829] },
  { key: 'insta-post', name: 'Instagram post', group: 'Social', w: 1080, h: 1080 },
  { key: 'insta-portrait', name: 'Instagram portrait', group: 'Social', w: 1080, h: 1350 },
  { key: 'story', name: 'Story / WhatsApp status', group: 'Social', w: 1080, h: 1920 },
  { key: 'fb-post', name: 'Facebook post', group: 'Social', w: 1200, h: 630 },
  { key: 'fb-cover', name: 'Facebook cover', group: 'Social', w: 1640, h: 624 },
  { key: 'yt-thumb', name: 'YouTube thumbnail', group: 'Social', w: 1280, h: 720 },
  { key: 'ad-rect', name: 'Display ad 300×250', group: 'Ads', w: 600, h: 500 },
  { key: 'ad-leader', name: 'Leaderboard ad 728×90', group: 'Ads', w: 1456, h: 180 },
];

export const getFormat = (key) => FORMATS.find((f) => f.key === key) || FORMATS[0];
