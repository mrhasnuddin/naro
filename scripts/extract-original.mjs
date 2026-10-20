// Read public bundle literals as an AST; never execute the downloaded application.
import fs from 'node:fs/promises';
import path from 'node:path';
import { parsers } from '../frontend/node_modules/prettier/plugins/babel.mjs';
import { format } from '../frontend/node_modules/prettier/index.mjs';
const dir = '.audit/original';
function literal(n) {
  if (n.type === 'StringLiteral' || n.type === 'NumericLiteral' || n.type === 'BooleanLiteral') return n.value;
  if (n.type === 'NullLiteral') return null;
  if (n.type === 'TemplateLiteral' && n.expressions.length === 0) return n.quasis[0].value.cooked;
  if (n.type === 'ArrayExpression') return n.elements.map(literal);
  if (n.type === 'ObjectExpression') return Object.fromEntries(n.properties.map(p => {
    if (p.type !== 'ObjectProperty' || p.computed || p.method) throw Error('Nonliteral property');
    return [p.key.name ?? p.key.value, literal(p.value)];
  }));
  throw Error(`Nonliteral ${n.type}`);
}
const text = await fs.readFile(path.join(dir, 'i18n-BKeFymkU.js'), 'utf8');
const ast = parsers.babel.parse(text);
const bindings = new Map();
for (const n of ast.program.body) if (n.type === 'VariableDeclaration') for (const d of n.declarations) {
  if (d.id.type === 'Identifier') bindings.set(d.id.name, d.init);
}
const sources = {en:'se', 'zh-Hans':'J', 'zh-Hant':'oe',ko:'ce',ja:'le',vi:'ue',hi:'Y',ur:'de',id:'fe'};
const catalogs = {};
const flatten = (obj, prefix='', result={}) => {
  for (const [k,v] of Object.entries(obj)) typeof v === 'object' && v !== null ? flatten(v,prefix+k+'.',result) : result['orig.'+prefix+k]=String(v);
  return result;
};
for (const [lang, name] of Object.entries(sources)) catalogs[lang] = flatten(literal(bindings.get(name)));
await fs.mkdir('frontend/src/parity', {recursive:true});
await fs.writeFile('frontend/src/parity/original-catalogs.json', JSON.stringify(catalogs,null,2)+'\n');
for (const name of await fs.readdir(dir)) if (name.endsWith('.js')) {
  await fs.writeFile(path.join(dir,name+'.pretty'), await format(await fs.readFile(path.join(dir,name),'utf8'),{parser:'babel'}));
}
console.log(Object.fromEntries(Object.entries(catalogs).map(([k,v])=>[k,Object.keys(v).length])));
