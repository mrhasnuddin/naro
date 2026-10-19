import { readFile } from 'node:fs/promises';
const { color } = JSON.parse(await readFile(new URL('./tokens.json', import.meta.url), 'utf8'));
const c = Object.fromEntries(Object.entries(color).map(([name, token]) => [name, token.$value]));
function luminance(hex) {
  if (!/^#[\da-f]{6}$/i.test(hex)) throw new Error(`Expected opaque sRGB color, got ${hex}`);
  const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}
function contrast(fg, bg) {
  const a = luminance(c[fg]), b = luminance(c[bg]);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}
const checks = [];
for (const fg of ['text', 'strong', 'secondary', 'muted']) {
  for (const bg of ['canvas', 'surface', 'raised', 'overlay', 'inset']) checks.push([fg, bg, 4.5]);
}
for (const fg of ['brand', 'brand-hover', 'brand-pressed']) checks.push(['on-brand', fg, 4.5]);
for (const status of ['success', 'warning', 'error', 'info']) checks.push([status, `${status}-surface`, 4.5]);
for (const bg of ['surface', 'raised', 'overlay', 'inset']) {
  checks.push(['border-control', bg, 3]);
  checks.push(['focus', bg, 3]);
}
checks.push(['brand', 'selected', 4.5]);
const report = checks.map(([foreground, background, minimum]) => ({
  foreground, background, minimum, ratio: Number(contrast(foreground, background).toFixed(2)),
  pass: contrast(foreground, background) >= minimum
}));
const failed = report.filter(pair => !pair.pass);
if (process.argv.includes('--json')) console.log(JSON.stringify({ checks: report.length, failed: failed.length, pairs: report }, null, 2));
else {
  console.log(`${failed.length ? 'FAIL' : 'PASS'}: ${report.length} text, action, status, control-boundary, and focus contrast pairs.`);
  for (const pair of failed) console.error(pair);
  console.log('Scope: token pairs only. This does not establish complete interface accessibility. Disabled controls and decorative separators are excluded.');
}
if (failed.length) process.exitCode = 1;
