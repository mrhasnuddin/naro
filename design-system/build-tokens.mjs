import { readFile, writeFile } from 'node:fs/promises';

const source = JSON.parse(await readFile(new URL('./tokens.json', import.meta.url), 'utf8'));
const rows = [];
for (const [group, values] of Object.entries(source)) {
  if (group.startsWith('$')) continue;
  for (const [name, token] of Object.entries(values)) {
    const value = token.$value;
    let css;
    if (token.$type === 'fontFamily') css = value.map(v => v.includes(' ') ? `"${v}"` : v).join(', ');
    else if (token.$type === 'cubicBezier') css = `cubic-bezier(${value.join(', ')})`;
    else if (token.$type === 'dimension' || token.$type === 'duration') css = `${value.value}${value.unit}`;
    else css = String(value);
    if (css.includes('undefined') || css.includes('[object Object]')) throw new Error(`Unsupported token: ${group}.${name}`);
    rows.push(`  --naro-${group}-${name}: ${css};`);
  }
}
const css = `/* Generated from tokens.json by build-tokens.mjs. NARO revamp v1 proposal. */\n:root {\n  color-scheme: dark;\n${rows.join('\n')}\n}\n`;
const target = new URL('./tokens.css', import.meta.url);
if (process.argv.includes('--check')) {
  if (await readFile(target, 'utf8') !== css) throw new Error('tokens.css is out of sync; run node design-system/build-tokens.mjs');
  console.log(`PASS: ${rows.length} tokens match generated CSS.`);
} else {
  await writeFile(target, css);
  console.log(`Generated ${rows.length} CSS custom properties.`);
}
