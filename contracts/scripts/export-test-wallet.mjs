// Run interactively to export an encrypted JSON keystore for wallet import.
// Neither the password nor private key is printed or passed on a command line.
import {Wallet} from 'ethers';
import {spawnSync} from 'node:child_process';
import {readFile,writeFile,access} from 'node:fs/promises';
import {emitKeypressEvents} from 'node:readline';
if(process.platform!=='win32'||!process.stdin.isTTY)throw new Error('Run this command in an interactive Windows terminal.');
const keyPath=new URL('../.local/test-wallet.dpapi',import.meta.url);
const output=new URL('../.local/naro-test-wallet.keystore.json',import.meta.url);
try{await access(output);throw new Error('An export already exists. Move it to your wallet before making another export.');}catch(error){if(error.code!=='ENOENT')throw error;}
emitKeypressEvents(process.stdin);
const secret=prompt=>new Promise((resolve,reject)=>{
 process.stdout.write(prompt);let value='';process.stdin.setRawMode(true);process.stdin.resume();
 const finish=error=>{process.stdin.off('keypress',listener);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');error?reject(error):resolve(value);};
 const listener=(character,key)=>{
  if(key?.ctrl&&key.name==='c'){finish(new Error('Cancelled'));return;}
  if(key?.name==='return'||key?.name==='enter'){finish();return;}
  if(key?.name==='backspace'){value=Array.from(value).slice(0,-1).join('');return;}
  if(key?.ctrl||key?.meta||key?.sequence?.startsWith('\u001b'))return;
  if(character&& !/[\u0000-\u001f\u007f]/.test(character))value+=character;
 };
 process.stdin.on('keypress',listener);
});
const password=await secret('Choose an export password (at least 12 characters; input hidden): ');
if(password.length<12)throw new Error('Use at least 12 characters.');
if(password!==await secret('Repeat password: '))throw new Error('Passwords do not match.');
const encrypted=await readFile(keyPath);
const unprotected=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command','Add-Type -AssemblyName System.Security; $encrypted=[Convert]::FromBase64String([Console]::In.ReadToEnd()); $keyBytes=[Security.Cryptography.ProtectedData]::Unprotect($encrypted,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser); [Console]::Out.Write([Text.Encoding]::UTF8.GetString($keyBytes)); [Array]::Clear($keyBytes,0,$keyBytes.Length)'],{input:encrypted.toString('base64'),encoding:'utf8',windowsHide:true});
if(unprotected.status!==0||!/^0x[0-9a-f]{64}$/i.test(unprotected.stdout.trim()))throw new Error('Windows could not unlock this wallet.');
const wallet=new Wallet(unprotected.stdout.trim());
const keystore=await wallet.encrypt(password);
await writeFile(output,keystore,{flag:'wx'});
console.log('Encrypted JSON keystore saved under contracts/.local/naro-test-wallet.keystore.json');
console.log('Wallet address: '+wallet.address);
