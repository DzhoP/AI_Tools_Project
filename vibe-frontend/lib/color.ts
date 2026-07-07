// Връща четим цвят за текст (тъмен или бял) според яркостта на фона.
// Използва YIQ формулата — стандартен подход за контраст на цветни badge-ове.
export function textOn(bgHex: string): string {
  const hex = bgHex.replace('#', '');
  if (hex.length !== 6) return '#ffffff';

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '#111827' : '#ffffff';
}
