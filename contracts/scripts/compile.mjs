import solc from 'solc';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import path from 'node:path';
const sources={};
for(const file of ['DemoNaroToken.sol','NaroDemo.sol'])sources[`src/${file}`]={content:(await readFile(`src/${file}`,'utf8')).replace(/^\uFEFF/,'')};
const input={language:'Solidity',sources,settings:{optimizer:{enabled:true,runs:200},evmVersion:'paris',outputSelection:{'*':{'*':['abi','evm.bytecode.object','evm.deployedBytecode.object','storageLayout','metadata']}}}};
const output=JSON.parse(solc.compile(JSON.stringify(input),{import:filename=>{
 try{
  if(!filename.startsWith('@openzeppelin/contracts/'))return {error:'Unsupported import'};
  return {contents:readFileSync(path.join('node_modules',filename),'utf8')};
 }catch{return {error:'Missing dependency'};}
}}));
const errors=(output.errors||[]).filter(error=>error.severity==='error');
if(errors.length)throw new Error(errors.map(error=>error.formattedMessage).join('\n'));
await mkdir('artifacts',{recursive:true});
for(const name of ['DemoNaroToken','NaroDemo']){
 const contract=output.contracts[`src/${name}.sol`][name];
 await writeFile(`artifacts/${name}.json`,JSON.stringify({contractName:name,compiler:solc.version(),abi:contract.abi,bytecode:'0x'+contract.evm.bytecode.object,deployedBytecode:'0x'+contract.evm.deployedBytecode.object,storageLayout:contract.storageLayout,metadata:contract.metadata},null,2)+'\n');
}
await writeFile('artifacts/compiler-input.json',JSON.stringify(input,null,2)+'\n');
const system=JSON.parse(await readFile('artifacts/NaroDemo.json','utf8'));
const token=JSON.parse(await readFile('artifacts/DemoNaroToken.json','utf8'));
await writeFile('../frontend/src/demo/abi.json',JSON.stringify({system:system.abi,token:token.abi,bytecode:system.bytecode},null,2)+'\n');
console.log(`Compiled two demo contracts with ${solc.version()} (optimizer 200, EVM paris).`);
